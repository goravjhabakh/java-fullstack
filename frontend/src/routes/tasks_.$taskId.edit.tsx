import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"

import { getApiError } from "../api/client"
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
    const error = getApiError(taskQuery.error)

    if (error.status === 404) {
      return (
        <>
          <h2>Task not found</h2>
          <p>The task may have been deleted.</p>

          <Link
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
          >
            Back to tasks
          </Link>
        </>
      )
    }

    return (
      <>
        <p>{error.message}</p>

        <button
          type="button"
          onClick={() => {
            void taskQuery.refetch()
          }}
        >
          Retry
        </button>
      </>
    )
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

  const error = mutation.isError ? getApiError(mutation.error) : null

  const titleError = error?.fieldErrors.title

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
          <input value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} />
        </label>

        {titleError && <p>{titleError}</p>}
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={completed}
            onChange={(event) => {
              setCompleted(event.target.checked)
            }}
          />
          Completed
        </label>
      </div>

      {error && !titleError && <p>{error.message}</p>}

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  )
}
