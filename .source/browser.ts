// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "account/notifications.mdx": () => import("../content/docs/account/notifications.mdx?collection=docs"), "account/profile.mdx": () => import("../content/docs/account/profile.mdx?collection=docs"), "getting-started/index.mdx": () => import("../content/docs/getting-started/index.mdx?collection=docs"), "billing/index.mdx": () => import("../content/docs/billing/index.mdx?collection=docs"), "workspaces/index.mdx": () => import("../content/docs/workspaces/index.mdx?collection=docs"), "workspaces/invite-team.mdx": () => import("../content/docs/workspaces/invite-team.mdx?collection=docs"), "workspaces/roles-permissions.mdx": () => import("../content/docs/workspaces/roles-permissions.mdx?collection=docs"), }),
};
export default browserCollections;