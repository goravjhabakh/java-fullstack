import { queryOptions } from "@tanstack/react-query"
import { apiRequest, getApiError, setCsrfToken } from "./client"

export type AuthUser = {
  id: number
  username: string
}

type CsrfResponse = {
  token: string
  headerName: string
}

export type RegisterInput = {
  username: string
  password: string
}

export type LoginInput = {
  username: string
  password: string
}

export async function refreshCsrf() {
  const csrf = await apiRequest<CsrfResponse>("/auth/csrf")
  setCsrfToken(csrf)

  return csrf
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await apiRequest<AuthUser>("/auth/me")
  } catch (error) {
    const apiError = getApiError(error)

    if (apiError.status === 401) {
      return null
    }

    throw error
  }
}

export async function register(input: RegisterInput) {
  await refreshCsrf()

  return apiRequest<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function login(input: LoginInput) {
  await refreshCsrf()

  const body = new URLSearchParams({
    username: input.username,
    password: input.password,
  })

  await apiRequest<void>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  // login invalidates/rotates the previous CSRF token
  await refreshCsrf()
}

export async function logout() {
  await apiRequest<void>("/auth/logout", {
    method: "POST",
  })

  setCsrfToken(null)

  // establish fresh anonymous CSRF state
  await refreshCsrf()
}

export const authQueryOptions = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: getCurrentUser,
  retry: false,
})
