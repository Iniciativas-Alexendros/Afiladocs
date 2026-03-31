import { useState } from "react";
import { toast } from "sonner";

export function useContactForm(preselectedService: string = "") {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    case_type: preselectedService,
    message: "",
    rgpd_accepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Por favor, completa todos los campos obligatorios");
      return;
    }

    if (!formData.rgpd_accepted) {
      toast.error("Debes aceptar la política de privacidad para continuar");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          case_type: formData.case_type || "No especificado",
          message: formData.message,
          rgpd_accepted: formData.rgpd_accepted,
        }),
      });

      if (!res.ok) throw new Error("Error al enviar");

      toast.success("Te respondo antes de 24 horas hábiles");

      setFormData({
        name: "",
        email: "",
        case_type: "",
        message: "",
        rgpd_accepted: false,
      });
    } catch {
      toast.error("No se pudo enviar el mensaje. Por favor, inténtalo de nuevo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, setFormData, isSubmitting, handleSubmit };
}
