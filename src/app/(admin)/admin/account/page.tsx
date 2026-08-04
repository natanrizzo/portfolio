import { PasswordForm } from "@/components/admin/password-form";
import { requireUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight text-primary">
          Conta
        </h1>
        <p className="text-sm text-secondary">
          Acesso de {user.email}.
        </p>
      </header>

      <PasswordForm />
    </div>
  );
}
