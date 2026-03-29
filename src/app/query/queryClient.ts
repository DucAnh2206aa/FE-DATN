import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
<<<<<<< HEAD
})
=======
})
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
