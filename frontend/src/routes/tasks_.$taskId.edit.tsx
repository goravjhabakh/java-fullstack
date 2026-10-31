import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/tasks_/$taskId/edit")({
  component: EditTaskPage,
})

function EditTaskPage() {
  const { taskId } = Route.useParams()

  return <h2>Edit Task {taskId}</h2>
}
