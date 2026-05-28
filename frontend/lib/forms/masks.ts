export type MaskType =
  | "cpf"
  | "cnpj"
  | "cpfCnpj"
  | "phone"
  | "cep"
  | "currency"
  | "percentage"
  | "integer"
  | "decimal"
  | "date"
  | "email";

export type MaskResult = {
  displayValue: string;
  submitValue: string;
};

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeDecimal(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

export function formatByMask(type: MaskType, rawValue: string): MaskResult {
  switch (type) {
    case "cpf": {
      const digits = onlyDigits(rawValue).slice(0, 11);
      return { displayValue: formatCpf(digits), submitValue: digits };
    }
    case "cnpj": {
      const digits = onlyDigits(rawValue).slice(0, 14);
      return { displayValue: formatCnpj(digits), submitValue: digits };
    }
    case "cpfCnpj": {
      const digits = onlyDigits(rawValue).slice(0, 14);
      return {
        displayValue: digits.length > 11 ? formatCnpj(digits) : formatCpf(digits),
        submitValue: digits
      };
    }
    case "phone": {
      const digits = onlyDigits(rawValue).slice(0, 11);
      return { displayValue: formatPhone(digits), submitValue: digits };
    }
    case "cep": {
      const digits = onlyDigits(rawValue).slice(0, 8);
      return { displayValue: formatCep(digits), submitValue: digits };
    }
    case "currency": {
      const cents = onlyDigits(rawValue);
      const number = cents ? Number(cents) / 100 : 0;
      return { displayValue: formatCurrencyInput(number), submitValue: number.toFixed(2) };
    }
    case "percentage": {
      const digits = onlyDigits(rawValue).slice(0, 5);
      const number = Math.min(Number(digits || 0), 100);
      return { displayValue: `${number}%`, submitValue: String(number) };
    }
    case "integer": {
      const digits = onlyDigits(rawValue);
      return { displayValue: digits, submitValue: digits || "0" };
    }
    case "decimal": {
      const decimal = rawValue.replace(/[^\d,.\-]/g, "").replace(",", ".");
      return { displayValue: decimal, submitValue: decimal || "0" };
    }
    case "date": {
      const digits = onlyDigits(rawValue).slice(0, 8);
      return { displayValue: formatDateInput(digits), submitValue: dateDisplayToIso(formatDateInput(digits)) };
    }
    case "email":
      return { displayValue: rawValue.trimStart(), submitValue: rawValue.trim() };
  }
}

export function initialDisplayValue(type: MaskType, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value);
  if (type === "currency") return formatCurrencyInput(Number(raw));
  if (type === "percentage") return `${Math.min(Number(raw), 100)}%`;
  if (type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-");
    return `${day}/${month}/${year}`;
  }
  return formatByMask(type, raw).displayValue;
}

export function initialSubmitValue(type: MaskType, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  if (type === "currency") return Number(value).toFixed(2);
  if (type === "percentage" || type === "integer" || type === "decimal") return String(value);
  if (type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  return formatByMask(type, String(value)).submitValue;
}

export function validateMaskedValue(type: MaskType, value: string, required = false) {
  if (!value) return required ? "Campo obrigatorio." : "";
  switch (type) {
    case "cpf":
      return isValidCpf(value) ? "" : "CPF invalido.";
    case "cnpj":
      return isValidCnpj(value) ? "" : "CNPJ invalido.";
    case "cpfCnpj":
      return value.length <= 11
        ? (isValidCpf(value) ? "" : "CPF invalido.")
        : (isValidCnpj(value) ? "" : "CNPJ invalido.");
    case "phone":
      return onlyDigits(value).length >= 10 ? "" : "Telefone incompleto.";
    case "cep":
      return onlyDigits(value).length === 8 ? "" : "CEP incompleto.";
    case "currency":
      return Number(value) >= 0 ? "" : "Valor monetario invalido.";
    case "percentage":
      return Number(value) >= 0 && Number(value) <= 100 ? "" : "Percentual deve ficar entre 0 e 100.";
    case "date":
      return isValidDateDisplay(value) ? "" : "Data invalida.";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Email invalido.";
    default:
      return "";
  }
}

function formatCpf(digits: string) {
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function formatCnpj(digits: string) {
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

function formatPhone(digits: string) {
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/^(\(\d{2}\) \d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/^(\(\d{2}\) \d{5})(\d)/, "$1-$2");
}

function formatCep(digits: string) {
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

function formatDateInput(digits: string) {
  return digits.replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

function dateDisplayToIso(value: string) {
  const [day, month, year] = value.split("/");
  return day?.length === 2 && month?.length === 2 && year?.length === 4 ? `${year}-${month}-${day}` : "";
}

function formatCurrencyInput(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0).replace(/\u00A0/g, " ");
}

function isValidDateDisplay(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (length: number) => {
    const sum = cpf.slice(0, length).split("").reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

function isValidCnpj(value: string) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (base: string, weights: number[]) => {
    const sum = base.split("").reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const first = calc(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calc(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === Number(cnpj[12]) && second === Number(cnpj[13]);
}
