// @ts-nocheck
import * as __fd_glob_18 from "../content/docs/workspaces/roles-permissions.mdx?collection=docs"
import * as __fd_glob_17 from "../content/docs/workspaces/invite-team.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/workspaces/index.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/getting-started/index.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/cms/sites.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/cms/publishing.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/cms/pages-and-blog.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/cms/media.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/cms/index.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/billing/index.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/account/profile.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/account/notifications.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/index.mdx?collection=docs"
import { default as __fd_glob_5 } from "../content/docs/workspaces/meta.json?collection=docs"
import { default as __fd_glob_4 } from "../content/docs/getting-started/meta.json?collection=docs"
import { default as __fd_glob_3 } from "../content/docs/cms/meta.json?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/billing/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/account/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "account/meta.json": __fd_glob_1, "billing/meta.json": __fd_glob_2, "cms/meta.json": __fd_glob_3, "getting-started/meta.json": __fd_glob_4, "workspaces/meta.json": __fd_glob_5, }, {"index.mdx": __fd_glob_6, "account/notifications.mdx": __fd_glob_7, "account/profile.mdx": __fd_glob_8, "billing/index.mdx": __fd_glob_9, "cms/index.mdx": __fd_glob_10, "cms/media.mdx": __fd_glob_11, "cms/pages-and-blog.mdx": __fd_glob_12, "cms/publishing.mdx": __fd_glob_13, "cms/sites.mdx": __fd_glob_14, "getting-started/index.mdx": __fd_glob_15, "workspaces/index.mdx": __fd_glob_16, "workspaces/invite-team.mdx": __fd_glob_17, "workspaces/roles-permissions.mdx": __fd_glob_18, });