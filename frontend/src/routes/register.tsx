import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, Navigate } from "@tanstack/react-router"
import { useRef, useState } from "react"

import { authQueryOptions, register } from "../api/auth"
import { getApiError } from "../api/client"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = Route.useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const usernameInput = useRef<HTMLInputElement>(null)
  const passwordInput = useRef<HTMLInputElement>(null)

  const authQuery = useQuery(authQueryOptions)

  const registerMutation = useMutation({
    mutationFn: () =>
      register({
        username: username.trim(),
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

  const usernameError =
    hasSubmitted && !/^[A-Za-z0-9][A-Za-z0-9._-]{2,49}$/.test(username.trim())
      ? "Use 3–50 letters, numbers, dots, underscores, or hyphens."
      : error?.fieldErrors.username
  const passwordError =
    hasSubmitted && password.length < 8
      ? "Password must be at least 8 characters."
      : error?.fieldErrors.password

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
            setHasSubmitted(true)

            if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,49}$/.test(username.trim())) {
              usernameInput.current?.focus()
              return
            }

            if (password.length < 8) {
              passwordInput.current?.focus()
              return
            }

            registerMutation.mutate()
          }}
        >
          <div>
            <label className="field-label" htmlFor="username">
              Username
            </label>

            <input
              autoComplete="username"
              aria-describedby={
                usernameError
                  ? "register-username-help register-username-error"
                  : "register-username-help"
              }
              aria-invalid={Boolean(usernameError)}
              className="field-control"
              id="username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              ref={usernameInput}
              spellCheck={false}
              value={username}
            />

            <p className="mt-1.5 text-xs text-slate-500" id="register-username-help">
              Use 3–50 letters, numbers, dots, underscores, or hyphens.
            </p>

            {usernameError && (
              <p className="mt-2 text-sm text-red-700" id="register-username-error" role="alert">
                {usernameError}
              </p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>

            <input
              autoComplete="new-password"
              aria-describedby={
                passwordError
                  ? "register-password-help register-password-error"
                  : "register-password-help"
              }
              aria-invalid={Boolean(passwordError)}
              className="field-control"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              ref={passwordInput}
              type="password"
              value={password}
            />

            <p className="mt-1.5 text-xs text-slate-500" id="register-password-help">
              Minimum 8 characters.
            </p>

            {passwordError && (
              <p className="mt-2 text-sm text-red-700" id="register-password-error" role="alert">
                {passwordError}
              </p>
            )}
          </div>

          {error && !usernameError && !passwordError && (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error.status === 409 ? "Username already exists" : error.message}
            </p>
          )}

          <button
            className="button-primary w-full"
            disabled={registerMutation.isPending}
            type="submit"
          >
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
