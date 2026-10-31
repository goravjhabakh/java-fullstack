import { apiRequest } from "./client"

export type Task = {
  id: number
  title: string
  completed: boolean
  projectId: number
}

export type TaskPage = {
  content: Task[]
  page: number
  size: number
  numberOfElements: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export type TaskListParameters = {
  page: number
  size: number
  completed?: boolean
  projectId?: number
  title?: string
  sortBy: "id" | "title" | "completed"
  direction: "asc" | "desc"
}

export type CreateTaskInput = {
  title: string
}

export type UpdateTaskInput = {
  title?: string
  completed?: boolean
}

export function getTasks(parameters: TaskListParameters) {
  const searchParams = new URLSearchParams()

  searchParams.set("page", String(parameters.page))
  searchParams.set("size", String(parameters.size))
  searchParams.set("sortBy", parameters.sortBy)
  searchParams.set("direction", parameters.direction)

  if (parameters.completed !== undefined) {
    searchParams.set("completed", String(parameters.completed))
  }

  if (parameters.projectId !== undefined) {
    searchParams.set("projectId", String(parameters.projectId))
  }

  if (parameters.title) {
    searchParams.set("title", parameters.title)
  }

  return apiRequest<TaskPage>(`/tasks?${searchParams.toString()}`)
}
