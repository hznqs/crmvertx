export function numberFromFormValue(value: FormDataEntryValue | string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const rawValue = String(value ?? "").trim();
  if (!rawValue) {
    return 0;
  }

  const numericValue = rawValue.replace(/[^\d,.-]/g, "");
  if (!numericValue) {
    return 0;
  }

  const normalizedValue = numericValue.includes(",")
    ? numericValue.replace(/\./g, "").replace(",", ".")
    : normalizeDotDecimal(numericValue);

  const number = Number(normalizedValue);
  return Number.isFinite(number) ? number : 0;
}

export function nullableNumberFromFormValue(value: FormDataEntryValue | string | number | null | undefined) {
  const rawValue = String(value ?? "").trim();
  return rawValue ? numberFromFormValue(rawValue) : null;
}

function normalizeDotDecimal(value: string) {
  const dotCount = (value.match(/\./g) ?? []).length;
  if (dotCount <= 1) {
    return value;
  }

  const lastDotIndex = value.lastIndexOf(".");
  return value.slice(0, lastDotIndex).replace(/\./g, "") + value.slice(lastDotIndex);
}
