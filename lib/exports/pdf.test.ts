/** @jest-environment node */
import { crearReporteAnexo } from './pdf';
import { getDocument } from 'pdfjs-dist';

jest.mock('../helpPngPdf', () => ({ imageToDataUrl: jest.fn(async () => 'data:image/jpeg;base64,' + require('fs').readFileSync(require('path').join(process.cwd(), 'public/logos/ESCUDO-UMSNH.jpg')).toString('base64')) }));

it('calcula las fojas con la misma paginación y conserva todos los registros', async () => {
  const filas = Array.from({ length: 89 }, (_, i) => ({ 'Descripcion': `REGISTRO-${String(i + 1).padStart(3, '0')}`, 'Cantidad': i + 1 }));
  const meta = { fechaElaboracion: '2026-11-20', dependenciaNombre: 'Unidad responsable de prueba', dependenciaClave: '212', elaboro: 'Creador guardado', categoriaNombre: 'RECURSOS MATERIALES', revisionDatos: 'revision-prueba' };
  const estimado = await crearReporteAnexo('RM04', meta, filas, { incluirLogos: false });
  const real = await crearReporteAnexo('RM04', meta, filas);
  const pdf = await getDocument({ data: new Uint8Array(real.doc.output('arraybuffer')), useSystemFonts: true }).promise;
  expect(estimado.fojas).toBe(real.fojas);
  expect(real.fojas).toBe(pdf.numPages);
  const texto = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    texto.push((await page.getTextContent()).items.map(item => 'str' in item ? item.str : '').join(' '));
  }
  expect(texto.join(' ')).toContain('REGISTRO-001');
  expect(texto.join(' ')).toContain('REGISTRO-089');
  expect(texto.join(' ')).toContain('Creador guardado');
  expect((await pdf.getMetadata()).info).toMatchObject({ Subject: 'revision-prueba' });
  await pdf.destroy();
});
