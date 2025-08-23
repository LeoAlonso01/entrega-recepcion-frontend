import { useState, useEffect, useId } from 'react';


type FMJ01ItemProps = {
  value?: {
    ordenamiento?: string;
    titulo?: string;
    emision?: string;
  };
  onChange?: (data: { ordenamiento: string | null; titulo: string | null; emision: string | null }) => void;
};

const FMJ01Item = ({ value, onChange }: FMJ01ItemProps) => {
  const [ordenamiento, setOrdenamiento] = useState('');
  const [titulo, setTitulo] = useState('');
  const [emision, setEmision] = useState('');

  // ✅ IDs estables por campo (no usar Math.random)
  const idOrdenamiento = useId();
  const idTitulo = useId();
  const idEmision = useId();

  useEffect(() => {
    if (value) {
      setOrdenamiento(value.ordenamiento || '');
      setTitulo(value.titulo || '');
      setEmision(value.emision || '');
    }
  }, [value]);

  useEffect(() => {
    onChange?.({
      ordenamiento: ordenamiento || null,
      titulo: titulo || null,
      emision: emision || null,
    });
  }, [ordenamiento, titulo, emision]);

  return (
    <div className="grid w-full sm:grid-cols-3 grid-cols-2 gap-3 text-sm">
      <div className="py-2">
        <label htmlFor={idOrdenamiento} className="block mb-1 font-medium text-gray-700">
          Ordenamiento
        </label>
        <input
          id={idOrdenamiento}
          type="text"
          value={ordenamiento}
          onChange={(e) => setOrdenamiento(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="py-2">
        <label htmlFor={idTitulo} className="block mb-1 font-medium text-gray-700">
          Título
        </label>
        <input
          id={idTitulo}
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="py-2">
        <label htmlFor={idEmision} className="block mb-1 font-medium text-gray-700">
          Fecha de emisión
        </label>
        <input
          id={idEmision}
          type="date"
          value={emision}
          onChange={(e) => setEmision(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default FMJ01Item;
