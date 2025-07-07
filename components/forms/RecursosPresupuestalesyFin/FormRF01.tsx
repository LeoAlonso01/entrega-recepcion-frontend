import React from 'react';
import {Label} from "../../ui/label"; 
import {Input} from "../../ui/input";
import { useState } from 'react';
interface FormData {
    titulo: string;
    archivo: string;
}
const initialFormData: FormData = {
    titulo: '',
    archivo: ''
};


const FormRF01: React.FC = () => {

    const [formData, setFormData] = useState<FormData>(initialFormData);


    return (
        <div>
            {/* FormRF01 content goes here */}
            <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <Label htmlFor="Partida">Partida <span>*</span></Label>
                        <Input
                          id="Partida"
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Denominación <span>*</span></Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                         
                        >
                        </Input>
                      </div>
                      <div className="flex flex-col">
                        <Label>Presupuesto Autorizado <span>*</span></Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                          
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Ampliaciones y/o Deducciones</Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                          
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Presupuesto Modificado</Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                         
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Presupuesto Ejercido</Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                          
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Por Ejercer</Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                          
                        />
                      </div>

                      {/* Puedes agregar más campos si es necesario */}
                        <Label>Archivos del Presupuesto del SIIA</Label>
                        <Input
                        type="file"
                        accept=".pdf,.xlsx"
                        style={{
                          border: "1px solid #ccc",
                          padding: "8px",
                          borderRadius: "4px",
                          marginTop: "8px",
                          width: "100%",
                          boxSizing: "border-box",
                          backgroundColor: "gray",
                          transition: "background-color 0.2s, border-color 0.2s",
                        }}
                        onMouseOver={e => {
                          (e.currentTarget as HTMLInputElement).style.backgroundColor = "#bdbdbd"
                          ;(e.currentTarget as HTMLInputElement).style.borderColor = "#24356B"
                        }}
                        onMouseOut={e => {
                          (e.currentTarget as HTMLInputElement).style.backgroundColor = "gray"
                          ;(e.currentTarget as HTMLInputElement).style.borderColor = "#ccc"
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFormData({ ...formData, archivo: file.name })
                          }
                        }}
                      />
                      <h3>Previsualización</h3>
                      <div>
                        {formData.archivo && (
                          <>
                            <p className="text-sm text-gray-500">{formData.archivo}</p>
                            {formData.archivo.endsWith('.pdf') ? (
                              <embed
                                src={URL.createObjectURL(
                                  (document.getElementById('archivoInput') as HTMLInputElement)?.files?.[0] as Blob
                                )}
                                type="application/pdf"
                                width="100%"
                                height="400px"
                              />
                            ) : formData.archivo.endsWith('.xlsx') ? (
                              <div className="text-xs text-blue-700">
                                Vista previa no disponible para archivos Excel. Archivo seleccionado: {formData.archivo}
                              </div>
                            ) : null}
                          </>
                        )}
                        
                      </div>
                    </div>
        </div>
    );
};

export default FormRF01;