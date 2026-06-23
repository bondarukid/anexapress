export type ChangelogListItem = {
  title: string;
  description: string;
};

export type ChangelogGroup = {
  heading: string;
  items: ChangelogListItem[];
};

export type ChangelogFooterLink = {
  label: string;
  href: string;
};

export type ChangelogRelease = {
  id: string;
  date: string;
  dateTime: string;
  title: string;
  intro: string;
  introEmphasis?: string;
  introTrailing?: string;
  heroImage: string;
  avatarImage: string;
  groups: ChangelogGroup[];
  footerLink?: ChangelogFooterLink;
};
