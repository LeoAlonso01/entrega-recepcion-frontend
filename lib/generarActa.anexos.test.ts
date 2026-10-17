import { generarActa } from "./generarActa";

const textCalls: Array<{ text: string | string[]; x: number; y: number }> = [];

jest.mock("jspdf-autotable", () => jest.fn());

jest.mock("./helpPngPdf", () => ({
    imageToDataUrl: jest.fn().mockResolvedValue("data:image/jpeg;base64,AAAA"),
}));

jest.mock("jspdf", () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            internal: {
                pageSize: {
                    getHeight: () => 279,
                    getWidth: () => 216,
                },
            },
            addImage: jest.fn(),
            addPage: jest.fn(),
            setFont: jest.fn(),
            setFontSize: jest.fn(),
            setPage: jest.fn(),
            getNumberOfPages: jest.fn(() => 1),
            getTextDimensions: jest.fn(() => ({ h: 4 })),
            splitTextToSize: jest.fn((value: string) => [value]),
            rect: jest.fn(),
            line: jest.fn(),
            save: jest.fn(),
            text: jest.fn((text: string | string[], x: number, y: number) => {
                textCalls.push({ text, x, y });
            }),
        })),
    };
});

function normalizeText(value: string | string[]) {
    return Array.isArray(value) ? value.join(" ") : value;
}

describe("generarActa anexos", () => {
    beforeEach(() => {
        textCalls.length = 0;
        jest.clearAllMocks();
    });

    it("muestra la categoria real del anexo y no imprime un texto genérico cuando falta", async () => {
        const actaData = {
            folio: "FOL-ANEXOS-001",
            hora_cierre_acta: "13:45",
            unidad_responsable: "Unidad Demo",
            unidad: "Unidad Demo",
            entrante: "Entrante Demo",
            ine_entrante: "INE-ENT-001",
            domicilio_entrante: "Domicilio entrante",
            saliente: "Saliente Demo",
            ine_saliente: "INE-SAL-001",
            domicilio_saliente: "Domicilio saliente",
            testigo_entrante: "Testigo Entrante",
            testigo_saliente: "Testigo Saliente",
            ine_testigo_entrante: "INE-TENT-001",
            ine_testigo_saliente: "INE-TSAL-001",
            comisionado: "Comisionado Demo",
            ine_comisionado: "INE-COM-001",
            anexos: [
                {
                    categoria: "RECURSOS HUMANOS",
                    clave: "RH01",
                    estado: "Completado",
                    datos: [{ id: 1 }, { id: 2 }, { id: 3 }],
                },
            ],
        };

        await generarActa(actaData);

        const textOnly = textCalls.map((entry) => normalizeText(entry.text));

        expect(textOnly).toContain("RECURSOS HUMANOS");
        expect(textOnly).toContain("RH01");
        expect(textOnly).toContain("3");
        expect(textOnly).toContain("Completado");
        expect(textOnly).not.toContain("CATEGORIA");

        const anexoTitleIndex = textOnly.indexOf("RECURSOS HUMANOS");
        const claveIndex = textOnly.indexOf("RH01");

        expect(anexoTitleIndex).toBeGreaterThan(-1);
        expect(claveIndex).toBeGreaterThan(anexoTitleIndex);
    });

    it("no imprime el texto genérico CATEGORIA cuando la categoria viene vacia", async () => {
        const actaData = {
            folio: "FOL-ANEXOS-002",
            hora_cierre_acta: "13:45",
            unidad_responsable: "Unidad Demo",
            unidad: "Unidad Demo",
            entrante: "Entrante Demo",
            ine_entrante: "INE-ENT-001",
            domicilio_entrante: "Domicilio entrante",
            saliente: "Saliente Demo",
            ine_saliente: "INE-SAL-001",
            domicilio_saliente: "Domicilio saliente",
            testigo_entrante: "Testigo Entrante",
            testigo_saliente: "Testigo Saliente",
            ine_testigo_entrante: "INE-TENT-001",
            ine_testigo_saliente: "INE-TSAL-001",
            comisionado: "Comisionado Demo",
            ine_comisionado: "INE-COM-001",
            anexos: [
                {
                    categoria: "",
                    clave: "RRH01",
                    estado: "Borrador",
                    datos: [{ id: 1 }],
                },
            ],
        };

        await generarActa(actaData);

        const textOnly = textCalls.map((entry) => normalizeText(entry.text));

        expect(textOnly).toContain("RECURSOS HUMANOS");
        expect(textOnly).toContain("RRH01");
        expect(textOnly).not.toContain("CATEGORIA");
    });

    it("usa nombres y datos dinámicos del formulario en el contenido del acta", async () => {
        const actaData = {
            folio: "FOL-ANEXOS-003",
            hora_cierre_acta: "16:30",
            fecha_cierre_acta: "2026-08-05",
            unidad_responsable: "Secretaría Académica",
            unidad: "Secretaría Académica",
            entrante: "Ana López",
            ine_entrante: "INE-ENT-002",
            domicilio_entrante: "Av. Siempre Viva 123",
            saliente: "Carlos Ruiz",
            ine_saliente: "INE-SAL-002",
            domicilio_saliente: "Calle Falsa 456",
            testigo_entrante: "Beatriz Méndez",
            testigo_saliente: "Daniel Flores",
            ine_testigo_entrante: "INE-TENT-002",
            ine_testigo_saliente: "INE-TSAL-002",
            comisionado: "Laura Torres",
            ine_comisionado: "INE-COM-002",
            oficio_comision: "OFICIO-100",
            fecha_oficio_comision: "2026-08-01",
            anexos: [],
        };

        await generarActa(actaData);

        const textOnly = textCalls.map((entry) => normalizeText(entry.text)).join(" ");

        expect(textOnly).toContain("Ana López");
        expect(textOnly).toContain("Carlos Ruiz");
        expect(textOnly).toContain("Laura Torres");
        expect(textOnly).toContain("OFICIO-100");
        expect(textOnly).toContain("2026-08-01");
    });
});