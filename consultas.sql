
-- Consulta para obtener la estructura jerárquica de las unidades responsables
-- comenzando desde la unidad "Órgano Interno de Control"
WITH RECURSIVE dependencias_unidad AS (
    SELECT 
        id, nombre, unidad_padre, nivel, 0 AS nivel_profundidad
    FROM 
        public.unidades_responsables
    WHERE 
        nombre = 'Órgano Interno de Control'  -- Unidad inicial
    
    UNION ALL
    
    SELECT 
        u.id, u.nombre, u.unidad_padre, u.nivel, d.nivel_profundidad + 1
    FROM 
        public.unidades_responsables u
    JOIN 
        dependencias_unidad d ON u.unidad_padre = d.id
)

SELECT 
    LPAD(' ', nivel_profundidad*4, ' ') || nombre AS estructura,
    id,
    unidad_padre,
    nivel,
    nivel_profundidad
FROM 
    dependencias_unidad
ORDER BY 
    nivel_profundidad, nombre;

    ------------------------------------------------------------------------------------------------------

-- Consulta para obtener la estructura jerárquica de las unidades responsables
-- comenzando desde la unidad "Secretaría de la Función Pública"
WITH RECURSIVE dependencias_unidad AS (
    -- Caso base: selecciona la unidad inicial
    SELECT 
        id,
        nombre,
        domicilio,
        telefono,
        municipio,
        correo,
        responsable,
        creado_en,
        editado_en,
        unidad_padre,
        nivel,
        is_deleted,
        0 AS nivel_profundidad
    FROM 
        public.unidades_responsables
    WHERE 
        nombre = 'Órgano Interno de Control'  -- Cambia por la unidad que deseas investigar
    
    UNION ALL
    
    -- Caso recursivo: selecciona todas las unidades hijas
    SELECT 
        u.id,
        u.nombre,
        u.domicilio,
        u.telefono,
        u.municipio,
        u.correo,
        u.responsable,
        u.creado_en,
        u.editado_en,
        u.unidad_padre,
        u.nivel,
        u.is_deleted,
        d.nivel_profundidad + 1
    FROM 
        public.unidades_responsables u
    JOIN 
        dependencias_unidad d ON u.unidad_padre = d.id
    WHERE
        u.is_deleted = false  -- Opcional: excluir unidades eliminadas
)

SELECT 
    id,
    LPAD(' ', nivel_profundidad*4, ' ') || nombre AS estructura_jerarquica,
    nombre,
    domicilio,
    telefono,
    municipio,
    correo,
    responsable,
    creado_en,
    editado_en,
    unidad_padre,
    nivel,
    nivel_profundidad,
    is_deleted
FROM 
    dependencias_unidad
ORDER BY 
    nivel_profundidad, nombre;