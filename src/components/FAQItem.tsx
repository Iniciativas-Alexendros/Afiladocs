import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItemProps {
  value: string;
  question: string;
  answer: string;
}

export function FAQItem({ value, question, answer }: FAQItemProps) {
  return (
    <AccordionItem value={value} className="bg-card rounded-xl border border-border px-6">
      <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground leading-relaxed">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}
