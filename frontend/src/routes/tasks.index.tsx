import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { getProjects } from "../api/projects"
import { getTasks, type TaskListParameters } from "../api/tasks"

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

  const parameters: TaskListParameters = {
    page: search.page,
    size: search.size,
    completed: search.completed,
    projectId: search.projectId,
    title: search.title,
    sortBy: search.sortBy,
    direction: search.direction,
  }

  const tasksQuery = useQuery({
    queryKey: ["tasks", "list", parameters],
    queryFn: () => getTasks(parameters),
  })

  const projectsQuery = useQuery({
    queryKey: ["projects", "list"],
    queryFn: getProjects,
  })

  if (tasksQuery.isPending || projectsQuery.isPending) {
    return <p>Loading...</p>
  }

  if (tasksQuery.isError || projectsQuery.isError) {
    return <p>Failed to load data.</p>
  }

  const projectNames = new Map(projectsQuery.data.map((project) => [project.id, project.name]))

  if (tasksQuery.data.content.length === 0) {
    return (
      <>
        <h2>Tasks</h2>
        <p>No tasks found.</p>
      </>
    )
  }

  return (
    <>
      <h2>Tasks</h2>

      <p>
        Page {tasksQuery.data.page + 1} of {tasksQuery.data.totalPages}
      </p>

      <p>Total tasks: {tasksQuery.data.totalElements}</p>

      <ul>
        {tasksQuery.data.content.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong>
            {" — "}
            {task.completed ? "Complete" : "Incomplete"}
            {" — "}
            {projectNames.get(task.projectId) ?? `Project ${task.projectId}`}
          </li>
        ))}
      </ul>

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
