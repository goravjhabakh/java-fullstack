export type ApiError = {
  status: number
  message: string
  fieldErrors: Record<string, string>
}

type CsrfToken = {
  token: string
  headerName: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL must be configured")
}

let csrfToken: CsrfToken | null = null
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"])

export function setCsrfToken(token: CsrfToken | null) {
  csrfToken = token
}

export function getApiError(error: unknown): ApiError {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error &&
    "fieldErrors" in error
  ) {
    return error as ApiError
  }

  return {
    status: 0,
    message: "Something went wrong",
    fieldErrors: {},
  }
}

function fallbackErrorMessage(status: number) {
  if (status === 401) {
    return "Your session has expired. Please sign in again."
  }

  if (status === 403) {
    return "The security check failed. Refresh the page and try again."
  }

  return "Request failed"
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const method = options?.method?.toUpperCase() ?? "GET"
    const headers = new Headers(options?.headers)

    if (options?.body && typeof options.body === "string" && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    if (unsafeMethods.has(method) && csrfToken) {
      headers.set(csrfToken.headerName, csrfToken.token)
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method,
      credentials: "include",
      headers,
    })

    if (!response.ok) {
      let error: ApiError

      try {
        error = await response.json()
      } catch {
        error = {
          status: response.status,
          message: fallbackErrorMessage(response.status),
          fieldErrors: {},
        }
      }

      throw error
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  } catch (error) {
    if (typeof error === "object" && error !== null && "status" in error && "message" in error) {
      throw error
    }

    throw {
      status: 0,
      message: "Unable to reach the backend",
      fieldErrors: {},
    } satisfies ApiError
  }
}
