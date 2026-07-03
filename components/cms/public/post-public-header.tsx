import { PostHeader, type PostHeaderProps } from "@/components/cms/post/post-header";

export type PostPublicHeaderProps = PostHeaderProps;

/**
 * Public blog post header wrapper.
 */
export function PostPublicHeader(props: PostPublicHeaderProps) {
  return <PostHeader {...props} />;
}
