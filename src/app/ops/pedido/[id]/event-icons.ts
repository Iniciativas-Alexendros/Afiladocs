import {
  Activity,
  CreditCard,
  Download,
  FileSignature,
  FileText,
  Mail,
  PenTool,
  Sparkles,
  Upload,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

export const EVENT_ICONS: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  'order.created': { icon: Sparkles, color: 'text-violet-600', label: 'Pedido creado' },
  'order.paid': { icon: CreditCard, color: 'text-emerald-600', label: 'Pago recibido' },
  'checkout.session.completed': {
    icon: CreditCard,
    color: 'text-emerald-600',
    label: 'Checkout completado',
  },
  'intake.completed': {
    icon: FileSignature,
    color: 'text-blue-600',
    label: 'Intake completado',
  },
  'document.uploaded': { icon: Upload, color: 'text-sky-600', label: 'Documento subido' },
  'docuseal.sent': { icon: Mail, color: 'text-indigo-600', label: 'Enviado a firma' },
  'docuseal.signed': { icon: PenTool, color: 'text-emerald-600', label: 'Documento firmado' },
  'document.ready': { icon: FileText, color: 'text-emerald-600', label: 'Documento listo' },
  'order.cancelled': { icon: XCircle, color: 'text-rose-600', label: 'Pedido cancelado' },
  'orders.exported': { icon: Download, color: 'text-slate-600', label: 'Pedidos exportados' },
  'report.exported': { icon: Download, color: 'text-slate-600', label: 'Informe exportado' },
}

export const DEFAULT_EVENT_ICON: { icon: LucideIcon; color: string; label: string } = {
  icon: Activity,
  color: 'text-slate-500',
  label: 'Evento',
}

export default DEFAULT_EVENT_ICON
