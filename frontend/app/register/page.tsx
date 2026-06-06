import { AuthShell } from "@/components/auth/auth-shell";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Acesso controlado"
      title={<>Cadastro por <span className="text-brand-400">aprovação.</span></>}
      description="Por segurança, novos acessos são criados por um administrador da assessoria. Isso evita contas soltas e mantém permissões sob controle."
    >
      <div className="mt-6 space-y-4 xl:mt-8">
        <div className="rounded-2xl border border-brand-400/20 bg-brand-500/10 p-5 text-sm leading-6 text-zinc-200">
          Solicite ao administrador responsável a criação do seu usuário com o cargo correto. Depois de aprovado, use a tela de login para acessar o CRM.
        </div>
        <Link
          href="/login"
          className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 px-5 text-base font-black text-white shadow-[0_22px_70px_rgba(106,13,173,.35)] transition duration-premium ease-premium hover:-translate-y-0.5 hover:brightness-110 focus-visible:shadow-focus xl:min-h-16"
        >
          Voltar para login
        </Link>
      </div>
    </AuthShell>
  );
}
