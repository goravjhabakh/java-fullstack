import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router"

import { authQueryOptions } from "../api/auth"

export const Route = createFileRoute("/tasks")({
  component: TasksLayout,
})

function TasksLayout() {
  const authQuery = useQuery(authQueryOptions)

  if (authQuery.isPending) {
    return <div className="py-12 text-center text-sm text-slate-600">Checking authentication…</div>
  }

  if (authQuery.isError) {
    return (
      <div className="py-12 text-center text-sm text-red-700">Unable to check authentication.</div>
    )
  }

  if (!authQuery.data) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
