import { ProfileForm } from "@/components/admin/profile-form";
import { getProfile } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const profile = await getProfile();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight text-primary">
          Perfil
        </h1>
        <p className="text-sm text-secondary">
          Alimenta a home, a página Sobre e os links do rodapé.
        </p>
      </header>

      <ProfileForm profile={profile ?? null} />
    </div>
  );
}
