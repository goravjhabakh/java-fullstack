export type ApiError = {
  status: number
  message: string
  fieldErrors: Record<string, string>
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL must be configured")
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

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
    })

    if (!response.ok) {
      let error: ApiError

      try {
        error = await response.json()
      } catch {
        error = {
          status: response.status,
          message: "Request failed",
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
