import { Badge } from '@/components/ui/badge';
import { POST_STATUS, PRODUCT_STATUS, PROJECT_STATUS, MESSAGE_STATUS } from '@/lib/constants';
import type { MessageStatus, PostStatus, ProductStatus, ProjectStatus } from '@/types/database';

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const meta = PRODUCT_STATUS[status];
  return (
    <Badge tone={meta.tone} dot={status === 'available' || status === 'in_development'}>
      {meta.label}
    </Badge>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const meta = POST_STATUS[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function MessageStatusBadge({ status }: { status: MessageStatus }) {
  const meta = MESSAGE_STATUS[status];
  return <Badge tone={meta.tone} dot={status === 'unread'}>{meta.label}</Badge>;
}
