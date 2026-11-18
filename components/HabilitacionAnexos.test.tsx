import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HabilitacionAnexos from "./HabilitacionAnexos";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
// Native selects keep these tests focused on assignments and persistence.
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => <select value={value} disabled={disabled} onChange={event => onValueChange(event.target.value)}><option value="" />{children}</select>,
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

const props = { adminId: 1, role: "ADMIN", anexos: [], cargandoAnexos: false };
const key = `anexos-habilitados-prueba:v1:${process.env.NEXT_PUBLIC_API_URL}:1`;

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("token", "test-token");
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 2, username: "Ana" }, { id: 3, username: "Luis" }] });
});

it("saves assignments separately for users with no annexes and restores them", async () => {
  const view = render(<HabilitacionAnexos {...props} />);
  const userSelect = screen.getAllByRole("combobox")[0];
  await waitFor(() => expect(userSelect).toBeEnabled());
  fireEvent.change(userSelect, { target: { value: "2" } });
  fireEvent.click(screen.getByLabelText(/MJ01 ·/));
  fireEvent.click(screen.getByRole("button", { name: "Guardar prueba" }));
  expect(JSON.parse(localStorage.getItem(key)!)["2"]).toContain("MJ01");
  fireEvent.change(userSelect, { target: { value: "3" } });
  expect(screen.getByLabelText(/MJ01 ·/)).not.toBeChecked();
  fireEvent.click(screen.getByLabelText(/MJ01 ·/));
  fireEvent.click(screen.getByRole("button", { name: "Guardar prueba" }));
  expect(Object.keys(JSON.parse(localStorage.getItem(key)!))).toEqual(["2", "3"]);
  view.unmount();
  render(<HabilitacionAnexos {...props} />);
  await waitFor(() => expect(screen.getAllByRole("combobox")[0]).toBeEnabled());
  fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "2" } });
  expect(screen.getByLabelText(/MJ01 ·/)).toBeChecked();
});

it("does not expose the prototype or fetch users for a regular user", () => {
  const { container } = render(<HabilitacionAnexos {...props} role="USER" />);
  expect(container).toBeEmptyDOMElement();
  expect(fetch).not.toHaveBeenCalled();
});

it("blocks editing and preserves malformed storage", async () => {
  localStorage.setItem(key, '{invalid');
  render(<HabilitacionAnexos {...props} />);
  await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  expect(screen.getAllByRole("combobox")[0]).toBeDisabled();
  expect(localStorage.getItem(key)).toBe('{invalid');
});

it("reports failed user loading and offers retry", async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 403 });
  render(<HabilitacionAnexos {...props} />);
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("403"));
  expect(screen.getAllByRole("combobox")[0]).toBeDisabled();
  expect(screen.getByRole("button", { name: "Reintentar" })).toBeEnabled();
});
