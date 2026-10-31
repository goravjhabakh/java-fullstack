import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

import { getProjects } from "../api/projects"
import { deleteTask, getTasks, type TaskListParameters } from "../api/tasks"
import { useState } from "react"

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

    return {
      page,
      size,
      completed,
      projectId,
      title,
      sortBy,
      direction,
    }
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

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tasks", "list"],
      })
    },
  })

  const tasksQuery = useQuery({
    queryKey: ["tasks", "list", parameters],
    queryFn: () => getTasks(parameters),
    placeholderData: keepPreviousData,
  })

  const projectsQuery = useQuery({
    queryKey: ["projects", "list"],
    queryFn: getProjects,
  })

  if (tasksQuery.isPending || projectsQuery.isPending) {
    return <p>Loading...</p>
  }

  if (tasksQuery.isError || projectsQuery.isError) {
    return (
      <>
        <p>Failed to load data.</p>

        <button
          type="button"
          onClick={() => {
            void tasksQuery.refetch()
            void projectsQuery.refetch()
          }}
        >
          Retry
        </button>
      </>
    )
  }

  const projectNames = new Map(projectsQuery.data.map((project) => [project.id, project.name]))
  const hasActiveFilters =
    search.completed !== undefined || search.projectId !== undefined || search.title !== undefined

  if (tasksQuery.data.totalElements === 0) {
    return (
      <>
        <h2>Tasks</h2>

        {hasActiveFilters ? <p>No tasks match your filters.</p> : <p>No tasks exist yet.</p>}
      </>
    )
  }

  return (
    <>
      <h2>Tasks</h2>

      {tasksQuery.isFetching && !tasksQuery.isPending && <p>Refreshing...</p>}

      <p>
        Page {tasksQuery.data.page + 1} of {tasksQuery.data.totalPages}
        {" - "}
        {tasksQuery.data.totalElements} matching tasks
      </p>

      <p>Total tasks: {tasksQuery.data.totalElements}</p>

      <form
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
        <div>
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
        </div>

        <div>
          <label>
            Status
            <select value={completed} onChange={(event) => setCompleted(event.target.value)}>
              <option value="">All</option>
              <option value="false">Incomplete</option>
              <option value="true">Complete</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Project
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              <option value="">All projects</option>

              {projectsQuery.data.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label>
            Page size
            <select value={size} onChange={(event) => setSize(event.target.value)}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Sort by
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as TaskListParameters["sortBy"])}
            >
              <option value="id">ID</option>
              <option value="title">Title</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Direction
            <select
              value={direction}
              onChange={(event) =>
                setDirection(event.target.value as TaskListParameters["direction"])
              }
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>

        <button type="submit">Apply filters</button>
      </form>

      <ul>
        {tasksQuery.data.content.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong>
            {" — "}
            {task.completed ? "Complete" : "Incomplete"}
            {" — "}
            {projectNames.get(task.projectId) ?? `Project ${task.projectId}`}{" "}
            <Link to="/tasks/$taskId/edit" params={{ taskId: String(task.id) }}>
              Edit
            </Link>{" "}
            <button
              type="button"
              disabled={deleteMutation.isPending && deleteMutation.variables === task.id}
              onClick={() => {
                const confirmed = window.confirm(`Delete "${task.title}"?`)

                if (confirmed) {
                  deleteMutation.mutate(task.id)
                }
              }}
            >
              {deleteMutation.isPending && deleteMutation.variables === task.id
                ? "Deleting..."
                : "Delete"}
            </button>
          </li>
        ))}
      </ul>

      {deleteMutation.isError && <p>Failed to delete task.</p>}

      <div>
        <button
          type="button"
          disabled={tasksQuery.data.first}
          onClick={() =>
            navigate({
              search: (previous) => ({
                ...previous,
                page: previous.page - 1,
              }),
            })
          }
        >
          Previous
        </button>

        <button
          type="button"
          disabled={tasksQuery.data.last}
          onClick={() =>
            navigate({
              search: (previous) => ({
                ...previous,
                page: previous.page + 1,
              }),
            })
          }
        >
          Next
        </button>
      </div>
    </>
  )
}
