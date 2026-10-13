import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { resetMemoryDatabase } from "@huerto/shared/testing";

// jsdom no tiene IndexedDB: las funciones de la base de datos se reemplazan
// por una versión en memoria con los productos iniciales
vi.mock(import("@huerto/shared"), async (importOriginal) => {
  const { memoryDatabase } = await import("@huerto/shared/testing");

  return { ...(await importOriginal()), ...memoryDatabase };
});

beforeEach(() => {
  resetMemoryDatabase();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
