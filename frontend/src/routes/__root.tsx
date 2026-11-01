import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createRootRoute, Link, Outlet, useNavigate } from "@tanstack/react-router"
import { authQueryOptions, logout } from "../api/auth"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const authQuery = useQuery(authQueryOptions)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const logoutMutation = useMutation({
    mutationFn: logout,

    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: ["tasks"],
      })

      queryClient.removeQueries({
        queryKey: ["projects"],
      })

      queryClient.setQueryData(authQueryOptions.queryKey, null)

      await navigate({
        to: "/login",
      })
    },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <a
        className="sr-only fixed left-4 top-4 z-50 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#main-content"
      >
        Skip to main content
      </a>
      <header className="border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="shrink-0 text-lg font-bold tracking-tight text-ink-950"
            to="/tasks"
            search={{
              page: 0,
              size: 20,
              completed: undefined,
              projectId: undefined,
              title: undefined,
              sortBy: "id",
              direction: "asc",
            }}
          >
            Task App
          </Link>
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-2 text-sm font-medium"
          >
            {authQuery.data ? (
              <>
                <Link
                  activeProps={{
                    className: "bg-slate-100 text-ink-950",
                  }}
                  className="rounded-md px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                  to="/tasks"
                  search={{
                    page: 0,
                    size: 20,
                    completed: undefined,
                    projectId: undefined,
                    title: undefined,
                    sortBy: "id",
                    direction: "asc",
                  }}
                >
                  Tasks
                </Link>

                <Link className="button-primary" to="/tasks/new">
                  New Task
                </Link>

                <span className="px-2 text-slate-600">{authQuery.data.username}</span>

                <button
                  className="button-secondary"
                  disabled={logoutMutation.isPending}
                  onClick={() => logoutMutation.mutate()}
                  type="button"
                >
                  {logoutMutation.isPending ? "Logging out…" : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  className="rounded-md px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                  to="/login"
                >
                  Login
                </Link>

                <Link className="button-primary" to="/register">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        id="main-content"
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  )
}
