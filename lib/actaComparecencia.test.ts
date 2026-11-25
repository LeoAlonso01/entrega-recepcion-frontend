import { normalizarActaPdf } from "./actaPdfData";
import { parrafosComparecencia } from "./actaComparecencia";

const base = { folio: "PRUEBA", unidad_nombre: "Unidad de prueba", fecha: "2026-11-25", hora: "10:00",
  entrante: "Persona Entrante", saliente: "Persona Saliente", ine_entrante: "0000123", domicilio_entrante: "Domicilio del entrante" };

it("conserva la comparecencia anterior cuando no hay lugar ni datos nuevos del saliente", () => {
  const parrafos = parrafosComparecencia(normalizarActaPdf(base));
  expect(parrafos[0]).toBe("Se levanta la presente Acta Administrativa de Entrega-Recepción de la unidad responsable denominada Unidad de prueba, el día 25 de noviembre de 2026, a las 10:00 horas.");
  expect(parrafos[1]).toBe("Comparece Persona Saliente, en su carácter de persona servidora pública saliente, quien hace entrega de la unidad.");
  expect(parrafos[2]).toBe("Asimismo comparece Persona Entrante, en su carácter de persona servidora pública entrante, quien se identifica con credencial del Instituto Nacional Electoral número 0000123, con domicilio para notificaciones en Domicilio del entrante, quien recibe la unidad.");
});

it("no inventa lugar ni datos de identificación cuando faltan campos opcionales", () => {
  const texto = parrafosComparecencia(normalizarActaPdf({ ...base, lugar_acta: "  ", domicilio_saliente: "Domicilio del saliente", ine_entrante: "", domicilio_entrante: "" })).join(" ");
  expect(texto).toContain("Comparece Persona Saliente, quien señala como domicilio");
  expect(texto).toContain("Asimismo comparece Persona Entrante, en su carácter");
  expect(texto).not.toContain("Morelia");
  expect(texto).not.toContain("undefined");
  expect(texto).not.toContain("número ,");
});
