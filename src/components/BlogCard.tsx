import Link from "next/link";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  date,
  readTime,
  category,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 h-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
            {category}
          </span>
          <span className="text-xs text-muted-foreground">{readTime}</span>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {excerpt}
        </p>
        <time className="text-xs text-muted-foreground">{date}</time>
      </article>
    </Link>
  );
}
