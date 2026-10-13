import { describe, expect, it, vi } from "vitest";
import { createStorageChannel } from "./storage";

const channel = createStorageChannel("test-key", "test:change");

describe("createStorageChannel", () => {
  it("lee y escribe en localStorage", () => {
    expect(channel.read()).toBeNull();

    channel.write("valor");

    expect(localStorage.getItem("test-key")).toBe("valor");
    expect(channel.read()).toBe("valor");
  });

  it("elimina la clave al escribir null", () => {
    channel.write("valor");
    channel.write(null);

    expect(localStorage.getItem("test-key")).toBeNull();
  });

  it("avisa a los suscriptores de la pestaña actual al escribir", () => {
    const callback = vi.fn();
    const unsubscribe = channel.subscribe(callback);

    channel.write("a");
    channel.write(null);

    expect(callback).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("escucha el evento storage de otras pestañas solo para su clave", () => {
    const callback = vi.fn();
    const unsubscribe = channel.subscribe(callback);

    window.dispatchEvent(new StorageEvent("storage", { key: "otra-clave" }));
    expect(callback).not.toHaveBeenCalled();

    window.dispatchEvent(new StorageEvent("storage", { key: "test-key" }));
    expect(callback).toHaveBeenCalledTimes(1);

    // key null significa que se limpió todo el localStorage
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
    expect(callback).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it("deja de avisar después de desuscribirse", () => {
    const callback = vi.fn();
    const unsubscribe = channel.subscribe(callback);

    unsubscribe();
    channel.write("a");
    window.dispatchEvent(new StorageEvent("storage", { key: "test-key" }));

    expect(callback).not.toHaveBeenCalled();
  });
});
