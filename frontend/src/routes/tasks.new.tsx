import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"

import { getApiError } from "../api/client"
import { getProjects } from "../api/projects"
import { createTask } from "../api/tasks"

export const Route = createFileRoute("/tasks/new")({ component: NewTaskPage })

function NewTaskPage() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const [projectId, setProjectId] = useState("")
  const [title, setTitle] = useState("")
  const projectsQuery = useQuery({ queryKey: ["projects", "list"], queryFn: getProjects })
  const createMutation = useMutation({
    mutationFn: () => createTask(Number(projectId), { title }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", "list"] })
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
    },
  })

  if (projectsQuery.isPending)
    return <PageState heading="Loading projects…" message="Fetching projects for your new task." />
  if (projectsQuery.isError) {
    const error = getApiError(projectsQuery.error)
    return (
      <PageState error heading="Unable to load projects" message={error.message}>
        <button
          className="button-primary mt-5"
          onClick={() => void projectsQuery.refetch()}
          type="button"
        >
          Retry Loading Projects
        </button>
      </PageState>
    )
  }

  const projects = projectsQuery.data
  const error = createMutation.isError ? getApiError(createMutation.error) : null
  const titleError = error?.fieldErrors.title
  const canSubmit =
    projects.length > 0 &&
    projectId !== "" &&
    title.trim() !== "" &&
    title.length <= 100 &&
    !createMutation.isPending

  return (
    <div className="mx-auto max-w-xl">
      <Link
        className="text-sm font-semibold text-brand-700 hover:text-brand-600"
        search={{
          page: 0,
          size: 20,
          completed: undefined,
          projectId: undefined,
          title: undefined,
          sortBy: "id",
          direction: "asc",
        }}
        to="/tasks"
      >
        ← Back to tasks
      </Link>
      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
        <p className="text-sm font-semibold text-brand-700">New task</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-950">Create a task</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose a project and give the task a clear, actionable title.
        </p>
        {projects.length === 0 ? (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-950">A project is required</h2>
            <p className="mt-1 text-sm text-amber-800">Create a project before adding a task.</p>
          </div>
        ) : (
          <form
            className="mt-6 space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              if (canSubmit) createMutation.mutate()
            }}
          >
            <div>
              <label className="field-label" htmlFor="project-id">
                Project
              </label>
              <select
                className="field-control"
                id="project-id"
                name="projectId"
                onChange={(event) => setProjectId(event.target.value)}
                value={projectId}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="task-title">
                Title
              </label>
              <input
                aria-describedby={titleError ? "task-title-error" : "task-title-help"}
                autoComplete="off"
                className="field-control"
                id="task-title"
                maxLength={100}
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
              <p className="mt-1.5 text-xs text-slate-500" id="task-title-help">
                Up to 100 characters.
              </p>
              {titleError && (
                <p className="mt-2 text-sm text-red-700" id="task-title-error" role="alert">
                  {titleError}
                </p>
              )}
            </div>
            {error && !titleError && (
              <p
                className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {error.message}
              </p>
            )}
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
              <Link
                className="button-secondary"
                search={{
                  page: 0,
                  size: 20,
                  completed: undefined,
                  projectId: undefined,
                  title: undefined,
                  sortBy: "id",
                  direction: "asc",
                }}
                to="/tasks"
              >
                Cancel
              </Link>
              <button className="button-primary" disabled={!canSubmit} type="submit">
                {createMutation.isPending ? "Creating…" : "Create Task"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
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
      aria-labelledby="new-task-state"
      className={`mx-auto max-w-xl rounded-lg border p-6 ${error ? "border-red-200 bg-red-50" : "border-slate-200 bg-white shadow-xs"}`}
    >
      <h1
        className={`text-lg font-semibold ${error ? "text-red-950" : "text-ink-950"}`}
        id="new-task-state"
      >
        {heading}
      </h1>
      <p
        className={`mt-2 text-sm ${error ? "text-red-800" : "text-slate-600"}`}
        role={error ? "alert" : undefined}
      >
        {message}
      </p>
      {children}
    </section>
  )
}
