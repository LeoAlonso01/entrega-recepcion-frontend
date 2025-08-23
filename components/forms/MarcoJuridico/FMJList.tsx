import { useState, useEffect } from 'react';
import FMJ01Item from '../MarcoJuridico/FMJ01Item';

interface FMJListProps {
  value?: Array<Record<string, any>> | string;
  onChange?: (items: Array<Record<string, any>>) => void;
}

const FMJList = ({ value: initialValue = [], onChange }: FMJListProps) => {
  const [items, setItems] = useState<Array<Record<string, any>>>(
    Array.isArray(initialValue)
      ? initialValue
      : (initialValue && typeof initialValue === 'string'
        ? JSON.parse(initialValue)
        : [])
  );

  // ✅ usar useEffect para sincronizar cuando cambie la prop
  useEffect(() => {
    if (initialValue) {
      try {
        const parsed = Array.isArray(initialValue)
          ? initialValue
          : typeof initialValue === 'string'
            ? JSON.parse(initialValue)
            : [];
        setItems(parsed);
      } catch (e) {
        console.warn('Error parsing initial FMJList value', e);
      }
    }
  }, [initialValue]);

  const addItem = () => {
    const newItem = { ordenamiento: '', titulo: '', emision: '' };
    const updated = [...items, newItem];
    setItems(updated);
    onChange?.(updated);
  };

  const updateItem = (index: number, data: Record<string, any>) => {
    const updated = items.map((item, i) => (i === index ? data : item));
    setItems(updated);
    onChange?.(updated);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Marcos Jurídicos</h2>
        <button
          type="button"
          onClick={addItem}
          className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 transition"
        >
          + Agregar Marco
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay marcos jurídicos agregados.</p>
      ) : (
        <div className="space-y-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative border border-gray-200 p-4 rounded-lg bg-gray-50"
            >
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition"
                aria-label="Eliminar marco jurídico"
              >
                ✕
              </button>

              <FMJ01Item
                value={item}
                onChange={(data: Record<string, any>) => updateItem(index, data)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FMJList;
