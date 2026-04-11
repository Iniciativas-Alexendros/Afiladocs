import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { Route } from "next";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;
  link: string;
}

export function ServiceCard({
  icon: Icon,
  title,
  description,
  price,
  link,
}: ServiceCardProps) {
  return (
    <Link href={link as Route<string>} className="group block">
      <div className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 h-full">
        <Icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform duration-200" />
        <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>
        <span className="text-primary font-semibold">{price}</span>
      </div>
    </Link>
  );
}
