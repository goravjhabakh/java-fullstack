import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"

import { getApiError } from "../api/client"
import { getTask, updateTask } from "../api/tasks"

const taskListSearch = {
  page: 0,
  size: 20,
  completed: undefined,
  projectId: undefined,
  title: undefined,
  sortBy: "id" as const,
  direction: "asc" as const,
}

export const Route = createFileRoute("/tasks_/$taskId/edit")({ component: EditTaskPage })

function EditTaskPage() {
  const { taskId } = Route.useParams()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const numericTaskId = Number(taskId)
  const isValidTaskId = Number.isSafeInteger(numericTaskId) && numericTaskId > 0
  const taskQuery = useQuery({
    queryKey: ["tasks", "detail", numericTaskId],
    queryFn: () => getTask(numericTaskId),
    enabled: isValidTaskId,
  })

  if (!isValidTaskId)
    return (
      <PageState
        heading="Invalid task ID"
        message="Choose a task from the task list and try again."
      >
        <BackToTasks />
      </PageState>
    )
  if (taskQuery.isPending)
    return <PageState heading="Loading task…" message="Fetching the task details." />
  if (taskQuery.isError) {
    const error = getApiError(taskQuery.error)
    if (error.status === 404)
      return (
        <PageState heading="Task not found" message="The task may have been deleted.">
          <BackToTasks />
        </PageState>
      )
    return (
      <PageState error heading="Unable to load task" message={error.message}>
        <button
          className="button-primary mt-5"
          onClick={() => void taskQuery.refetch()}
          type="button"
        >
          Retry Loading Task
        </button>
      </PageState>
    )
  }

  return (
    <EditTaskForm
      initialCompleted={taskQuery.data.completed}
      initialTitle={taskQuery.data.title}
      onSuccess={async () => {
        await queryClient.invalidateQueries({ queryKey: ["tasks", "list"] })
        await queryClient.invalidateQueries({ queryKey: ["tasks", "detail", numericTaskId] })
        await navigate({ to: "/tasks", search: taskListSearch })
      }}
      taskId={numericTaskId}
    />
  )
}

function EditTaskForm({
  initialCompleted,
  initialTitle,
  onSuccess,
  taskId,
}: {
  initialCompleted: boolean
  initialTitle: string
  onSuccess: () => Promise<void>
  taskId: number
}) {
  const [title, setTitle] = useState(initialTitle)
  const [completed, setCompleted] = useState(initialCompleted)
  const mutation = useMutation({
    mutationFn: () => updateTask(taskId, { title, completed }),
    onSuccess,
  })
  const error = mutation.isError ? getApiError(mutation.error) : null
  const titleError = error?.fieldErrors.title
  return (
    <div className="mx-auto max-w-xl">
      <BackToTasks />
      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
        <p className="text-sm font-semibold text-brand-700">Edit task</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-950">Update task</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Change the title or completion status, then save your changes.
        </p>
        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate()
          }}
        >
          <div>
            <label className="field-label" htmlFor="edit-task-title">
              Title
            </label>
            <input
              aria-describedby={titleError ? "edit-task-title-error" : "edit-task-title-help"}
              autoComplete="off"
              className="field-control"
              id="edit-task-title"
              maxLength={100}
              name="title"
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
            <p className="mt-1.5 text-xs text-slate-500" id="edit-task-title-help">
              Up to 100 characters.
            </p>
            {titleError && (
              <p className="mt-2 text-sm text-red-700" id="edit-task-title-error" role="alert">
                {titleError}
              </p>
            )}
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <input
              checked={completed}
              className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
              id="edit-task-completed"
              name="completed"
              onChange={(event) => setCompleted(event.target.checked)}
              type="checkbox"
            />{" "}
            Mark as completed
          </label>
          {error && !titleError && (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error.message}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <BackToTasks secondary />
            <button className="button-primary" disabled={mutation.isPending} type="submit">
              {mutation.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BackToTasks({ secondary = false }: { secondary?: boolean }) {
  return (
    <Link
      className={
        secondary ? "button-secondary" : "text-sm font-semibold text-brand-700 hover:text-brand-600"
      }
      search={taskListSearch}
      to="/tasks"
    >
      {secondary ? "Cancel" : "← Back to tasks"}
    </Link>
  )
}
function PageState({
  children,
  error = false,
  heading,
  message,
}: {
  children?: React.ReactNode
  error?: boolean
  heading: string
  message: string
}) {
  return (
    <section
      aria-labelledby="edit-task-state"
      className={`mx-auto max-w-xl rounded-lg border p-6 ${error ? "border-red-200 bg-red-50" : "border-slate-200 bg-white shadow-xs"}`}
    >
      <h1
        className={`text-lg font-semibold ${error ? "text-red-950" : "text-ink-950"}`}
        id="edit-task-state"
      >
        {heading}
      </h1>
      <p
        className={`mt-2 text-sm ${error ? "text-red-800" : "text-slate-600"}`}
        role={error ? "alert" : undefined}
      >
        {message}
      </p>
      {children && <div className="mt-5">{children}</div>}
    </section>
  )
}
