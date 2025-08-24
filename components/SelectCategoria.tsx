import React from 'react';
import { CategoriaEnum, CategoriaLabels } from './json/claves';

interface Props {
    value: string;
    onChange: (newValue: string) => void;
}

export function SelectCategoria({ value, onChange }: Props) {
    return (
        <div className='mb-4'>
            <label htmlFor="categoria" className='block text-sm font-medium text-gray-700 mb-1'>Categoria</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Selecciona una categoría</option>
                {Object.entries(CategoriaLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>

        </div>
    )
}

