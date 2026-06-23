import Link from "next/link";
import { format } from "date-fns";

import type { PostSummary } from "@/types/post";

type BlogIndexViewProps = {
  title: string;
  posts: PostSummary[];
  basePath: string;
};

export function BlogIndexView({ title, posts, basePath }: BlogIndexViewProps) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </header>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.id} className="border-border border-b pb-8 last:border-0">
            <Link href={`${basePath}/blog/${post.slug}`} className="group block">
              <h2 className="group-hover:text-primary text-xl font-semibold">{post.title}</h2>
              {post.publishedAt ? (
                <time className="text-muted-foreground mt-1 block text-sm">
                  {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                </time>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No published posts yet.</p>
      ) : null}
    </main>
  );
}
