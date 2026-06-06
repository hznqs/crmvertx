"use client";

import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type LoginFormProps = {
  redirectPath: string;
};

type LoginResult = {
  redirectPath?: string;
};

export function LoginForm({ redirectPath }: LoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setErrorMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        redirectPath
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null) as { message?: unknown } | null;
      setErrorMessage(
        typeof error?.message === "string" && error.message.trim()
          ? error.message
          : "Nao foi possivel entrar. Verifique email, senha e backend."
      );
      return;
    }

    const result = (await response.json().catch(() => ({}))) as LoginResult;
    const nextPath = result.redirectPath ?? redirectPath;

    startTransition(() => {
      router.replace(nextPath);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4 xl:mt-8 xl:space-y-5">
      <label className="block">
        <span className="text-sm font-bold text-white">Email</span>
        <span className="mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,.035)] transition focus-within:border-brand-400 focus-within:shadow-focus xl:mt-3 xl:min-h-14">
          <Mail className="h-5 w-5 text-zinc-400" aria-hidden />
          <input
            name="email"
            type="email"
            required
            className="min-h-0 flex-1 border-0 bg-transparent px-0 text-base text-white shadow-none outline-none placeholder:text-zinc-500 focus:shadow-none"
            placeholder="seu@email.com"
          />
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-bold text-white">Senha</span>
        <span className="mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,.035)] transition focus-within:border-brand-400 focus-within:shadow-focus xl:mt-3 xl:min-h-14">
          <Lock className="h-5 w-5 text-zinc-400" aria-hidden />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="min-h-0 flex-1 border-0 bg-transparent px-0 text-base text-white shadow-none outline-none placeholder:text-zinc-500 focus:shadow-none"
            placeholder="Sua senha"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
          </button>
        </span>
      </label>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="inline-flex items-center gap-3 font-medium text-zinc-300">
          <input type="checkbox" className="h-5 w-5 rounded border-white/15 bg-white/[0.04] accent-brand-500" defaultChecked />
          Lembrar de mim
        </label>
        <span className="text-right font-semibold text-zinc-500">
          Recuperação via administrador
        </span>
      </div>

      {errorMessage ? (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="group mt-1 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 px-5 text-base font-black text-white shadow-[0_22px_70px_rgba(106,13,173,.35)] transition duration-premium ease-premium hover:-translate-y-0.5 hover:brightness-110 focus-visible:shadow-focus disabled:cursor-wait disabled:opacity-60 xl:mt-2 xl:min-h-16"
      >
        {isPending ? "Entrando..." : "Entrar na plataforma"}
        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden />
      </button>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 pt-4 text-sm text-zinc-500 xl:pt-6">
        <span className="h-px bg-white/10" />
        ou
        <span className="h-px bg-white/10" />
      </div>

      <p className="text-center text-base text-zinc-300">
        Precisa de acesso?{" "}
        <Link href="/register" className="font-bold text-brand-400 transition hover:text-brand-300">
          Ver instrucoes
        </Link>
      </p>
    </form>
  );
}
