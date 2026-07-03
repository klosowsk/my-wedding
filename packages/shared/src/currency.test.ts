import { describe, expect, test } from "bun:test";
import { formatCurrency, formatCurrencyAmount, getCurrencySymbol } from "./currency";

const NBSP = " ";

describe("formatCurrency", () => {
  test("formats BRL in pt-BR by default", () => {
    expect(formatCurrency(123456)).toBe(`R$${NBSP}1.234,56`);
  });

  test("formats zero", () => {
    expect(formatCurrency(0)).toBe(`R$${NBSP}0,00`);
  });
});

describe("formatCurrencyAmount", () => {
  test("formats plain decimal without symbol (pt-BR)", () => {
    expect(formatCurrencyAmount(123456)).toBe("1.234,56");
  });

  test("always shows two decimals", () => {
    expect(formatCurrencyAmount(5000)).toBe("50,00");
    expect(formatCurrencyAmount(1)).toBe("0,01");
  });

  test("respects locale override", () => {
    expect(formatCurrencyAmount(123456, { locale: "en-US", code: "USD" })).toBe("1,234.56");
  });
});

describe("getCurrencySymbol", () => {
  test("returns R$ for defaults", () => {
    expect(getCurrencySymbol()).toBe("R$");
  });
});
