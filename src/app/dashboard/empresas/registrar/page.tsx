import type { Metadata } from "next"
import { RegistroEmpresaForm } from "@/components/register-companies-form"

export const metadata: Metadata = {
  title: "Registro de Empresa",
  description: "Formulario para registrar una nueva empresa en la plataforma.",
}

export default function RegistrarEmpresaPage() {
  return (
    <div className="container max-w-3xl py-10">
      <RegistroEmpresaForm />
    </div>
  )
}
