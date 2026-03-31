"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContactForm } from "@/hooks/useContactForm";

interface ContactFormProps {
  preselectedService?: string;
}

export function ContactForm({ preselectedService = "" }: ContactFormProps) {
  const { formData, setFormData, isSubmitting, handleSubmit } = useContactForm(preselectedService);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-foreground">
          Nombre *
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="mt-2 bg-white text-gray-900 placeholder:text-gray-400"
          placeholder="Tu nombre completo"
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-foreground">
          Email *
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="mt-2 bg-white text-gray-900 placeholder:text-gray-400"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <Label htmlFor="case_type" className="text-foreground">
          Tipo de caso
        </Label>
        <Select
          value={formData.case_type}
          onValueChange={(value) =>
            setFormData({ ...formData, case_type: value })
          }
        >
          <SelectTrigger className="mt-2 bg-white text-gray-900">
            <SelectValue placeholder="Selecciona un tipo de caso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consulta">Consulta rápida</SelectItem>
            <SelectItem value="revision">Revisión de documento</SelectItem>
            <SelectItem value="redaccion">Redacción de documento</SelectItem>
            <SelectItem value="contrato">Contrato</SelectItem>
            <SelectItem value="informe">Informe jurídico</SelectItem>
            <SelectItem value="sancion">Recurso de sanción</SelectItem>
            <SelectItem value="legaltech">LegalTech & IA</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="message" className="text-foreground">
          Mensaje *
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={6}
          className="mt-2 bg-white text-gray-900 placeholder:text-gray-400"
          placeholder="Cuéntame tu situación..."
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="rgpd"
          checked={formData.rgpd_accepted}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, rgpd_accepted: checked === true })
          }
        />
        <Label
          htmlFor="rgpd"
          className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
        >
          He leído y acepto la{" "}
          <Link href="/legal/privacidad" className="text-primary hover:underline">
            política de privacidad
          </Link>
          . Mis datos serán tratados conforme al RGPD. *
        </Label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
      >
        {isSubmitting ? "Enviando..." : "Enviar mensaje"}
      </Button>
    </form>
  );
}
