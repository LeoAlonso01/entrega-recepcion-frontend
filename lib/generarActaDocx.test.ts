import { saveAs } from "file-saver";
import { generarActaDocx } from "./generarActaDocx";
import { TextDecoder, TextEncoder } from "util";

jest.mock("file-saver", () => ({
    saveAs: jest.fn(),
}));

const mockedSaveAs = saveAs as jest.MockedFunction<typeof saveAs>;

async function toArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    if (typeof (blob as any).arrayBuffer === "function") {
        return (blob as any).arrayBuffer();
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(blob);
    });
}

const baseActa = {
    folio: "FOL-001",
    hora_cierre_acta: "13:45",
    fecha_cierre_acta: "2026-08-05",
    saliente: { nombre: "Saliente Demo" },
    entrante: { nombre: "Entrante Demo" },
    testigo_entrante: { nombre: "Testigo Entrante" },
    testigo_saliente: { nombre: "Testigo Saliente" },
    comisionado: { nombre: "Comisionado Demo" },
    unidad_responsable: { nombre: "Unidad de Prueba" },
    ine_entrante: "INE-ENT-001",
    domicilio_entrante: "Domicilio entrante",
    ine_saliente: "INE-SAL-001",
    domicilio_saliente: "Domicilio saliente",
    ine_testigo_entrante: "INE-TENT-001",
    ine_testigo_saliente: "INE-TSAL-001",
    ine_comisionado: "INE-COM-001",
    anexos: [
        {
            categoria: "RECURSOS HUMANOS",
            clave: "RH-01",
            estado: "Entregado",
            datos: [{ id: 1 }, { id: 2 }],
        },
    ],
};

describe("generarActaDocx", () => {
    beforeAll(() => {
        (global as any).TextEncoder = TextEncoder;
        (global as any).TextDecoder = TextDecoder;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("genera un .docx valido y llama a saveAs con el nombre esperado", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            arrayBuffer: async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9]).buffer,
        }) as any;

        await generarActaDocx(baseActa);

        expect(mockedSaveAs).toHaveBeenCalledTimes(1);

        const [blobArg, fileNameArg] = mockedSaveAs.mock.calls[0];
        expect(fileNameArg).toBe("acta_FOL-001.docx");
        expect(blobArg).toBeInstanceOf(Blob);

        if (!(blobArg instanceof Blob)) {
            throw new Error("Se esperaba un Blob generado por docx");
        }

        expect(blobArg.size).toBeGreaterThan(0);

        const headerBytes = new Uint8Array(await toArrayBuffer(blobArg)).slice(0, 4);
        const zipSignature = String.fromCharCode(...headerBytes);

        expect(zipSignature).toBe("PK\u0003\u0004");
    });

    it("genera el .docx aun si el logo no se puede cargar", async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false }) as any;

        await expect(generarActaDocx(baseActa)).resolves.not.toThrow();
        expect(mockedSaveAs).toHaveBeenCalledTimes(1);
    });

    it("genera el .docx si fetch devuelve contenido no-imagen para logo", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            headers: {
                get: () => "text/html; charset=utf-8",
            },
            arrayBuffer: async () => new TextEncoder().encode("<html>fallback</html>").buffer,
        }) as any;

        await expect(generarActaDocx(baseActa)).resolves.not.toThrow();
        expect(mockedSaveAs).toHaveBeenCalledTimes(1);
    });

    it("genera el .docx si el servidor reporta image/jpeg pero bytes invalidos", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            headers: {
                get: () => "image/jpeg",
            },
            arrayBuffer: async () => new TextEncoder().encode("<html>not-really-an-image</html>").buffer,
        }) as any;

        await expect(generarActaDocx(baseActa)).resolves.not.toThrow();
        expect(mockedSaveAs).toHaveBeenCalledTimes(1);
    });

    it("genera el .docx con texto de entrada con caracteres de control invalidos", async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false }) as any;

        const actaConCaracteresInvalidos = {
            ...baseActa,
            saliente: { nombre: "Saliente\u0000\u0007 Demo" },
            entrante: { nombre: "Entrante\u001F Demo" },
            unidad_responsable: { nombre: "Unidad\u000B Prueba" },
        };

        await expect(generarActaDocx(actaConCaracteresInvalidos)).resolves.not.toThrow();
        expect(mockedSaveAs).toHaveBeenCalledTimes(1);
    });
});