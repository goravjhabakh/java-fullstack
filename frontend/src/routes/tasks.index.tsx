import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tasks/')({
  component: TasksPage,
})

function TasksPage() {
  return <h2>Tasks</h2>
}
