  {showForm ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{editingAnexo ? "Editar Anexo" : "Nuevo Anexo"}</CardTitle>
                      <CardDescription>
                        {editingAnexo ? "Modifica los datos del anexo seleccionado" : "Completa los datos para crear un nuevo anexo"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={() => { console.log("Datos del formulario:", formData); }}>
                        <div className="space-y-4">

                          <div className="grid w-full sm:grid-cols-3 grid-cols-2 gap-2 sm:gap-3 gap-3 text-sm" >

                            {/* Selector de Categoría */}
                            <div className="space-y-2">
                              <Label htmlFor="categoria">Categoría</Label>
                              <Select
                                value={selectedCategory}
                                onValueChange={(value: string) => {
                                  setSelectedCategory(value)
                                  setFormData(prev => ({ ...prev, categoria: value, clave: "" }))
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categoria_anexos.map((categoria) => (
                                    <SelectItem key={categoria.id} value={categoria.nombre_categoria}>
                                      {categoria.nombre_categoria}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Selector de Clave (solo visible si hay una categoría seleccionada) */}
                            {selectedCategory && (
                              <div className="space-y-2">
                                <Label htmlFor="clave">Clave del Anexo</Label>
                                <Select
                                  value={formData.clave}
                                  onValueChange={(value: string) => setFormData({ ...formData, clave: value })}
                                  disabled={!selectedCategory}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={filteredKeys.length ? "Selecciona una clave" : "No hay claves disponibles"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filteredKeys.map((key) => (
                                      <SelectItem key={key.id} value={key.clave}>
                                        {key.clave} - {key.descripcion}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>

                          <div className="grid w-full sm:grid-cols-3 grid-cols-2 gap-2 sm:gap-3 gap-3 text-sm" >
                            <div className="mt-2">
                              {/* id de quien lo crea, que viene del usuario en su id */}
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Creado por:
                              </label>
                              <input
                                type="text"
                                value={userName}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                              />
                              <input type="hidden" value={userid} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div className="mt-2">
                              {/* unidad responsable del anexo */}
                              <label htmlFor="unidad_responsable" className="block text-sm font-medium text-gray-700 mb-2">
                                Unidad Responsable
                              </label>
                              <input
                                type="text"
                                id="unidad_responsable"
                                value={(unidadResponsable ? unidadResponsable : "NO ASIGNADA")}
                                /* onChange={(e) => setUnidadResponsable(Number(e.target.value))} */
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                              />
                            </div>
                            <div className="mt-2">
                              {/* estado del anexo */}
                              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                                Estado del Anexo
                              </label>
                              <select
                                id="estado"
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required
                              >
                                <option value="Borrador">Borrador</option>
                                <option value="Completado">Completado</option>
                                <option value="Revisión">Revisión</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>
                            </div>
                          </div>

                          {/* Sección de archivo (se mantiene igual) */}

                          <label htmlFor="info-loader" className="block text-sm font-medium text-gray-700 mb-2">
                            Información
                          </label>
                          <div className="grid w-full sm:grid-cols-2 gap-2 gap-3 ">
                            {/*   */}
                            {selectedCategory === "Marco Jurídico" && (
                              <div>

                              </div>
                            )}
                          </div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subir Archivo (PDF o Excel)
                          </label>

                          {selectedCategory && claveRequierePDF(formData.clave) ? (
                            <div>
                              <label htmlFor="pdf-uploader">Subir PDF</label>
                              <PdfUploader
                                onUploadSuccess={(url) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    datos: { pdf_url: url }, // o como quieras estructurarlo
                                  }))
                                }
                              />

                            </div>
                          ) : (
                            <div>
                              <label htmlFor="excel-uploader">Subir Excel</label>
                              <ExcelUploader
                                onUploadSuccess={(excelData) => {
                                  const clave = watch("clave");
                                  const estructura = EstructuraDatosPorClave[clave] || EstructuraDatosPorClave.default;

                                  if (estructura.length > 0 && excelData.length > 0) {
                                    const columnasExcel = Object.keys(excelData[0]);
                                    const faltantes = estructura.filter(campo => !columnasExcel.includes(campo));
                                    const extras = columnasExcel.filter(campo => !estructura.includes(campo));

                                    if (faltantes.length > 0) {
                                      toast.warning(
                                        `Faltan columnas: ${faltantes.join(", ")}. Se llenarán como vacías.`,
                                        { duration: 5000 }
                                      );
                                    };
                                    if (extras.length > 0) {
                                      toast.warning(
                                        `Columnas extras: ${extras.join(", ")}. Se ignorarán.`,
                                        { duration: 5000 }
                                      );
                                    }

                                    setRows(excelData);
                                    setValue("datos", excelData); // sincroniza con RHF
                                    setFormData((prev) => ({
                                      ...prev,
                                      datos: excelData, // esto sincroniza directamente con formData
                                    }));
                                  }
                                }}
                              />
                            </div>
                          )}


                          {/* llenar el campo datos con el json desde excel */}
                          {formData.clave === "Excel" && (
                            <div>
                              <label htmlFor="datos">Datos</label>
                              <textarea
                                id="datos"
                                value={JSON.stringify(formData.datos, null, 2)}
                                onChange={(e) => setFormData({ ...formData, datos: JSON.parse(e.target.value) })}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                              <EditableTable
                                data={Array.isArray(formData.datos) ? formData.datos : []}
                                onChange={(newData) =>
                                  setFormData({
                                    ...formData,
                                    datos: newData
                                  })
                                }
                              />
                            </div>
                          )}
                          {/* en el campo datos subir la url del archivo pdf */}
                          {formData.clave === "PDF" && (
                            <div>
                              <label htmlFor="datos">Datos</label>
                              {/* <textarea
                          id="datos"
                          value={JSON.stringify(formData.datos, null, 2)}
                          onChange={(e) => setFormData({ ...formData, datos: JSON.parse(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        /> */}
                              <div className="border border-gray-300 rounded-md p-2 overflow-hidden mt-4"
                                style={
                                  {
                                    width: "60%", // Ancho del contenedor
                                    height: "400px", // Altura del contenedor
                                  }
                                }
                              >
                                {/* Directly use the Viewer component from @react-pdf-viewer/core */}
                                {/* <Viewer fileUrl={formData.datos.pdf_url} /> */}
                              </div>
                            </div>
                          )}

                          {/* Previsualización del archivo seleccionado */}
                          {/* <label htmlFor="pdf-uploader">Subir PDF</label>
                    <PdfUploader /> */}

                          {/* Subir excel */}
                          {/*   <label htmlFor="excel-uploader">Subir Excel</label>
                    <ExcelUploader /> */}

                          {/* Previsualización del archivo (si es PDF) */}
                          {previewUrl && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600">Archivo seleccionado: {selectedFile?.name}</p>
                              <Button variant="outline" size="sm" onClick={removeFile} className="mt-2">
                                Eliminar Archivo
                              </Button>
                            </div>
                          )}





                          <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={resetForm}>
                              Cancelar
                            </Button>
                            <Button type="submit" style={{ backgroundColor: "#24356B", color: "white" }}>
                              {editingAnexo ? "Actualizar" : "Crear"} Anexo
                            </Button>
                          </div>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (