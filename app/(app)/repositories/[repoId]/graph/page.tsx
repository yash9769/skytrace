import { notFound } from "next/navigation";
import { DependencyGraph } from "@/components/graph/dependency-graph";
import { getRepository, repositoryGraphs } from "@/lib/mock-data";

export default async function RepositoryGraphPage({
  params,
  searchParams,
}: {
  params: Promise<{ repoId: string }>;
  searchParams: Promise<{ focus?: string }>;
}) {
  const { repoId } = await params;
  const { focus } = await searchParams;
  const repo = getRepository(repoId);
  const graph = repositoryGraphs[repoId];
  if (!repo || !graph) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dependency &amp; call graph</h1>
        <p className="text-sm text-muted-foreground">
          {repo.fullName} · {graph.nodes.length} nodes · {graph.edges.length} relationships
        </p>
      </div>
      <DependencyGraph repositoryId={repoId} graph={graph} focusId={focus} />
    </div>
  );
}
