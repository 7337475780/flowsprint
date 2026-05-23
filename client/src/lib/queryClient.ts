import { QueryClient } from '@tanstack/react-query';

/**
 * Standard, robust query client configuration for server state cache management.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive and redundant queries on tab focus
      retry: 1,                    // Retries failing queries once before showing error
      staleTime: 5 * 60 * 1000,     // Consider data fresh for 5 minutes
    },
    mutations: {
      onError: (error: any) => {
        console.error('Mutation failed:', error);
      },
    },
  },
});
