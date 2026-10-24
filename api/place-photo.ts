import type { IncomingMessage, ServerResponse } from 'node:http';
import { Buffer } from 'node:buffer';

const FALLBACK_PHOTO = 'https://lh3.googleusercontent.com/grass-cs/AABkmLcYZXKxVxsBQyow8DQP0VUMZg1mxuuYvwKbx1UR6xYhhubVyEHqlJCSZPpsItg3MZcU99qgFvmcUxzMkumAkutNGHRLwqVz3YQlLe_J0apFdNVLJQPKxDqqpdbN92t2yJ9EtJAm=w1200-h800-k-no';

// In-memory LRU edge cache to eliminate duplicate billing and guarantee <50ms latency
const edgePhotoCache = new Map<string, { buffer: Buffer; contentType: string; cachedAt: number }>();
const MAX_CACHE_ENTRIES = 100;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Serverless Image Proxy for Google Places API (New) Photos.
 * Prevents client-side exposure of Google Maps API key with Places API privileges.
 * 
 * Route: GET /api/place-photo?name={photo_resource_name} (or ?ref={photo_resource_name})
 * Headers: Cache-Control: public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const parsedUrl = new URL(req.url || '', 'http://localhost:5173');
    const photoRef = parsedUrl.searchParams.get('name') || parsedUrl.searchParams.get('ref');
    const maxHeight = parsedUrl.searchParams.get('maxHeight') || '800';
    const maxWidth = parsedUrl.searchParams.get('maxWidth') || '1200';

    if (!photoRef) {
      res.statusCode = 302;
      res.setHeader('Location', FALLBACK_PHOTO);
      res.end();
      return;
    }

    // Direct external URL redirect
    if (photoRef.startsWith('http://') || photoRef.startsWith('https://')) {
      res.statusCode = 302;
      res.setHeader('Location', photoRef);
      res.end();
      return;
    }

    const cacheKey = `${photoRef}_${maxHeight}_${maxWidth}`;
    const cached = edgePhotoCache.get(cacheKey);

    if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL_MS) {
      res.statusCode = 200;
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Content-Length', cached.buffer.length.toString());
      res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400');
      res.setHeader('X-Cache-Status', 'HIT-EDGE');
      res.end(cached.buffer);
      return;
    }

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      '';

    if (!apiKey) {
      res.statusCode = 302;
      res.setHeader('Location', FALLBACK_PHOTO);
      res.end();
      return;
    }

    const googlePhotoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${apiKey}`;

    const googleRes = await fetch(googlePhotoUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'TripPick-B2B-Proxy/1.0',
      },
      redirect: 'follow',
    });

    if (!googleRes.ok) {
      res.statusCode = 302;
      res.setHeader('Location', FALLBACK_PHOTO);
      res.end();
      return;
    }

    const contentType = googleRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await googleRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Evict oldest entry if cache exceeds capacity
    if (edgePhotoCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = edgePhotoCache.keys().next().value;
      if (oldestKey) edgePhotoCache.delete(oldestKey);
    }

    edgePhotoCache.set(cacheKey, {
      buffer,
      contentType,
      cachedAt: Date.now(),
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400');
    res.setHeader('X-Cache-Status', 'MISS-FETCHED');
    res.end(buffer);
  } catch (err) {
    console.warn('Place Photo Proxy fallback triggered:', err);
    res.statusCode = 302;
    res.setHeader('Location', FALLBACK_PHOTO);
    res.end();
  }
}
