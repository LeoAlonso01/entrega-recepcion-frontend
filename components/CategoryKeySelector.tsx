"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const categoria_anexos = [
    {
        "id": "1",
        "nombre_categoria": "Recursos presupuestales y financieros"
    },
    {
        "id": "2",
        "nombre_categoria": "Contratos, Convenios y Licitaciones"
    },
    {
        "id": "3",
        "nombre_categoria": "Estructura y Normativa Interna"
    },
    {
        "id": "4",
        "nombre_categoria": "Recursos Humanos"
    },
    {
        "id": "5",
        "nombre_categoria": "Inventario de Bienes Muebles e Inmuebles"
    },
    {
        "id": "6",
        "nombre_categoria": "Seguridad y Control de Accesos"
    },
    {
        "id": "7",
        "nombre_categoria": "Documentación y Archivo"
    },
    {
        "id": "8",
        "nombre_categoria": "Asuntos Legales y de Auditoría"
    },
    {
        "id": "9",
        "nombre_categoria": "Programas y Proyectos:"
    },
    {
        "id": "10",
        "nombre_categoria": "Transparencia"
    },
    {
        "id": "11",
        "nombre_categoria": "Otros"
    },
    {
        "id": "12",
        "nombre_categoria": "SIN CATEGORÍA"
    }
]

const claves_anexos = [
    {
        "id": "1",
        "clave": "RF01",
        "descripcion": "PRESUPUESTO AUTORIZADO Y EJERCIDO",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "2",
        "clave": "RF02",
        "descripcion": "PRESUPUESTO DE OTROS INGRESOS Y EGRESOS PROPIOS",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "3",
        "clave": "RF03",
        "descripcion": "RECURSOS FEDERALES RECIBIDOS",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "4",
        "clave": "RF04",
        "descripcion": "PRESUPUESTO PARA PROGRAMAS ESPECIALES",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "5",
        "clave": "RF05",
        "descripcion": "RELACION DE CUENTAS BANCARIAS",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "6",
        "clave": "RF06",
        "descripcion": "CONFORMACION DEL FONDO REVOLVENTE",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "7",
        "clave": "RF07",
        "descripcion": "RELACION DE CONTRARECIBOS PENDIENTES DE ENTREGAR A SUS BENEFICIARIOS",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "8",
        "clave": "RF08",
        "descripcion": "RELACION DE CHEQUES PENDIENTES DE ENTREGAR A SUS BENEFICIARIOS",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "9",
        "clave": "RF09",
        "descripcion": "INGRESOS POR DEPOSITAR",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "10",
        "clave": "RF10",
        "descripcion": "SOLICITUDES DE CANCELACIONES DE FIRMAS",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "11",
        "clave": "RF11",
        "descripcion": "RELACION DE CUENTAS POR COBRAR",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "12",
        "clave": "RF12",
        "descripcion": "RELACION DE CUENTAS POR PAGAR (PASIVOS)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "13",
        "clave": "RF13",
        "descripcion": "RELACIONES DE IMPUESTOS Y CONTRIBUCIONES PENDIENTES DE PAGO",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "14",
        "clave": "RF14",
        "descripcion": "POLIZAS DE SEGUROS VIGENTES",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "15",
        "clave": "RF15",
        "descripcion": "FIANZAS Y GARANTIAS VIGENTES",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "16",
        "clave": "RF16",
        "descripcion": "RELACION DE CONVENIOS Y CONTRATOS DE BIENES Y SERVICIOS VIGENTES",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "17",
        "clave": "RF17",
        "descripcion": "RELACION DE LIBROS Y REGISTROS DE CONTABILIDAD",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "18",
        "clave": "RF18",
        "descripcion": "ESTADOS FINANCIEROS",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "1"
    },
    {
        "id": "19",
        "clave": "CCL01",
        "descripcion": "CONTRATOS Y CONVENIOS VIGENTES (Generales, Coordinaci\u00f3n, Fideicomisos, Bienes y Servicios)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "2"
    },
    {
        "id": "20",
        "clave": "CCL02",
        "descripcion": "LICITACIONES EN TR\u00c1MITE (Bienes y Servicios, Obra)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "2"
    },
    {
        "id": "21",
        "clave": "CCL03",
        "descripcion": "PROGRAMAS DE OBRA Y ADQUISICIONES (Programa Anual de Obra P\u00fablica, Listado de Expedientes de Obra, Programa Anual de Adquisiciones)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "2"
    },
    {
        "id": "22",
        "clave": "ENI01",
        "descripcion": "ORGANIGRAMA GENERAL",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "3"
    },
    {
        "id": "23",
        "clave": "ENI02",
        "descripcion": "REGLAMENTOS Y MANUALES (Reglamento Interior y Manuales Generales)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "3"
    },
    {
        "id": "24",
        "clave": "ENI03",
        "descripcion": "ACTAS DE \u00d3RGANOS DE GOBIERNO (Actas de Consejo, Acuerdo de \u00d3rganos de Gobierno)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "3"
    },
    {
        "id": "25",
        "clave": "ENI04",
        "descripcion": "REPRESENTACIONES Y CARGOS HONOR\u00cdFICOS VIGENTES",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "3"
    },
    {
        "id": "26",
        "clave": "ENI05",
        "descripcion": "PODERES OTORGADOS",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "3"
    },
    {
        "id": "27",
        "clave": "RRH01",
        "descripcion": "PLANTILLAS DE PERSONAL (Base, Apoyo, Comisionado)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "4"
    },
    {
        "id": "28",
        "clave": "RRH02",
        "descripcion": "PERSONAL HONORARIOS",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "4"
    },
    {
        "id": "29",
        "clave": "IBM01",
        "descripcion": "INVENTARIO DE MOBILIARIO Y EQUIPO (Oficina, Veh\u00edculos, Maquinaria y Equipo)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "5"
    },
    {
        "id": "30",
        "clave": "IBM02",
        "descripcion": "EXISTENCIAS (Almacenes, Plantas de Vivero)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "5"
    },
    {
        "id": "31",
        "clave": "IBM03",
        "descripcion": "BIENES EN COMODATO",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "5"
    },
    {
        "id": "32",
        "clave": "IBM04",
        "descripcion": "BIENES INMUEBLES EN POSESI\u00d3N",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "5"
    },
    {
        "id": "33",
        "clave": "IBM05",
        "descripcion": "RESERVA TERRITORIAL",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "5"
    },
    {
        "id": "34",
        "clave": "IBM06",
        "descripcion": "BIENES CULTURALES Y DECORATIVOS (Obras de Arte y Art\u00edculos de Decoraci\u00f3n)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "5"
    },
    {
        "id": "35",
        "clave": "IBM07",
        "descripcion": "INVENTARIO FAUN\u00cdSTICO (Espec\u00edmenes, Animales Taxidermizados)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "5"
    },
    {
        "id": "36",
        "clave": "IBM08",
        "descripcion": "INVENTARIO DE SEGURIDAD (Equipo de Armamento, Accesorios, Municiones)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "5"
    },
    {
        "id": "37",
        "clave": "IBM09",
        "descripcion": "INVENTARIO DE TECNOLOG\u00cdA (Paquetes Computacionales, Sistemas y Programas, Equipos de Comunicaci\u00f3n)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "5"
    },
    {
        "id": "38",
        "clave": "SCA01",
        "descripcion": "CLAVES Y FIRMAS DE ACCESO (Sistemas, Seguridad, Cancelaci\u00f3n, Solicitudes de Cancelaci\u00f3n)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "6"
    },
    {
        "id": "39",
        "clave": "SCA02",
        "descripcion": "RELACI\u00d3N DE LLAVES DE LA DEPENDENCIA",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "6"
    },
    {
        "id": "40",
        "clave": "DA01",
        "descripcion": "RESPALDOS DE INFORMACI\u00d3N",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "7"
    },
    {
        "id": "41",
        "clave": "DA02",
        "descripcion": "INVENTARIO DE ACERVO BIBLIOGR\u00c1FICO Y HEMEROGR\u00c1FICO",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "7"
    },
    {
        "id": "42",
        "clave": "DA03",
        "descripcion": "REGISTRO DE DOCUMENTOS (Corte de Formas y Foliadas, Sellos Oficiales)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "7"
    },
    {
        "id": "43",
        "clave": "DA04",
        "descripcion": "ARCHIVOS (Tr\u00e1mite y Concentraci\u00f3n)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "7"
    },
    {
        "id": "44",
        "clave": "DA05",
        "descripcion": "LIBROS Y REGISTROS DE CONTABILIDAD",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "7"
    },
    {
        "id": "45",
        "clave": "DA06",
        "descripcion": "LISTADO GENERAL DE EXPEDIENTES UNITARIOS DE OBRA (Por Contrato y Administraci\u00f3n Directa - ya incluido en \"Programas de Obra y Adquisiciones\", podr\u00eda omitirse aqu\u00ed o considerarse una subcategor\u00eda)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "7"
    },
    {
        "id": "46",
        "clave": "ALA01",
        "descripcion": "ASUNTOS EN TR\u00c1MITE (Relevantes, Naturaleza Jur\u00eddica)",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "8"
    },
    {
        "id": "47",
        "clave": "ALA02",
        "descripcion": "OBSERVACIONES DE AUDITOR\u00cdA PENDIENTES",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "8"
    },
    {
        "id": "48",
        "clave": "ALA03",
        "descripcion": "P\u00f3lizas de Seguros Vigentes",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "8"
    },
    {
        "id": "49",
        "clave": "ALA04",
        "descripcion": "Fianzas Vigente",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "8"
    },
    {
        "id": "50",
        "clave": "ALA05",
        "descripcion": "Garantias Vigentes",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "8"
    },
    {
        "id": "51",
        "clave": "PP01",
        "descripcion": "PROGRAMA OPERATIVO ANUAL",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "9"
    },
    {
        "id": "52",
        "clave": "PP02",
        "descripcion": "OTROS PROGRAMAS",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "9"
    },
    {
        "id": "53",
        "clave": "TA01",
        "descripcion": "TRANSPARENCIA Y ACCESO A LA INFORMACI\u00d3N",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "10"
    },
    {
        "id": "54",
        "clave": "OT01",
        "descripcion": "ADMINISTRATIVO DE ACTUACI\u00d3N",
        "creado_en": "2025-07-08 19:28:09.954822+00",
        "editado_en": "2025-07-08 19:28:09.954822+00",
        "is_deleted": "False",
        "id_categoria": "11"
    }
]

const CategoryKeySelector = (  ) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [formData, setFormData] = useState({
        categoria: "",
        clave: ""
    })

    // Filtrar las claves basadas en la categoría seleccionada
    const filteredKeys = selectedCategory
        ? claves_anexos.filter(key => key.id_categoria === selectedCategory)
        : []



    return (
        <div className="space-y-4">
            {/* Selector de Categoría */}
            <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                        setSelectedCategory(value)
                        // Resetear la clave cuando cambia la categoría
                        setFormData(prev => ({ ...prev, categoria: value, clave: "" }))
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoria_anexos.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id}>
                                {categoria.nombre_categoria}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Selector de Clave (solo visible si hay una categoría seleccionada) */}
            {selectedCategory && (
                <div className="space-y-2">
                    <Label htmlFor="clave">Clave del Anexo</Label>
                    <Select
                        value={formData.clave}
                        onValueChange={(value) => setFormData({ ...formData, clave: value })}
                        disabled={!selectedCategory}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={filteredKeys.length ? "Selecciona una clave" : "No hay claves disponibles"} />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredKeys.map((key) => (
                                <SelectItem key={key.id} value={key.id}>
                                    {key.clave} - {key.descripcion}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}

export default CategoryKeySelector