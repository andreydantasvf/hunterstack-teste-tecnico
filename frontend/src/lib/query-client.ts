import { QueryClient } from '@tanstack/react-query';
import type { PolicyFilters } from '@/lib/schemas';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
});

export const queryKeys = {
  policies: {
    all: ['policies'] as const,
    lists: () => [...queryKeys.policies.all, 'list'] as const,
    list: (filters: PolicyFilters) =>
      [...queryKeys.policies.lists(), filters] as const,
    details: () => [...queryKeys.policies.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.policies.details(), id] as const,
    categories: ['policies', 'categories'] as const
  }
} as const;
