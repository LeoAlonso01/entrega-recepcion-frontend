// src/hooks/useGeneratePDF.ts
import React from 'react';
import { saveAs } from 'file-saver';
import { pdf, Document } from '@react-pdf/renderer';
import ActaPDF, { ActaPDFProps } from '../components/pdf/ActaPDF';

export const useGeneratePDF = () => {
    const generateActaPDF = async (
        acta: any,
        unidades: any[],
        anexos: any[]
    ) => {
        try {
            const props: ActaPDFProps = { acta, unidades, anexos };
            const blob = await pdf(
                React.createElement(Document, {}, React.createElement(ActaPDF, props))
            ).toBlob();

            const filename = `acta_${acta.folio || acta.id}.pdf`;
            saveAs(blob, filename);
        } catch (error) {
            console.error('Error generando PDF:', error);
            throw error;
        }
    };

    return { generateActaPDF };
};