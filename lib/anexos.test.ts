import { mergeAnexosConCategorias } from "./anexos";

describe("mergeAnexosConCategorias", () => {
    it("recupera la categoria desde el catalogo por id o por clave", () => {
        const anexosActa = [
            { id: 10, clave: "RRH01" },
            { id: 11, clave: "MJ01" },
            { clave: "RF04" },
        ];

        const catalogo = [
            { id: 10, clave: "RRH01", categoria: "RECURSOS HUMANOS" },
            { id: 11, clave: "MJ01", categoria: "MARCO JURIDICO" },
            { id: 12, clave: "RF04", categoria: "RECURSOS FINANCIEROS" },
        ];

        const resultado = mergeAnexosConCategorias(anexosActa, catalogo);

        expect(resultado).toEqual([
            { id: 10, clave: "RRH01", categoria: "RECURSOS HUMANOS" },
            { id: 11, clave: "MJ01", categoria: "MARCO JURIDICO" },
            { clave: "RF04", categoria: "RECURSOS FINANCIEROS" },
        ]);
    });

    it("preserva la categoria existente del acta cuando ya viene completa", () => {
        const resultado = mergeAnexosConCategorias(
            [{ id: 1, clave: "PP01", categoria: "PROGRAMACION" }],
            [{ id: 1, clave: "PP01", categoria: "OTRA" }]
        );

        expect(resultado).toEqual([
            { id: 1, clave: "PP01", categoria: "PROGRAMACION" },
        ]);
    });
});