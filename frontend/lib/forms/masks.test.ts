import { formatByMask, validateMaskedValue } from "@/lib/forms/masks";

describe("form masks", () => {
  it("formats Brazilian documents, phone and CEP", () => {
    expect(formatByMask("cpf", "12345678909").displayValue).toBe("123.456.789-09");
    expect(formatByMask("cnpj", "11222333000181").displayValue).toBe("11.222.333/0001-81");
    expect(formatByMask("phone", "11999998888").displayValue).toBe("(11) 99999-8888");
    expect(formatByMask("cep", "01310930").displayValue).toBe("01310-930");
  });

  it("formats money and percentage while keeping backend-safe values", () => {
    expect(formatByMask("currency", "123456").displayValue).toBe("R$ 1.234,56");
    expect(formatByMask("currency", "123456").submitValue).toBe("1234.56");
    expect(formatByMask("percentage", "150").displayValue).toBe("100%");
    expect(formatByMask("percentage", "150").submitValue).toBe("100");
  });

  it("validates CPF, CNPJ, phone, email and CEP", () => {
    expect(validateMaskedValue("cpf", "12345678909")).toBe("");
    expect(validateMaskedValue("cnpj", "11222333000181")).toBe("");
    expect(validateMaskedValue("phone", "11999998888")).toBe("");
    expect(validateMaskedValue("email", "contato@empresa.com")).toBe("");
    expect(validateMaskedValue("cep", "01310930")).toBe("");
    expect(validateMaskedValue("email", "email-invalido")).toBe("Email invalido.");
  });
});
