import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { getApiError } from "./api/client"
import { routeTree } from "./routeTree.gen"
import "./styles.css"
import { refreshCsrf } from "./api/auth"

let queryClient: QueryClient

function clearAuthenticatedData() {
  queryClient.removeQueries({ queryKey: ["tasks"] })
  queryClient.removeQueries({ queryKey: ["projects"] })
  queryClient.setQueryData(["auth", "me"], null)
}

queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (getApiError(error).status === 401) {
        clearAuthenticatedData()
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (getApiError(error).status === 401) {
        clearAuthenticatedData()
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const { status } = getApiError(error)

        if (status >= 400 && status < 500) {
          return false
        }

        return failureCount < 3
      },
    },
  },
})

const router = createRouter({
  routeTree,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

void refreshCsrf()

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
