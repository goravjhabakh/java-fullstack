import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/tasks/new")({
  component: NewTaskPage,
})

function NewTaskPage() {
  return <h2>Create Task</h2>
}
