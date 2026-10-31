import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import type { ApiError } from "../api/client"
import { getTask, updateTask } from "../api/tasks"

export const Route = createFileRoute("/tasks_/$taskId/edit")({
  component: EditTaskPage,
})

function EditTaskPage() {
  const { taskId } = Route.useParams()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()

  const numericTaskId = Number(taskId)

  const taskQuery = useQuery({
    queryKey: ["tasks", "detail", numericTaskId],
    queryFn: () => getTask(numericTaskId),
  })

  if (taskQuery.isPending) {
    return <p>Loading task...</p>
  }

  if (taskQuery.isError) {
    return <p>Failed to load task.</p>
  }

  return (
    <EditTaskForm
      taskId={numericTaskId}
      initialTitle={taskQuery.data.title}
      initialCompleted={taskQuery.data.completed}
      onSuccess={async () => {
        await queryClient.invalidateQueries({
          queryKey: ["tasks", "list"],
        })

        await queryClient.invalidateQueries({
          queryKey: ["tasks", "detail", numericTaskId],
        })

        await navigate({
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
      }}
    />
  )
}

function EditTaskForm({
  taskId,
  initialTitle,
  initialCompleted,
  onSuccess,
}: {
  taskId: number
  initialTitle: string
  initialCompleted: boolean
  onSuccess: () => Promise<void>
}) {
  const [title, setTitle] = useState(initialTitle)
  const [completed, setCompleted] = useState(initialCompleted)

  const mutation = useMutation({
    mutationFn: () =>
      updateTask(taskId, {
        title,
        completed,
      }),
    onSuccess,
  })

  const error = mutation.error as ApiError | null

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        mutation.mutate()
      }}
    >
      <div>
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>

        {error?.fieldErrors?.title && <p>{error.fieldErrors.title}</p>}
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={completed}
            onChange={(event) => setCompleted(event.target.checked)}
          />
          Completed
        </label>
      </div>

      {error && !error.fieldErrors?.title && <p>{error.message}</p>}

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  )
}
