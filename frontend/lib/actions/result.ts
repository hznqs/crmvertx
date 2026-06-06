export type ServerActionResult = { ok: true } | { ok: false; message: string };

export async function safeServerAction(
  action: () => Promise<void>,
  fallbackMessage = "Nao foi possivel concluir esta acao."
): Promise<ServerActionResult> {
  try {
    await action();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: actionErrorMessage(error, fallbackMessage) };
  }
}

export function ensureActionSucceeded(result: ServerActionResult) {
  if (!result.ok) {
    throw new Error(result.message);
  }
}

function actionErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}
