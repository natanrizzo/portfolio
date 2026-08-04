import { TagManager } from "@/components/admin/tag-manager";
import { getAllTags } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getAllTags();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight text-primary">
          Tecnologias
        </h1>
        <p className="text-sm text-secondary">
          As tags que você associa a cada projeto.
        </p>
      </header>

      <TagManager tags={tags} />
    </div>
  );
}
