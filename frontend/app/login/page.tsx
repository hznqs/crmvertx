import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { safeInternalPath } from "@/lib/auth/routes";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectPath = safeRedirectPath(firstParam(params?.next));

  return (
    <AuthShell
      eyebrow="Acesso seguro ao CRM"
      title={<>Bem-vindo de <span className="text-brand-400">volta.</span></>}
      description="Acesse sua conta e continue gerenciando clientes, campanhas, contratos e resultados."
    >
      <LoginForm redirectPath={redirectPath} />
    </AuthShell>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeRedirectPath(path: string | undefined) {
  return safeInternalPath(path);
}
