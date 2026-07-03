import { describe, expect, test } from "bun:test";
import {
  formatEventDate,
  getEventDateParts,
  intlLocaleFor,
  isRsvpDeadlinePassed,
} from "./dates";

describe("intlLocaleFor", () => {
  test("maps supported locales", () => {
    expect(intlLocaleFor("pt-BR")).toBe("pt-BR");
    expect(intlLocaleFor("en")).toBe("en-US");
    expect(intlLocaleFor("es")).toBe("es-ES");
  });

  test("falls back to pt-BR", () => {
    expect(intlLocaleFor("fr")).toBe("pt-BR");
  });
});

describe("formatEventDate", () => {
  test("long style per locale", () => {
    expect(formatEventDate("2026-12-31", "pt-BR")).toBe("31 de dezembro de 2026");
    expect(formatEventDate("2026-12-31", "en")).toBe("December 31, 2026");
    expect(formatEventDate("2026-12-31", "es")).toBe("31 de diciembre de 2026");
  });

  test("short style uses locale ordering", () => {
    expect(formatEventDate("2026-12-31", "pt-BR", "short")).toBe("31/12/2026");
    expect(formatEventDate("2026-12-31", "en", "short")).toBe("12/31/2026");
  });
});

describe("getEventDateParts", () => {
  test("localized parts for the invite date block (pt-BR)", () => {
    expect(getEventDateParts("2026-11-07", "pt-BR")).toEqual({
      weekday: "sábado",
      day: "07",
      month: "novembro",
      year: "2026",
    });
  });

  test("localized parts in English", () => {
    expect(getEventDateParts("2026-11-07", "en")).toEqual({
      weekday: "Saturday",
      day: "07",
      month: "November",
      year: "2026",
    });
  });
});

describe("isRsvpDeadlinePassed", () => {
  test("false when no deadline is set", () => {
    expect(isRsvpDeadlinePassed(null)).toBe(false);
    expect(isRsvpDeadlinePassed(undefined)).toBe(false);
    expect(isRsvpDeadlinePassed("")).toBe(false);
  });

  test("open during the deadline day in Sao Paulo", () => {
    const now = new Date("2026-08-10T23:00:00-03:00");
    expect(isRsvpDeadlinePassed("2026-08-10", now)).toBe(false);
  });

  test("closed after the deadline day ends in Sao Paulo", () => {
    const now = new Date("2026-08-11T00:00:01-03:00");
    expect(isRsvpDeadlinePassed("2026-08-10", now)).toBe(true);
  });

  test("boundary: 23:59:59 -03:00 is still open", () => {
    const now = new Date("2026-08-10T23:59:59-03:00");
    expect(isRsvpDeadlinePassed("2026-08-10", now)).toBe(false);
  });
});
