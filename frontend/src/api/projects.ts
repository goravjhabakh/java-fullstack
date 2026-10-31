import { apiRequest } from "./client"

export type Project = {
  id: number
  name: string
}

export function getProjects() {
  return apiRequest<Project[]>("/projects")
}
