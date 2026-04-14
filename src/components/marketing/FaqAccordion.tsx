"use client"

import { FAQ_ITEMS } from '@/lib/faq-data'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function FaqAccordion() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Todo lo que necesitas saber antes de pedir tu documento
          </p>
        </div>

        <Accordion type="single" collapsible className="max-w-2xl mx-auto divide-y divide-border">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-0 py-1">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
