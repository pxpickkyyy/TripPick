import type { IncomingMessage, ServerResponse } from 'node:http';
import { Buffer } from 'node:buffer';

const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80';

/**
 * Serverless Image Proxy for Google Places API (New) Photos.
 * Prevents client-side exposure of Google Maps API key with Places API privileges.
 * 
 * Route: GET /api/place-photo?ref={photoName}&maxHeight=800&maxWidth=1200
 * Caches responses on CDN / Client for 24 hours (86,400s) to minimize quota consumption.
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
    const photoRef = parsedUrl.searchParams.get('ref');
    const maxHeight = parsedUrl.searchParams.get('maxHeight') || '800';
    const maxWidth = parsedUrl.searchParams.get('maxWidth') || '1200';

    if (!photoRef) {
      res.statusCode = 302;
      res.setHeader('Location', FALLBACK_PHOTO);
      res.end();
      return;
    }

    // If already a full URL (e.g. Unsplash), redirect directly
    if (photoRef.startsWith('http://') || photoRef.startsWith('https://')) {
      res.statusCode = 302;
      res.setHeader('Location', photoRef);
      res.end();
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
      // If Google returns non-200, smoothly fallback to high-res retreat image
      res.statusCode = 302;
      res.setHeader('Location', FALLBACK_PHOTO);
      res.end();
      return;
    }

    const contentType = googleRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await googleRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400');
    res.end(buffer);
  } catch (err) {
    console.warn('Place Photo Proxy fallback triggered:', err);
    res.statusCode = 302;
    res.setHeader('Location', FALLBACK_PHOTO);
    res.end();
  }
}
