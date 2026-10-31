import { createRootRoute, Link, Outlet } from "@tanstack/react-router"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <header>
        <h1>Task App</h1>
        <nav>
          <Link
            to={"/tasks"}
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
            Tasks
          </Link>
          <Link to="/tasks/new">New Task</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  )
}
