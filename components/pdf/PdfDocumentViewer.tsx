"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { cargarMotorPdf } from "@/lib/pdfViewerEngine";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Loader2, Printer, ZoomIn, ZoomOut } from "lucide-react";

export default function PdfDocumentViewer({ url, filename, onClose }: {
  url: string;
  filename: string;
  onClose: () => void;
}) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(600);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState("");
  const [pageText, setPageText] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const printBusy = useRef(false);

  useEffect(() => {
    let active = true;
    let task: ReturnType<typeof import("pdfjs-dist")["getDocument"]> | undefined;
    setLoading(true); setError(""); setPdf(null); setPage(1); setZoom(1);
    void cargarMotorPdf().then(engine => {
      if (!active) return;
      task = engine.getDocument({ url });
      return task.promise;
    }).then(document => { if (active && document) setPdf(document); }).catch(cause => {
      if (active) setError("No se pudo mostrar el PDF. Puedes abrir el documento o descargarlo para revisarlo.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; if (task) void task.destroy(); };
  }, [url]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    setWidth(Math.max(160, element.clientWidth - 32));
    const observer = new ResizeObserver(entries => setWidth(Math.max(160, entries[0].contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [pdf]);

  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let active = true;
    let task: ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]> | undefined;
    setRendering(true); setError(""); setPageText("");
    void pdf.getPage(page).then(async pdfPage => {
      if (!active || !canvas.current) return;
      const original = pdfPage.getViewport({ scale: 1 });
      const viewport = pdfPage.getViewport({ scale: Math.min(width, 1000) / original.width * zoom });
      // Una sola página y un límite de píxeles evitan agotar la memoria en tablets.
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4_000_000 / (viewport.width * viewport.height)));
      const element = canvas.current;
      const context = element.getContext("2d");
      if (!context) throw new Error("Canvas no disponible");
      element.width = Math.floor(viewport.width * ratio);
      element.height = Math.floor(viewport.height * ratio);
      element.style.width = `${viewport.width}px`;
      element.style.height = `${viewport.height}px`;
      task = pdfPage.render({ canvasContext: context, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
      await task.promise;
      const text = await pdfPage.getTextContent();
      if (active) setPageText(text.items.map(item => "str" in item ? item.str : "").join(" "));
    }).catch(cause => {
      if (active && cause?.name !== "RenderingCancelledException") setError("No se pudo mostrar esta página. Intenta abrir el documento completo.");
    }).finally(() => { if (active) setRendering(false); });
    return () => { active = false; task?.cancel(); };
  }, [pdf, page, width, zoom]);

  const print = async () => {
    if (!pdf || printBusy.current) return;
    // Se abre durante el clic para respetar los bloqueos de ventanas emergentes.
    const windowPrint = window.open("", "_blank");
    if (!windowPrint) { setError("Permite abrir ventanas emergentes para imprimir el acta."); return; }
    windowPrint.opener = null;
    printBusy.current = true; setPrinting(true); setError("");
    const target = windowPrint.document;
    target.title = filename;
    const message = target.createElement("p"); message.textContent = "Preparando documento para impresión..."; target.body.appendChild(message);
    try {
      const first = await pdf.getPage(1);
      const size = first.getViewport({ scale: 1 });
      const mmWidth = size.width * 25.4 / 72; const mmHeight = size.height * 25.4 / 72;
      const style = target.createElement("style");
      style.textContent = `@page { size: ${mmWidth}mm ${mmHeight}mm; margin: 0; } body { margin:0; background:#ddd; font-family:Arial,sans-serif; } .print-controls {padding:16px;} .pdf-sheet { width:${mmWidth}mm; height:${mmHeight}mm; margin:12px auto; background:white; } img {display:block;width:100%;height:100%;} @media print { body { background:white; } .print-controls {display:none;} .pdf-sheet {margin:0;break-after:page;page-break-after:always;} .pdf-sheet:last-child {break-after:auto;page-break-after:auto;} }`;
      target.head.appendChild(style);
      const controls = target.createElement("div"); controls.className = "print-controls";
      const printButton = target.createElement("button"); printButton.textContent = "Imprimir documento"; printButton.onclick = () => windowPrint.print();
      controls.appendChild(printButton); target.body.appendChild(controls);
      for (let number = 1; number <= pdf.numPages; number++) {
        if (windowPrint.closed) throw new Error("Se cerró la ventana de impresión.");
        message.textContent = `Preparando página ${number} de ${pdf.numPages}...`;
        const pdfPage = await pdf.getPage(number);
        const viewport = pdfPage.getViewport({ scale: 200 / 72 });
        const printCanvas = document.createElement("canvas");
        printCanvas.width = Math.ceil(viewport.width); printCanvas.height = Math.ceil(viewport.height);
        const context = printCanvas.getContext("2d");
        if (!context) throw new Error("No se pudo preparar la impresión.");
        await pdfPage.render({ canvasContext: context, viewport, intent: "print" }).promise;
        const sheet = target.createElement("section"); sheet.className = "pdf-sheet";
        const img = target.createElement("img"); img.alt = `Página ${number}`; img.src = printCanvas.toDataURL("image/png");
        sheet.appendChild(img); target.body.appendChild(sheet); await img.decode();
        printCanvas.width = 0; printCanvas.height = 0;
      }
      message.remove(); windowPrint.focus(); windowPrint.print();
    } catch (cause) {
      const text = cause instanceof Error ? cause.message : "No se pudo preparar la impresión.";
      setError(text); if (!windowPrint.closed) message.textContent = text;
    } finally { printBusy.current = false; setPrinting(false); }
  };

  return <Dialog open onOpenChange={open => { if (!open && !printBusy.current) onClose(); }}>
    <DialogContent className="flex h-[96dvh] w-[96vw] max-w-6xl flex-col gap-3 overflow-hidden p-3 sm:p-5">
      <DialogHeader className="shrink-0 pr-7 text-left">
        <DialogTitle className="break-words text-base">Vista previa del documento</DialogTitle>
        <DialogDescription className="truncate">{filename}</DialogDescription>
      </DialogHeader>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg border bg-gray-50 p-2">
        <div className="flex items-center gap-1">
          <Button size="icon" variant="outline" aria-label="Página anterior" disabled={!pdf || page <= 1 || printing} onClick={() => setPage(value => value - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span aria-live="polite" className="min-w-24 text-center text-sm">{pdf ? `Página ${page} de ${pdf.numPages}` : "Cargando..."}</span>
          <Button size="icon" variant="outline" aria-label="Página siguiente" disabled={!pdf || page >= pdf.numPages || printing} onClick={() => setPage(value => value + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="outline" aria-label="Alejar" disabled={!pdf || zoom <= 0.5} onClick={() => setZoom(value => Math.max(0.5, value - 0.25))}><ZoomOut className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" disabled={!pdf} onClick={() => setZoom(1)}>Ajustar ancho</Button>
          <Button size="icon" variant="outline" aria-label="Acercar" disabled={!pdf || zoom >= 2} onClick={() => setZoom(value => Math.min(2, value + 0.25))}><ZoomIn className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={!pdf || printing} onClick={() => void print()}>{printing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Printer className="mr-1 h-4 w-4" />}{printing ? "Preparando..." : "Imprimir"}</Button>
          <Button size="sm" asChild><a href={url} download={filename}><Download className="mr-1 h-4 w-4" />Descargar</a></Button>
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-700"><ExternalLink className="h-4 w-4" />Abrir</a>
        </div>
      </div>
      {error && <p role="alert" className="shrink-0 rounded bg-red-50 p-2 text-sm text-red-800">{error}</p>}
      <div ref={container} className="relative min-h-0 flex-1 overflow-auto rounded-lg bg-gray-200 p-4" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
        {(loading || rendering) && <p role="status" className="sticky left-0 top-0 z-10 mb-2 flex items-center gap-2 text-sm text-gray-700"><Loader2 className="h-4 w-4 animate-spin" />{loading ? "Cargando documento..." : "Preparando página..."}</p>}
        <canvas ref={canvas} aria-label={`Página ${page} del documento`} className="mx-auto block bg-white shadow" />
        <p className="sr-only">{pageText}</p>
      </div>
    </DialogContent>
  </Dialog>;
}
