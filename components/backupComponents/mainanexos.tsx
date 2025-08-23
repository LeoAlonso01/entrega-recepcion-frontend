<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Anexos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{anexos.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{anexos.filter((a) => a.estado === "Completado").length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Borrador</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{anexos.filter((a) => a.estado === "Borrador").length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{anexos.filter((a) => a.estado === "Revisión").length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Anexos</h2>
              <p className="text-gray-600">Administra los anexos y documentos del sistema</p>
            </div>

            <div className="flex space-x-2">
              {!showForm ? (
                <Button
                  style={{ backgroundColor: "#24356B", color: "white" }}
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Anexo
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a la lista
                </Button>
              )}

              {/* Botones de exportación */}
              <Button
                variant="outline"
                onClick={() => exportAnexosToPDF(anexos)}
                className="border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>

              <Button
                variant="outline"
                onClick={() => exportAnexosToExcel(anexos)}
                className="border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>

          {showForm ? (
            <Card>
              <CardHeader>
                <CardTitle>{editingAnexo ? "Editar Anexo" : "Nuevo Anexo"}</CardTitle>
                <CardDescription>
                  {editingAnexo ? "Modifica los datos del anexo seleccionado" : "Completa los datos para crear un nuevo anexo"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">

                    {/* <CategoryKeySelector
                    /> */}

                    <div className="space-y-4">
                      {/* Selector de Categoría */}
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        <Select
                          value={selectedCategory}
                          onValueChange={(value) => {
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
                            onValueChange={(value) => setFormData({ ...formData, clave: value })}
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

                    {/* Sección de archivo (se mantiene igual) */}
                    <div className="mt-6">
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
                          onUploadSuccess={(data) => {
                            setRows(data);
                            setFormData((prev) => ({
                              ...prev,
                              datos: data, // esto sincroniza directamente con formData
                            }));
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
            <Card>
              <CardHeader>
                <CardTitle>Lista de Anexos</CardTitle>
                <CardDescription>Gestiona los anexos registrados en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clave</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anexos.map((anexo) => (
                      <TableRow key={anexo.id}>
                        <TableCell className="font-medium">{anexo.clave}</TableCell>
                        <TableCell>{anexo.categoria}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(anexo.categoria)}`}>
                            {anexo.categoria}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(anexo.estado)}`}>
                            {anexo.estado}
                          </span>
                        </TableCell>
                        <TableCell>{anexo.fecha_creacion}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => alert(`Descargar ${anexo.clave}`)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(anexo)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(anexo.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </main>