import { EditorPostPage } from "@/components/cms/editor-pages";

export const metadata = {
  title: "Post editor",
};

type PageProps = {
  params: Promise<{ workspaceSlug: string; postId: string }>;
};

export default function WorkspaceEditorPostPage(props: PageProps) {
  return <EditorPostPage params={props.params} />;
}
