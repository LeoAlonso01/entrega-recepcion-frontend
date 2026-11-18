import { categoria_anexos } from "./anexosCatalogo";
import { clavesHabilitables, contarAnexosUsuario, validarClavesHabilitadas } from "./habilitacionAnexos";

describe("habilitación de anexos por usuario", () => {
  it("solo ofrece claves con categoría válida y estructura disponible", () => {
    expect(clavesHabilitables.length).toBeGreaterThan(0);
    for (const clave of clavesHabilitables) {
      expect(categoria_anexos.some(categoria => categoria.id === clave.id_categoria)).toBe(true);
    }
  });

  it("valida asignaciones locales y elimina claves duplicadas", () => {
    const clave = clavesHabilitables[0].clave;
    expect(validarClavesHabilitadas([clave, clave])).toEqual([clave]);
    expect(validarClavesHabilitadas([])).toEqual([]);
    expect(() => validarClavesHabilitadas(["INEXISTENTE"])).toThrow();
    expect(() => validarClavesHabilitadas([4])).toThrow();
    expect(() => validarClavesHabilitadas({})).toThrow();
  });

  it("cuenta claves únicas habilitadas, excluyendo eliminados y otros creadores", () => {
    const resumen = contarAnexosUsuario(1, ["MJ01", "RH01", "RF01"], [
      { creador_id: 1, clave: "MJ01", estado: "Borrador" },
      { creador_id: 1, clave: "MJ01", estado: "Completado" },
      { creador_id: 1, clave: " rrh01 ", estado: "Revisión" },
      { creador_id: 1, clave: "RF01", estado: "Completado", is_deleted: true },
      { creador_id: 2, clave: "RF01", estado: "Completado" },
      { creador_id: 1, clave: "AG01", estado: "Completado" },
    ]);
    expect(resumen).toMatchObject({ registros: 4, habilitadas: 3, creadas: 2, completadas: 1, pendientes: 2, sinCrear: 1 });
  });

  it("incluye usuarios sin registros y sin asignaciones", () => {
    expect(contarAnexosUsuario(5, ["MJ01"], [])).toMatchObject({ registros: 0, habilitadas: 1, pendientes: 1, sinCrear: 1 });
    expect(contarAnexosUsuario(5, [], [])).toMatchObject({ registros: 0, habilitadas: 0, pendientes: 0 });
  });
});
