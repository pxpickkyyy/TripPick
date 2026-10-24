import type { TravelDestination } from '../lib/travelDestinations.ts';
import { CURATED_RESERVE_CATALOG } from '../lib/reserveCatalog.ts';

export interface DestinationBatchRequest {
  archetype?: 'coastal' | 'mountain' | 'urban' | 'regional_apac';
  vibe?: string;
  headcount?: number;
  maxBudgetPerHead?: number;
  minBudgetPerHead?: number;
  excludedPlaceIds?: string[];
  excludedNames?: string[];
  batchVersion?: number;
}

export interface DestinationBatchResponse {
  destinations: TravelDestination[];
  engine: string;
  batchVersion: number;
}

/**
 * Client-Side Discovery Coordinator for TripPick Infinite Live Discovery Engine.
 * Fetches batches of 5 newly discovered and Google Places-verified MICE retreat destinations.
 * Includes autonomous layered fallback to Curated Reserve Catalog for 100% offline / presentation resilience.
 */
export async function fetchNextBatchDestinations(
  request: DestinationBatchRequest
): Promise<DestinationBatchResponse> {
  const currentBatch = request.batchVersion || 1;
  const excludedPlaceIds = new Set(request.excludedPlaceIds || []);
  const excludedNames = new Set((request.excludedNames || []).map(n => n.toLowerCase()));

  try {
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), 4500);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const response = await fetch(`${baseUrl}/api/discover-destinations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(request),
    });

    clearTimeout(timeoutTimer);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.destinations) && data.destinations.length > 0) {
        return {
          destinations: data.destinations,
          engine: data.engine || 'google-gemini-1.5-flash',
          batchVersion: data.batchVersion || currentBatch + 1,
        };
      }
    }
  } catch (err: unknown) {
    const isConnRefused =
      Boolean(err && typeof err === 'object' && 'cause' in err && (err as { cause?: { code?: string } }).cause?.code === 'ECONNREFUSED');
    if (!isConnRefused) {
      console.warn('TripPick Discovery: /api/discover-destinations request failed or timed out, applying layered fallback:', err);
    }
  }

  // Layered Fallback: Select from Curated Reserve Catalog with 0 duplicate place IDs
  let reserveMatches = CURATED_RESERVE_CATALOG.filter(
    d => !excludedPlaceIds.has(d.google_place_id || '') &&
         !excludedNames.has(d.title.toLowerCase())
  );

  if (reserveMatches.length === 0) {
    // If all reserve catalog items have been seen, re-index with offset
    reserveMatches = CURATED_RESERVE_CATALOG.map((d, i) => ({
      ...d,
      id: 2000 + (currentBatch * 10) + i,
      google_place_id: `${d.google_place_id}_b${currentBatch}`,
    }));
  }

  const selected = reserveMatches.slice(0, 5);
  return {
    destinations: selected,
    engine: 'curated-reserve-fallback',
    batchVersion: currentBatch + 1,
  };
}
