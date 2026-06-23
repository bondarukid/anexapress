/** Serializable sidebar nav item passed from server layout to client docs shell. */
export type SerializedDocsNavItem = {
  title: string;
  url?: string;
  items?: SerializedDocsNavItem[];
  defaultOpen?: boolean;
};

/** Flat page reference for header title lookup. */
export type DocsPageRef = {
  url: string;
  title: string;
};
