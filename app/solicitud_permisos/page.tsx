import { Suspense } from "react";
import FormComponet from "./FormComponent";

export default function SolicitudPermisosPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormComponet />
    </Suspense>
  );
}