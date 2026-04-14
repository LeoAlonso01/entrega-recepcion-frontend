import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

// Mock helpers
const validarFilasObligatorias = jest.fn();
const yaTieneAnexoConClave = jest.fn();

function GuardarAnexoButton({ clave, fecha_creacion, estado, datos, anexos, userid, editingAnexo }) {
  const disabled =
    !clave ||
    !fecha_creacion ||
    !estado ||
    !datos.length ||
    validarFilasObligatorias(datos, clave).length > 0 ||
    yaTieneAnexoConClave(clave, anexos, userid, editingAnexo ? editingAnexo.id : undefined);

  return (
    <Button type="submit" disabled={disabled}>
      Guardar Anexo
    </Button>
  );
}

describe('GuardarAnexoButton', () => {
  beforeEach(() => {
    validarFilasObligatorias.mockReset();
    yaTieneAnexoConClave.mockReset();
  });

  it('debe habilitar el botón cuando todo es válido', () => {
    validarFilasObligatorias.mockReturnValue([]);
    yaTieneAnexoConClave.mockReturnValue(false);
    render(
      <GuardarAnexoButton
        clave="A1"
        fecha_creacion="2026-04-14"
        estado="Borrador"
        datos={[{ campo: 'valor' }]}
        anexos={[]}
        userid={1}
        editingAnexo={null}
      />
    );
    expect(screen.getByRole('button', { name: /guardar anexo/i })).toBeEnabled();
  });

  it('debe deshabilitar el botón si falta clave o hay errores', () => {
    validarFilasObligatorias.mockReturnValue(['Error']);
    yaTieneAnexoConClave.mockReturnValue(false);
    render(
      <GuardarAnexoButton
        clave=""
        fecha_creacion="2026-04-14"
        estado="Borrador"
        datos={[]}
        anexos={[]}
        userid={1}
        editingAnexo={null}
      />
    );
    expect(screen.getByRole('button', { name: /guardar anexo/i })).toBeDisabled();
  });
});
