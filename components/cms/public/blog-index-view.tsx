import { BlogIndexHeader } from "@/components/cms/blog-index-header";
import { BlogPostCard } from "@/components/cms/public/blog-post-card";
import { cn } from "@/lib/utils";
import type { BlogPostListItem } from "@/types/post";

type BlogIndexViewProps = {
  heading: string;
  posts: BlogPostListItem[];
  basePath: string;
  tagline?: string | null;
  description?: string | null;
  className?: string;
};

/**
 * Public blog index — card grid for the site feed and blog_index home pages.
 */
export function BlogIndexView({
  heading,
  posts,
  basePath,
  tagline = "Latest Updates",
  description,
  className,
}: BlogIndexViewProps) {
  return (
    <section className={cn("pt-8 pb-12 md:pt-10 md:pb-16 lg:pb-20", className)}>
      <div className="container mx-auto flex flex-col items-center gap-8 px-6">
        <BlogIndexHeader heading={heading} tagline={tagline} description={description} />

        {posts.length > 0 ? (
          <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {posts.map((post, index) => (
              <BlogPostCard
                key={post.id}
                post={post}
                href={`${basePath}/blog/${post.slug}`}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">No published posts yet.</p>
        )}
      </div>
    </section>
  );
}
