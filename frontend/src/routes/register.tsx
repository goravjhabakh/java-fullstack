import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, Navigate } from "@tanstack/react-router"
import { useState } from "react"

import { authQueryOptions, register } from "../api/auth"
import { getApiError } from "../api/client"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = Route.useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const authQuery = useQuery(authQueryOptions)

  const registerMutation = useMutation({
    mutationFn: () =>
      register({
        username,
        password,
      }),

    onSuccess: async () => {
      await navigate({
        to: "/login",
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

  const error = registerMutation.isError ? getApiError(registerMutation.error) : null

  const canSubmit =
    username.trim().length >= 3 && password.length >= 8 && !registerMutation.isPending

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
        <p className="text-sm font-semibold text-brand-700">Create account</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-950">Register</h1>

        <p className="mt-2 text-sm text-slate-600">
          Create an account to start managing your tasks.
        </p>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()

            if (canSubmit) {
              registerMutation.mutate()
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

            {error?.fieldErrors.username && (
              <p className="mt-2 text-sm text-red-700" role="alert">
                {error.fieldErrors.username}
              </p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>

            <input
              autoComplete="new-password"
              className="field-control"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />

            <p className="mt-1.5 text-xs text-slate-500">Minimum 8 characters.</p>

            {error?.fieldErrors.password && (
              <p className="mt-2 text-sm text-red-700" role="alert">
                {error.fieldErrors.password}
              </p>
            )}
          </div>

          {error && !error.fieldErrors.username && !error.fieldErrors.password && (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error.status === 409 ? "Username already exists" : error.message}
            </p>
          )}

          <button className="button-primary w-full" disabled={!canSubmit} type="submit">
            {registerMutation.isPending ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-semibold text-brand-700 hover:text-brand-600" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
