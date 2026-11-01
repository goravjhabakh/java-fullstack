import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { getApiError } from "../api/client"
import { getProjects } from "../api/projects"
import { deleteTask, getTasks, type TaskListParameters } from "../api/tasks"

export const Route = createFileRoute("/tasks/")({
  validateSearch: (search: Record<string, unknown>) => {
    const page = typeof search.page === "number" && search.page >= 0 ? search.page : 0
    const size =
      typeof search.size === "number" && search.size >= 1 && search.size <= 100 ? search.size : 20
    const completed =
      search.completed === true || search.completed === false ? search.completed : undefined
    const projectId =
      typeof search.projectId === "number" && search.projectId >= 1 ? search.projectId : undefined
    const title =
      typeof search.title === "string" && search.title.trim() ? search.title.trim() : undefined
    const sortBy: TaskListParameters["sortBy"] =
      search.sortBy === "title" || search.sortBy === "completed" ? search.sortBy : "id"
    const direction: TaskListParameters["direction"] = search.direction === "desc" ? "desc" : "asc"

    return { page, size, completed, projectId, title, sortBy, direction }
  },
  component: TasksPage,
})

function TasksPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(search.title ?? "")
  const [completed, setCompleted] = useState(
    search.completed === undefined ? "" : String(search.completed)
  )
  const [projectId, setProjectId] = useState(search.projectId?.toString() ?? "")
  const [size, setSize] = useState(String(search.size))
  const [sortBy, setSortBy] = useState(search.sortBy)
  const [direction, setDirection] = useState(search.direction)

  useEffect(() => {
    setTitle(search.title ?? "")
    setCompleted(search.completed === undefined ? "" : String(search.completed))
    setProjectId(search.projectId?.toString() ?? "")
    setSize(String(search.size))
    setSortBy(search.sortBy)
    setDirection(search.direction)
  }, [search])

  const parameters: TaskListParameters = {
    page: search.page,
    size: search.size,
    completed: search.completed,
    projectId: search.projectId,
    title: search.title,
    sortBy: search.sortBy,
    direction: search.direction,
  }
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["tasks", "list"] }),
  })
  const tasksQuery = useQuery({
    queryKey: ["tasks", "list", parameters],
    queryFn: () => getTasks(parameters),
    placeholderData: keepPreviousData,
  })
  const projectsQuery = useQuery({ queryKey: ["projects", "list"], queryFn: getProjects })

  if (tasksQuery.isPending || projectsQuery.isPending) {
    return <StatePanel heading="Loading tasks…" message="Fetching tasks and project details." />
  }

  if (tasksQuery.isError || projectsQuery.isError) {
    const error = getApiError(tasksQuery.error ?? projectsQuery.error)
    return (
      <StatePanel heading="Unable to load tasks" message={error.message} error>
        <button
          className="button-primary mt-5"
          onClick={() => {
            void tasksQuery.refetch()
            void projectsQuery.refetch()
          }}
          type="button"
        >
          Retry Loading Tasks
        </button>
      </StatePanel>
    )
  }

  const projectNames = new Map(projectsQuery.data.map((project) => [project.id, project.name]))
  const hasActiveFilters =
    search.completed !== undefined || search.projectId !== undefined || search.title !== undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-700">Task management</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink-950">Tasks</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Find, update, and keep track of work across your projects.
          </p>
        </div>
        <Link className="button-primary shrink-0" to="/tasks/new">
          New Task
        </Link>
      </div>

      <div aria-live="polite" className="min-h-5 text-sm text-slate-600">
        {tasksQuery.isFetching && !tasksQuery.isPending && "Refreshing task list…"}
      </div>

      <form
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()
          navigate({
            search: {
              page: 0,
              size: Number(size),
              completed: completed === "" ? undefined : completed === "true",
              projectId: projectId === "" ? undefined : Number(projectId),
              title: title.trim() || undefined,
              sortBy,
              direction,
            },
          })
        }}
      >
        <fieldset>
          <legend className="text-base font-semibold text-ink-950">Filter & sort tasks</legend>
          <p className="mt-1 text-sm text-slate-600">Apply filters to update the task list.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Title" htmlFor="task-title-filter">
              <input
                autoComplete="off"
                className="field-control"
                id="task-title-filter"
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </Field>
            <Field label="Status" htmlFor="task-status-filter">
              <select
                className="field-control"
                id="task-status-filter"
                name="completed"
                onChange={(event) => setCompleted(event.target.value)}
                value={completed}
              >
                <option value="">All</option>
                <option value="false">Incomplete</option>
                <option value="true">Complete</option>
              </select>
            </Field>
            <Field label="Project" htmlFor="task-project-filter">
              <select
                className="field-control"
                id="task-project-filter"
                name="projectId"
                onChange={(event) => setProjectId(event.target.value)}
                value={projectId}
              >
                <option value="">All projects</option>
                {projectsQuery.data.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Page size" htmlFor="task-page-size">
              <select
                className="field-control"
                id="task-page-size"
                name="size"
                onChange={(event) => setSize(event.target.value)}
                value={size}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </Field>
            <Field label="Sort by" htmlFor="task-sort-by">
              <select
                className="field-control"
                id="task-sort-by"
                name="sortBy"
                onChange={(event) => setSortBy(event.target.value as TaskListParameters["sortBy"])}
                value={sortBy}
              >
                <option value="id">ID</option>
                <option value="title">Title</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
            <Field label="Direction" htmlFor="task-sort-direction">
              <select
                className="field-control"
                id="task-sort-direction"
                name="direction"
                onChange={(event) =>
                  setDirection(event.target.value as TaskListParameters["direction"])
                }
                value={direction}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <button className="button-primary" type="submit">
              Apply Filters
            </button>
          </div>
        </fieldset>
      </form>

      {tasksQuery.data.totalElements === 0 ? (
        <StatePanel
          headingLevel={2}
          heading={hasActiveFilters ? "No matching tasks" : "No tasks yet"}
          message={
            hasActiveFilters
              ? "Try adjusting your filters and apply them again."
              : "Create a task to start tracking work in a project."
          }
        >
          {!hasActiveFilters && (
            <Link className="button-primary mt-5" to="/tasks/new">
              Create Task
            </Link>
          )}
        </StatePanel>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold text-ink-950">{tasksQuery.data.totalElements}</span>{" "}
              matching {tasksQuery.data.totalElements === 1 ? "task" : "tasks"}
            </p>
            <p className="tabular-nums">
              Page {tasksQuery.data.page + 1} of {tasksQuery.data.totalPages}
            </p>
          </div>
          <ul aria-label="Tasks" className="space-y-3">
            {tasksQuery.data.content.map((task) => (
              <li
                className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                key={task.id}
              >
                <div className="min-w-0">
                  <h2 className="break-words text-base font-semibold text-ink-950">{task.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                      {projectNames.get(task.projectId) ?? `Project ${task.projectId}`}
                    </span>
                    <span
                      className={
                        task.completed
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800"
                          : "rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800"
                      }
                    >
                      {task.completed ? "Complete" : "Incomplete"}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    className="button-secondary"
                    params={{ taskId: String(task.id) }}
                    to="/tasks/$taskId/edit"
                  >
                    Edit task
                  </Link>
                  <button
                    className="button-danger"
                    disabled={deleteMutation.isPending && deleteMutation.variables === task.id}
                    onClick={() => {
                      if (window.confirm(`Delete "${task.title}"?`)) deleteMutation.mutate(task.id)
                    }}
                    type="button"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === task.id
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {deleteMutation.isError && (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {getApiError(deleteMutation.error).message}
            </p>
          )}
          <nav
            aria-label="Task pagination"
            className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-slate-600 tabular-nums">
              Page {tasksQuery.data.page + 1} of {tasksQuery.data.totalPages}
            </p>
            <div className="flex gap-3">
              <button
                className="button-secondary"
                disabled={tasksQuery.data.first}
                onClick={() =>
                  navigate({ search: (previous) => ({ ...previous, page: previous.page - 1 }) })
                }
                type="button"
              >
                Previous
              </button>
              <button
                className="button-secondary"
                disabled={tasksQuery.data.last}
                onClick={() =>
                  navigate({ search: (previous) => ({ ...previous, page: previous.page + 1 }) })
                }
                type="button"
              >
                Next
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  )
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode
  htmlFor: string
  label: string
}) {
  return (
    <div>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

function StatePanel({
  children,
  error = false,
  heading,
  headingLevel = 1,
  message,
}: {
  children?: React.ReactNode
  error?: boolean
  heading: string
  headingLevel?: 1 | 2
  message: string
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2"

  return (
    <section
      aria-labelledby="state-heading"
      className={`rounded-lg border p-6 ${error ? "border-red-200 bg-red-50" : "border-dashed border-slate-300 bg-white text-center"}`}
    >
      <Heading
        className={`text-lg font-semibold ${error ? "text-red-950" : "text-ink-950"}`}
        id="state-heading"
      >
        {heading}
      </Heading>
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
