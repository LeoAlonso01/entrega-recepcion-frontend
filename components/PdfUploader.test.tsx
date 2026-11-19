import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PdfUploader from "./PdfUploader";

it("includes the key and session and reports server denial without attaching the file", async () => {
  localStorage.setItem("token", "test-token");
  URL.createObjectURL = jest.fn().mockReturnValue("blob:test");
  global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ detail: "Clave no habilitada" }) });
  const success = jest.fn();
  const { container } = render(<PdfUploader clave="MJ01" onUploadSuccess={success} />);
  fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [new File(["%PDF-test"], "test.pdf", { type: "application/pdf" })] } });
  await screen.findByText(/Clave no habilitada/);
  expect(success).not.toHaveBeenCalled();
  const options = (fetch as jest.Mock).mock.calls[0][1];
  expect(options.headers.Authorization).toBe("Bearer test-token");
  expect(options.body.get("clave")).toBe("MJ01");
});
