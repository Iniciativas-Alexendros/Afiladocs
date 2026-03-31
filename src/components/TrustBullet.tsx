import type { LucideIcon } from "lucide-react";

interface TrustBulletProps {
  icon: LucideIcon;
  text: string;
}

export function TrustBullet({ icon: Icon, text }: TrustBulletProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
      <Icon className="w-6 h-6 text-primary flex-shrink-0" />
      <span className="text-sm font-medium text-foreground">{text}</span>
    </div>
  );
}
