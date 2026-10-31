import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
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
