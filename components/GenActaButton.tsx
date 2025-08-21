// components/GenActaButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface GenActaButtonProps {
  acta: any;
  onGenerate: (acta: any) => Promise<void>;
}

const GenActaButton: React.FC<GenActaButtonProps> = ({ acta, onGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(acta);
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      title="Generar PDF"
      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
    >
      <Download className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
    </Button>
  );
};

export default GenActaButton;