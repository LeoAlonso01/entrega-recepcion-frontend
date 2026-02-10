import { Font, Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { FC } from 'react';


// Registrar fuente por cualquier problema de visualización de caracteres especiales
Font.register({
  family: 'Times',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/timesnewroman/v27/7m8l7F1kPZ9wT9Qr9Vv0uA.woff2' }, // regular
    { src: 'https://fonts.gstatic.com/s/timesnewroman/v27/7m8j7F1kPZ9wT9Qr9Vv4iAo.woff2', fontWeight: 'bold' },
  ],
});

export interface ActaForm {
  id: number
  unidad_responsable: number
  folio?: string
  fecha: string
  hora: string
  comisionado?: string
  oficio_comision?: string
  fecha_oficio_comision?: string
  entrante: string
  ine_entrante?: string
  fecha_inicio_labores?: string
  nombramiento?: string
  fecha_nombramiento?: string
  asignacion?: string
  asignado_por?: string
  domicilio_entrante?: string
  telefono_entrante?: string
  saliente: string
  fecha_fin_labores?: string
  testigo_entrante?: string
  ine_testigo_entrante?: string
  testigo_saliente?: string
  ine_testigo_saliente?: string
  fecha_cierre_acta?: string
  hora_cierre_acta?: string
  observaciones?: string
  estado: "Pendiente" | "Completada" | "Revisión"
  domicilio_saliente?: string
}


const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Times',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#000',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  section: {
    marginTop: 20,
  },
  subsection: {
    marginTop: 10,
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: '#000',
    borderRightColor: '#000',
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 6,
    flexGrow: 1,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  signatureBlock: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureItem: {
    textAlign: 'center',
    width: '24%',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

export interface ActaPDFProps {
  acta: ActaForm;
  unidades: { id_unidad: number; nombre: string }[];
  anexos: {
    id: number;
    clave: string;
    datos: any; // { nombre: string, fojas?: string, observaciones?: string }
    is_deleted: boolean;
  }[];
}

// Mapeo de prefijos de clave → categoría (como en los PDF)
const getCategoria = (clave: string): string => {
  const prefijo = clave.split('-')[0]?.toUpperCase() || '';
  const mapa: Record<string, string> = {
    MJ: 'MARCO JURÍDICO',
    EO: 'ORGANIZACIÓN',
    RM: 'RECURSOS MATERIALES',
    ADI: 'ARCHIVOS DOCUMENTALES E INFORMÁTICOS',
    CF: 'CONTROL Y FISCALIZACIÓN',
    AG: 'ASUNTOS GENERALES',
    AR: 'ASUNTOS RELEVANTES',
    IG: 'INFORME DE GESTIÓN',
  };
  return mapa[prefijo] || 'OTROS';
};

const ActaPDF: FC<ActaPDFProps> = ({ acta, unidades, anexos }) => {
  const unidad = unidades.find(u => u.id_unidad === acta.unidad_responsable);
  const unidadNombre = unidad?.nombre || 'Sin unidad';

  // Filtrar y agrupar anexos
  const anexosActivos = anexos.filter(a => !a.is_deleted);
  const grupos = anexosActivos.reduce((acc, anexo) => {
    const cat = getCategoria(anexo.clave);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(anexo);
    return acc;
  }, {} as Record<string, typeof anexosActivos>);

  // Formatear fechas
  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr?: string | null): string => {
    return timeStr || '12:00';
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text>UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO</Text>
          <Text style={styles.title}>ACTA ADMINISTRATIVA DE ENTREGA-RECEPCIÓN</Text>
        </View>

        {/* Cuerpo */}
        <Text>
          Se levanta la presente Acta Administrativa con motivo de la Entrega-Recepción de la Unidad{' '}
          <Text style={{ fontWeight: 'bold' }}>{unidadNombre}</Text>; en la ciudad de MORELIA, siendo
          las {formatTime(acta.hora)} horas del día {formatDate(acta.fecha)} para lo cual se reunieron
          en las oficinas que ocupa la misma, sitio en AV. FRANCISCO J. MÚGICA S/N, C.U., el/la{' '}
          <Text style={{ fontWeight: 'bold' }}>{acta.saliente || 'Nombre del saliente'}</Text>, quien
          se identifica con {acta.ine_testigo_saliente ? `credencial INE ${acta.ine_testigo_saliente}` : 'credencial oficial'} y
          señala como domicilio {acta.domicilio_saliente || 'Sin domicilio'}, quien al día{' '}
          {formatDate(acta.fecha_fin_labores)} deja de ocupar el cargo de Titular, y{' '}
          <Text style={{ fontWeight: 'bold' }}>{acta.entrante || 'Nombre del entrante'}</Text>, quien
          se identifica con {acta.ine_entrante ? `credencial INE ${acta.ine_entrante}` : 'credencial oficial'} y
          señala como domicilio {acta.domicilio_entrante || 'Sin domicilio'}, quien a partir del día{' '}
          {formatDate(acta.fecha_inicio_labores)} recibe, por su jerarquía, el área {unidadNombre}.
        </Text>

        <Text style={{ marginTop: 10 }}>
          Acto seguido, {acta.saliente || 'el/la C.'} y {acta.entrante || 'el/la C.'}, Servidor Público Saliente
          y entrante respectivamente, designan como testigos de asistencia a los/las{' '}
          {acta.testigo_saliente || 'Nombre testigo 1'} y {acta.testigo_entrante || 'Nombre testigo 2'}, quienes
          se identificaron con credencial INE número {acta.ine_testigo_saliente || '...'} y{' '}
          {acta.ine_testigo_entrante || '...'}.
        </Text>

        <Text style={{ marginTop: 10 }}>
          También se encuentra presente en este acto el/la{' '}
          {acta.comisionado || 'Auditor(a) comisionado(a)'}, auditor comisionado por el Departamento de Auditoría
          Interna, mediante oficio número {acta.oficio_comision || 'Sin número'} de fecha{' '}
          {formatDate(acta.fecha_oficio_comision)}.
        </Text>

        <Text style={{ marginTop: 10 }}>
          Continuando con la parte principal... [texto legal fijo: Art. 1, 3, XXI, etc. — puedes pegar el completo]
        </Text>

        {/* Sección de Anexos */}
        {Object.keys(grupos).length > 0 && (
          <View style={styles.section}>
            <Text style={{ fontWeight: 'bold' }}>Acreditadas las personalidades... se procede a entregar los Anexos:</Text>

            {Object.entries(grupos).map(([categoria, items]) => (
              <View key={categoria} style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 6 }}>{categoria}</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.tableCol}>ANEXOS</Text>
                    <Text style={styles.tableCol}>CLAVE</Text>
                    <Text style={styles.tableCol}>NO. FOJAS</Text>
                    <Text style={styles.tableCol}>OBSERVACIONES</Text>
                  </View>
                  {items.map((a, i) => {
                    const datos = a.datos || {};
                    return (
                      <View key={a.id || i} style={[styles.tableRow]}>
                        <Text style={styles.tableCol}>{datos.nombre || 'Documento'}</Text>
                        <Text style={styles.tableCol}>{a.clave}</Text>
                        <Text style={styles.tableCol}>{datos.fojas || ''}</Text>
                        <Text style={styles.tableCol}>{datos.observaciones || 'Ninguna'}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Cláusulas legales adicionales */}
        <Text style={{ marginTop: 15 }}>
          Acto seguido, {acta.saliente || 'el/la C.'}, Servidor Público Saliente, dio curso a la entrega del/la{' '}
          {unidadNombre} a {acta.entrante || 'el/la C.'}, Servidor Público Entrante.
        </Text>

        <Text style={{ marginTop: 10 }}>
          Los informes, anexos y documentos que se mencionan son parte integrante de la misma...
          [puedes incluir párrafos completos del PDF real aquí si lo deseas]
        </Text>

        {/* Firmas */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureItem}>
            <Text>ENTREGA:</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 20 }}>{acta.saliente || '________________'}</Text>
          </View>
          <View style={styles.signatureItem}>
            <Text>RECIBE:</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 20 }}>{acta.entrante || '________________'}</Text>
          </View>
        </View>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureItem}>
            <Text>POR LA CONTRALORÍA</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 20 }}>{acta.comisionado || '________________'}</Text>
          </View>
        </View>

        <View style={{ ...styles.signatureBlock, marginTop: 30 }}>
          <View style={styles.signatureItem}>
            <Text>TESTIGOS DE ASISTENCIA</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 20 }}>{acta.testigo_saliente || '________________'}</Text>
          </View>
          <View style={styles.signatureItem}>
            <Text>{'\n'}</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 20 }}>{acta.testigo_entrante || '________________'}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Powered by SERUMICH V2 — Folio: {acta.folio || acta.id} • Página 1/1
        </Text>
      </Page>
    </Document>
  );
};

export default ActaPDF;