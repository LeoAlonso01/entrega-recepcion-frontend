<Card >
                <CardHeader>
                  <CardTitle>Formulario Dinámico</CardTitle>
                  <CardDescription>
                    Completa los campos. Los datos se envían como JSON.
                  </CardDescription>
                </CardHeader>
                <CardContent className="sm:max-w-3xl md:max-w-4xl xl:max-w-5xl">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="clave">Clave</label>
                      <input id="clave" {...register("clave")} />
                      <label htmlFor="categoria">Categoría</label>
                      <input id="categoria" {...register("categoria")} />
                    </div>
                    {/* Clave del Anexo */}
                    <div className="space-y-2">
                      <Label>Clave del Anexo</Label>
                      <select
                        {...register("clave", { required: "Clave es obligatoria" })}
                        className="w-full p-2 border border-gray-300 rounded-md md:col-span-2 sm:col-span-2"
                        onChange={(e) => {
                          const clave = e.target.value;
                          setValue("clave", clave);
                          // Obtener categoría desde claves_anexos
                          const claveData = claves_anexos.find(k => k.clave === clave);
                          if (claveData) {
                            setValue("categoria", categoria_anexos.find(c => c.id === claveData.id_categoria)?.nombre_categoria || "");
                          }
                        }}
                      >
                        <option value="">Selecciona una clave</option>
                        {claves_anexos.map((k) => (
                          <option key={k.id} value={k.clave}>
                            {k.clave} - {k.descripcion}
                          </option>
                        ))}
                      </select>
                      {errors.clave && <p className="text-sm text-red-600">{errors.clave.message}</p>}
                    </div>

                    {/* Categoría (autocompletada por clave) */}
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <input
                        {...register("categoria")}
                        type="text"
                        disabled
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="Selecciona una clave para autocompletar"
                      />
                    </div>

                    {/* Fecha de Creación */}
                    <div className="space-y-2">
                      <Label>Fecha de Creación</Label>
                      <input
                        {...register("fecha_creacion", { required: "Fecha es obligatoria" })}
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      {errors.fecha_creacion && <p className="text-sm text-red-600">{errors.fecha_creacion.message}</p>}
                    </div>

                    {/* Estado */}
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <select
                        {...register("estado", { required: "Estado es obligatorio" })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Borrador">Borrador</option>
                        <option value="Completado">Completado</option>
                        <option value="Revisión">Revisión</option>
                        <option value="Pendiente">Pendiente</option>
                      </select>
                      {errors.estado && <p className="text-sm text-red-600">{errors.estado.message}</p>}
                    </div>

                    {/* Campos ocultos: creador y unidad_responsable_id */}
                    <input type="hidden" {...register("creador_id")} value={userid} />
                    <input type="hidden" {...register("unidad_responsable_id")} value={unidadResponsable} />

                    {/* Tabla dinámica o Excel */}
                    {watch("clave") && (
                      <div className="space-y-4">
                        <Label>Datos (agrega manualmente o sube Excel)</Label>

                        {/* Tabla editable */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span>Tabla de datos</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const nuevaFila: Record<string, any> = { campo1: "", campo2: "", campo3: "" };
                                setDatos(prev => [...prev, nuevaFila]);
                                setValue("datos", [...datos, nuevaFila]); // sincroniza con RHF
                              }}
                            >
                              + Agregar fila
                            </Button>
                          </div>

                          {datos.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay datos. Usa Excel o agrega manualmente.</p>
                          ) : (
                            <table className="min-w-full border border-gray-300 rounded-md text-sm">
                              <thead>
                                <tr className="bg-gray-50">
                                  {Object.keys(datos[0]).map((key) => (
                                    <th key={key} className="border px-2 py-1 font-semibold">{key}</th>
                                  ))}
                                  <th className="border px-2 py-1 font-semibold">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {datos.map((fila, i) => (
                                  <tr key={i}>
                                    {Object.keys(fila).map((campo) => (
                                      <td key={campo} className="border px-2 py-1">
                                        <input
                                          type="text"
                                          value={fila[campo]}
                                          onChange={(e) => {
                                            const nuevas = [...datos];
                                            nuevas[i][campo] = e.target.value;
                                            setDatos(nuevas);
                                            setValue("datos", nuevas); // sincroniza con RHF
                                          }}
                                          className="w-full p-1 border rounded"
                                        />
                                      </td>
                                    ))}
                                    <td className="border px-2 py-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500"
                                        onClick={() => {
                                          const nuevas = datos.filter((_, index) => index !== i);
                                          setDatos(nuevas);
                                          setValue("datos", nuevas);
                                        }}
                                      >
                                        Eliminar
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* Subida de Excel */}
                        <div>
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
                                setDatos(excelData);
                                setValue("datos", excelData); // sincroniza con RHF
                                toast.success
                              }
                            }}
                          />
                          <ExcelPreview
                            data={previewData}
                            onClose={() => setShowPreview(false)}
                            onConfirm={() => {
                              if (pendingFile) {
                                setDatos(pendingFile.data);
                                setValue("datos", pendingFile.data);
                                toast.success(`✅ ${pendingFile.data.length} filas cargadas`);
                              }
                              setShowPreview(false);
                              setPendingFile(null);
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {showPreview && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-hidden">
                          <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold">Previsualización del Excel</h3>
                            <p className="text-sm text-gray-600">Se cargarán {previewData.length} filas</p>
                          </div>
                          <div className="p-4 max-h-60 overflow-y-auto">
                            <table className="min-w-full border border-gray-300 text-sm">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  {Object.keys(previewData[0]).map((key) => (
                                    <th key={key} className="border px-2 py-1 font-semibold text-left">
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {previewData.map((fila, i) => (
                                  <tr key={i} className="hover:bg-gray-50">
                                    {Object.values(fila).map((val: any, j) => (
                                      <td key={j} className="border px-2 py-1 truncate max-w-xs">
                                        {String(val)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="p-4 flex justify-end space-x-3 border-t">
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                              Cancelar
                            </Button>
                            <Button
                              style={{ backgroundColor: "#24356B", color: "white" }}
                              onClick={() => {
                                if (pendingFile) {
                                  setDatos(pendingFile.data);
                                  setValue("datos", pendingFile.data);
                                  toast.success(`✅ ${pendingFile.data.length} filas cargadas`);
                                }
                                setShowPreview(false);
                                setPendingFile(null);
                              }}
                            >
                              Confirmar y Cargar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )

                    }

                    {/* Botones */}
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setDatos([]);
                          reset();
                        }}
                      >
                        Limpiar
                      </Button>
                      <Button
                        type="submit"
                        onClick={() => {
                          setValue("datos", datos);
                          console.log("Datos a enviar:", watch());
                        }}
                        style={{ backgroundColor: "#24356B", color: "white" }}
                      >
                        Guardar Anexo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const draft = {
                            clave: watch("clave"),
                            categoria: watch("categoria"),
                            fecha_creacion: watch("fecha_creacion"),
                            estado: watch("estado"),
                            datos,
                            timestamp: new Date().toISOString(),
                          };
                          localStorage.setItem(`draft_anexo_${userid}`, JSON.stringify(draft));
                          toast.success("✅ Borrador guardado");
                        }}
                        className="mt-2"
                      >
                        Guardar como Borrador
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>