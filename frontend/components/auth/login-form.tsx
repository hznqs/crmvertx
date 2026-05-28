"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormattedInput } from "@/components/ui/formatted-input";

type LoginFormProps = {
  redirectPath: string;
};

type LoginResult = {
  redirectPath?: string;
};

export function LoginForm({ redirectPath }: LoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
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
      setErrorMessage("Nao foi possivel entrar. Verifique email, senha e backend.");
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
    <form action={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-zinc-300">Email</span>
        <FormattedInput name="email" mask="email" required className="mt-2" placeholder="voce@empresa.com" />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-zinc-300">Senha</span>
        <input
          name="password"
          type="password"
          required
          className="crm-control mt-2 w-full"
          placeholder="Sua senha"
        />
      </label>

      {errorMessage ? (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="crm-button-primary w-full disabled:cursor-wait"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
