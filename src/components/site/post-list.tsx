import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { PostWithRelations } from '@/types/database';

/** Article index row: date and category on the left, content on the right. */
export function PostListItem({ post }: { post: PostWithRelations }) {
  return (
    <article className="group border-t border-line">
      <Link
        href={`/insights/${post.slug}`}
        className="grid gap-3 py-7 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10 md:py-9"
      >
        <div className="flex items-center gap-3 md:block">
          <time
            dateTime={post.published_at ?? undefined}
            className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint"
          >
            {formatDate(post.published_at)}
          </time>
          {post.category && (
            <p className="text-xs text-muted md:mt-2">{post.category.name}</p>
          )}
        </div>

        <div>
          <h3 className="text-[1.375rem] font-semibold leading-snug tracking-[-0.018em] text-ink transition-colors duration-150 group-hover:text-brand-strong md:text-2xl">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2.5 max-w-prose text-[0.9375rem] leading-relaxed text-muted">
              {post.excerpt}
            </p>
          )}
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-strong">
            Read
            <span
              aria-hidden="true"
              className="transition-transform duration-200 ease-out group-hover:translate-x-1"
            >
              →
            </span>
          </p>
        </div>
      </Link>
    </article>
  );
}

/** Larger treatment for the most recent article on the Insights index. */
export function FeaturedPost({ post }: { post: PostWithRelations }) {
  return (
    <article className="group">
      <Link href={`/insights/${post.slug}`} className="block">
        {post.featured_image_url && (
          <div className="relative mb-6 aspect-[16/7] overflow-hidden rounded-xl border border-line bg-raised">
            <Image
              src={post.featured_image_url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow">Latest</span>
          <time
            dateTime={post.published_at ?? undefined}
            className="font-mono text-[0.75rem] text-faint"
          >
            {formatDate(post.published_at)}
          </time>
          {post.reading_minutes && (
            <span className="font-mono text-[0.75rem] text-faint">
              {post.reading_minutes} min read
            </span>
          )}
        </div>
        <h2 className="mt-4 max-w-3xl text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.022em] text-ink transition-colors duration-150 group-hover:text-brand-strong md:text-[2.25rem]">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">{post.excerpt}</p>
        )}
      </Link>
    </article>
  );
}
