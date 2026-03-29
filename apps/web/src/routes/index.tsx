import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { client, runApi } from "@/lib/api"

export const Route = createFileRoute("/")({
  component: HealthPage,
})

function HealthPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["health"],
    queryFn: () => runApi(client.Health.health()),
  })

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">stemma</h1>
        {isLoading && (
          <p className="text-muted-foreground">Checking backend...</p>
        )}
        {isError && (
          <p className="text-destructive">
            Backend unreachable: {String(error)}
          </p>
        )}
        {data && <p className="text-green-600">Backend status: {data}</p>}
      </div>
    </div>
  )
}
