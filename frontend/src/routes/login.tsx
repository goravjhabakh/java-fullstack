import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, Navigate } from "@tanstack/react-router"
import { useState } from "react"

import { authQueryOptions, login } from "../api/auth"
import { getApiError } from "../api/client"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const authQuery = useQuery(authQueryOptions)

  const loginMutation = useMutation({
    mutationFn: () =>
      login({
        username,
        password,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authQueryOptions.queryKey,
      })

      await navigate({
        to: "/tasks",
        search: {
          page: 0,
          size: 20,
          completed: undefined,
          projectId: undefined,
          title: undefined,
          sortBy: "id",
          direction: "asc",
        },
      })
    },
  })

  if (authQuery.isPending) {
    return <div className="py-12 text-center text-sm text-slate-600">Checking authentication…</div>
  }

  if (authQuery.data) {
    return (
      <Navigate
        replace
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
      />
    )
  }

  const error = loginMutation.isError ? getApiError(loginMutation.error) : null

  const canSubmit = username.trim() !== "" && password !== "" && !loginMutation.isPending

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
        <p className="text-sm font-semibold text-brand-700">Welcome back</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-950">Login</h1>

        <p className="mt-2 text-sm text-slate-600">Sign in to manage your tasks and projects.</p>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()

            if (canSubmit) {
              loginMutation.mutate()
            }
          }}
        >
          <div>
            <label className="field-label" htmlFor="username">
              Username
            </label>

            <input
              autoComplete="username"
              className="field-control"
              id="username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              value={username}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>

            <input
              autoComplete="current-password"
              className="field-control"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </div>

          {error && (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error.status === 401 ? "Invalid username or password" : error.message}
            </p>
          )}

          <button className="button-primary w-full" disabled={!canSubmit} type="submit">
            {loginMutation.isPending ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          No account?{" "}
          <Link className="font-semibold text-brand-700 hover:text-brand-600" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
