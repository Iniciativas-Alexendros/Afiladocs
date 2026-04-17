import { ShoppingCart, ClipboardEdit, Download } from 'lucide-react'

const STEPS = [
  {
    number: 1,
    icon: ShoppingCart,
    title: 'Elige tu documento',
    description: 'Selecciona el documento que necesitas en nuestra tienda. Precio cerrado visible antes de pagar.',
  },
  {
    number: 2,
    icon: ClipboardEdit,
    title: 'Personaliza los datos',
    description: 'Rellena el formulario online con tu información. Nuestro equipo lo personaliza para tu caso.',
  },
  {
    number: 3,
    icon: Download,
    title: 'Firma y descarga',
    description: 'Recibe tu documento firmado digitalmente (eIDAS AES) en tu portal en menos de 48 horas.',
  },
]

export function ProcessSteps() {
  return (
    <section className="py-20 bg-card/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            ¿Cómo funciona?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Un proceso simple y transparente, de principio a fin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="afd-fade-up flex flex-col items-center text-center"
              style={{ ['--afd-delay' as string]: `${i * 150}ms` }}
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
