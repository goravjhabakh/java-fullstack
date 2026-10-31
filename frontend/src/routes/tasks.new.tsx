import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { getApiError } from "../api/client"
import { getProjects } from "../api/projects"
import { createTask } from "../api/tasks"

export const Route = createFileRoute("/tasks/new")({
  component: NewTaskPage,
})

function NewTaskPage() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()

  const [projectId, setProjectId] = useState("")
  const [title, setTitle] = useState("")

  const projectsQuery = useQuery({
    queryKey: ["projects", "list"],
    queryFn: getProjects,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createTask(Number(projectId), {
        title,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tasks", "list"],
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
    },
  })

  if (projectsQuery.isPending) {
    return <p>Loading projects...</p>
  }

  if (projectsQuery.isError) {
    const error = getApiError(projectsQuery.error)

    return (
      <>
        <p>{error.message}</p>

        <button
          type="button"
          onClick={() => {
            void projectsQuery.refetch()
          }}
        >
          Retry
        </button>
      </>
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
    <>
      <h2>Create Task</h2>

      {projects.length === 0 ? (
        <p>You need at least one project before creating a task.</p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()

            if (!canSubmit) {
              return
            }

            createMutation.mutate()
          }}
        >
          <div>
            <label>
              Project
              <select
                value={projectId}
                onChange={(event) => {
                  setProjectId(event.target.value)
                }}
              >
                <option value="">Select project</option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              Title
              <input
                value={title}
                maxLength={100}
                onChange={(event) => {
                  setTitle(event.target.value)
                }}
              />
            </label>

            {titleError && <p>{titleError}</p>}
          </div>

          {error && !titleError && <p>{error.message}</p>}

          <button type="submit" disabled={!canSubmit}>
            {createMutation.isPending ? "Creating..." : "Create Task"}
          </button>
        </form>
      )}
    </>
  )
}
