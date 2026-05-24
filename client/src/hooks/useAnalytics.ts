import { useQuery } from '@tanstack/react-query';
import { getAnalyticsOverview } from '../api/analyticsApi.js';

/**
 * Custom hook to retrieve global productivity telemetry metrics.
 */
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: getAnalyticsOverview,
    // Automatically refetch when the browser tab goes active or gets re-focused
    refetchOnWindowFocus: true,
    staleTime: 60000,
    gcTime: 300000,
  });
}
