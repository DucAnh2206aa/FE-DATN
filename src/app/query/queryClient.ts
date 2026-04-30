import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: true,
      retry: 3,
      staleTime: 0,
      refetchInterval: 10000 * 60,
    },
  },
})
