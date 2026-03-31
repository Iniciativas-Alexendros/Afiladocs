interface TestimonialCardProps {
  name: string;
  city: string;
  service: string;
  quote: string;
}

export function TestimonialCard({
  name,
  city,
  service,
  quote,
}: TestimonialCardProps) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border break-inside-avoid mb-6">
      <p className="text-muted-foreground leading-relaxed mb-4 italic">
        &ldquo;{quote}&rdquo;
      </p>
      <div>
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">
          {city} · {service}
        </p>
      </div>
    </div>
  );
}
