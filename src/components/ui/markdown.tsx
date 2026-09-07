import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

/**
 * Renders CMS Markdown. react-markdown builds a React tree rather than raw HTML,
 * so authored content cannot inject script tags: HTML in the source is escaped
 * by default because we never enable rehype-raw.
 */
export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-prose text-[1.0625rem] leading-[1.75] text-ink/90',
        '[&>*+*]:mt-5',
        '[&_h2]:mt-12 [&_h2]:text-[1.5rem] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h2]:text-ink',
        '[&_h3]:mt-9 [&_h3]:text-[1.1875rem] [&_h3]:font-semibold [&_h3]:text-ink',
        '[&_p]:text-ink/85',
        '[&_a]:font-medium [&_a]:text-brand-strong [&_a]:underline [&_a]:decoration-brand/35 [&_a]:underline-offset-[3px] hover:[&_a]:decoration-brand',
        '[&_strong]:font-semibold [&_strong]:text-ink',
        '[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5',
        '[&_li]:text-ink/85 [&_li]:marker:text-faint',
        '[&_blockquote]:border-l [&_blockquote]:border-brand/30 [&_blockquote]:pl-4 [&_blockquote]:text-muted [&_blockquote]:italic',
        '[&_code]:rounded [&_code]:bg-raised [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]',
        '[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-line [&_pre]:bg-raised [&_pre]:p-4 [&_pre]:text-sm',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_hr]:border-line',
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
        '[&_th]:border-b [&_th]:border-line [&_th]:pb-2 [&_th]:text-left [&_th]:font-semibold',
        '[&_td]:border-b [&_td]:border-hairline [&_td]:py-2',
        '[&_img]:rounded-lg [&_img]:border [&_img]:border-line',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
