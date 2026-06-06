"use client";

import { useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useState } from "react";

type SafeActionFormProps = Omit<ComponentPropsWithoutRef<"form">, "action" | "children"> & {
  action: (formData: FormData) => Promise<unknown> | unknown;
  children: ReactNode;
  errorClassName?: string;
  onSuccess?: () => void;
  refreshOnError?: boolean;
  refreshOnSuccess?: boolean;
};

export function SafeActionForm({
  action,
  children,
  className,
  errorClassName = "",
  onSuccess,
  refreshOnError = true,
  refreshOnSuccess = true,
  ...props
}: SafeActionFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runAction(formData: FormData) {
    setErrorMessage(null);

    try {
      const result = await action(formData);
      if (isActionFailure(result)) {
        setErrorMessage(result.message);
        if (refreshOnError) {
          router.refresh();
        }
        return;
      }

      onSuccess?.();
      if (refreshOnSuccess) {
        router.refresh();
      }
    } catch (error) {
      setErrorMessage(actionErrorMessage(error));
      if (refreshOnError) {
        router.refresh();
      }
    }
  }

  return (
    <form action={runAction} className={className} {...props}>
      {errorMessage ? (
        <div
          role="alert"
          className={[
            "rounded-crm border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 shadow-[0_0_24px_rgba(244,63,94,.08)]",
            errorClassName
          ].filter(Boolean).join(" ")}
        >
          {errorMessage}
        </div>
      ) : null}
      {children}
    </form>
  );
}

function actionErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Nao foi possivel concluir esta acao. Atualize a pagina e tente novamente.";
}

function isActionFailure(value: unknown): value is { ok: false; message: string } {
  return Boolean(
    value
    && typeof value === "object"
    && "ok" in value
    && (value as { ok?: unknown }).ok === false
    && "message" in value
    && typeof (value as { message?: unknown }).message === "string"
  );
}
