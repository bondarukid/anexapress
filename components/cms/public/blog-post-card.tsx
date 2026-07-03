import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, ImageIcon } from "lucide-react";

import {
  PostHeaderAuthorRow,
} from "@/components/cms/post/post-header";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BlogPostListItem } from "@/types/post";

type BlogPostCardProps = {
  post: BlogPostListItem;
  href: string;
  className?: string;
  /** First above-the-fold cover — eager load for LCP. */
  priority?: boolean;
};

export function BlogPostCard({ post, href, className, priority = false }: BlogPostCardProps) {
  const publishedLabel =
    post.publishedAt ? format(new Date(post.publishedAt), "d MMM yyyy") : null;
  const authorName = post.authorName?.trim() || null;

  return (
    <Card
      className={cn(
        "grid grid-rows-[auto_auto_1fr_auto] overflow-hidden pt-0",
        className,
      )}
    >
      <div className="bg-muted relative aspect-video w-full">
        {post.coverImageUrl ? (
          <Link
            href={href}
            className="relative block h-full w-full transition-opacity duration-200 hover:opacity-80"
          >
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority={priority}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        ) : (
          <Link
            href={href}
            className="text-muted-foreground flex h-full w-full items-center justify-center transition-opacity duration-200 hover:opacity-80"
          >
            <ImageIcon className="size-10 opacity-40" aria-hidden />
            <span className="sr-only">{post.title}</span>
          </Link>
        )}
      </div>

      <CardHeader>
        <h3 className="text-xl md:text-xl">
          <Link href={href} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        {authorName ? (
          <PostHeaderAuthorRow
            className="mt-3"
            authorName={authorName}
            authorAvatarUrl={post.authorAvatarUrl}
            meta={publishedLabel}
          />
        ) : publishedLabel ? (
          <time
            className="text-muted-foreground mt-2 block text-xs"
            dateTime={post.publishedAt ?? undefined}
          >
            {publishedLabel}
          </time>
        ) : null}
      </CardHeader>

      {post.summary ? (
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{post.summary}</p>
        </CardContent>
      ) : (
        <CardContent className="pb-0" />
      )}

      <CardFooter>
        <Link
          href={href}
          className="text-muted-foreground flex items-center hover:underline"
        >
          Read more
          <ArrowRight className="ml-1 size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
