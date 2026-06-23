"use client";

import { ChevronRight, File, Folder } from "lucide-react";
import { useMemo, useState } from "react";

import type {
  DrawerCartItem,
  DrawerFileNode,
  DrawerFilterSection,
  DrawerNavGroup,
  DrawerNavItem,
  DrawerNotificationItem,
  DrawerQuickAction,
  DrawerSettingGroup,
} from "@/components/drawers/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";

type DrawerNavListProps = {
  items: DrawerNavItem[];
  className?: string;
};

export function DrawerNavList({ items, className }: DrawerNavListProps) {
  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            {Icon ? <Icon className="size-4 shrink-0" /> : null}
            <span>{item.label}</span>
          </>
        );

        if (item.href) {
          return (
            <a
              key={item.id}
              href={item.href}
              className="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm"
            >
              {content}
            </a>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}

type DrawerNestedNavProps = {
  groups: DrawerNavGroup[];
  className?: string;
};

export function DrawerNestedNav({ groups, className }: DrawerNestedNavProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {groups.map((group) => {
        const GroupIcon = group.icon;

        return (
          <Collapsible key={group.id} defaultOpen>
            <CollapsibleTrigger className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
              {GroupIcon ? <GroupIcon className="size-4 shrink-0" /> : null}
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronRight className="size-4 shrink-0 transition-transform in-data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4">
              <DrawerNavList items={group.items} />
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

type DrawerSearchNavProps = {
  items: DrawerNavItem[];
  placeholder?: string;
  className?: string;
};

export function DrawerSearchNav({
  items,
  placeholder = "Search...",
  className,
}: DrawerSearchNavProps) {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) => item.label.toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <Field className={className}>
      <FieldLabel htmlFor="drawer-search-nav" id={getFieldLabelId("drawer-search-nav")} className="sr-only">
        Search
      </FieldLabel>
      <Input
        id="drawer-search-nav"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <DrawerNavList items={filteredItems} />
    </Field>
  );
}

type DrawerFileTreeProps = {
  nodes: DrawerFileNode[];
  className?: string;
};

function FileTreeNode({ node, depth = 0 }: { node: DrawerFileNode; depth?: number }) {
  const isFolder = node.type === "folder";

  if (!isFolder) {
    return (
      <div
        className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <File className="text-muted-foreground size-4 shrink-0" />
        <span>{node.name}</span>
      </div>
    );
  }

  return (
    <Collapsible defaultOpen={depth === 0}>
      <CollapsibleTrigger
        className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <Folder className="text-muted-foreground size-4 shrink-0" />
        <span className="flex-1 text-left">{node.name}</span>
        <ChevronRight className="size-4 shrink-0 transition-transform in-data-[state=open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {node.children?.map((child) => (
          <FileTreeNode key={child.id} node={child} depth={depth + 1} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DrawerFileTree({ nodes, className }: DrawerFileTreeProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {nodes.map((node) => (
        <FileTreeNode key={node.id} node={node} />
      ))}
    </div>
  );
}

type DrawerFilterPanelProps = {
  sections: DrawerFilterSection[];
  onApply?: () => void;
  onReset?: () => void;
  className?: string;
};

export function DrawerFilterPanel({
  sections,
  onApply,
  onReset,
  className,
}: DrawerFilterPanelProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {sections.map((section, index) => (
        <div key={section.id} className="flex flex-col gap-3">
          {index > 0 ? <Separator /> : null}
          <p className="text-sm font-medium">{section.label}</p>
          <FieldGroup className="gap-2">
            {section.options.map((option) => (
              <Field key={option.id} orientation="horizontal">
                <Checkbox id={option.id} defaultChecked={option.checked} />
                <FieldLabel className="text-sm font-normal" htmlFor={option.id}>
                  {option.label}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={onApply}>
          Apply
        </Button>
        <Button className="flex-1" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

type DrawerSettingsPanelProps = {
  groups: DrawerSettingGroup[];
  className?: string;
};

export function DrawerSettingsPanel({ groups, className }: DrawerSettingsPanelProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {groups.map((group, index) => (
        <div key={group.id} className="flex flex-col gap-3">
          {index > 0 ? <Separator /> : null}
          <p className="text-sm font-medium">{group.label}</p>
          <div className="flex flex-col gap-3">
            {group.items.map((item) => (
              <Field key={item.id} orientation="horizontal" className="justify-between gap-4">
                <FieldContent>
                  <FieldLabel htmlFor={item.id} id={getFieldLabelId(item.id)}>
                    {item.label}
                  </FieldLabel>
                  {item.description ? (
                    <FieldDescription className="text-xs">{item.description}</FieldDescription>
                  ) : null}
                </FieldContent>
                <Switch id={item.id} defaultChecked={item.checked} aria-labelledby={getFieldLabelId(item.id)} />
              </Field>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type DrawerCartListProps = {
  items: DrawerCartItem[];
  onCheckout?: () => void;
  className?: string;
};

export function DrawerCartList({ items, onCheckout, className }: DrawerCartListProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-muted-foreground text-xs">
                Qty {item.quantity} · ${item.price.toFixed(2)}
              </p>
            </div>
            <p className="text-sm font-medium">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Subtotal</span>
        <span className="text-sm font-semibold">${subtotal.toFixed(2)}</span>
      </div>
      <Button onClick={onCheckout}>Checkout</Button>
    </div>
  );
}

type DrawerNotificationListProps = {
  items: DrawerNotificationItem[];
  className?: string;
};

export function DrawerNotificationList({
  items,
  className,
}: DrawerNotificationListProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex flex-col gap-1 rounded-lg border p-3",
            !item.read && "border-primary/30 bg-primary/5",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{item.title}</p>
            {!item.read ? <Badge variant="secondary">New</Badge> : null}
          </div>
          <p className="text-muted-foreground text-xs">{item.message}</p>
          {item.time ? (
            <p className="text-muted-foreground text-xs">{item.time}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

type DrawerQuickActionGridProps = {
  actions: DrawerQuickAction[];
  className?: string;
};

export function DrawerQuickActionGrid({
  actions,
  className,
}: DrawerQuickActionGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Button
            key={action.id}
            variant="outline"
            className="flex h-auto flex-col gap-2 py-4"
            onClick={action.onClick}
          >
            {Icon ? <Icon className="size-5" /> : null}
            <span className="text-xs">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

type DrawerScrollListProps = {
  items: string[];
  className?: string;
};

export function DrawerScrollList({ items, className }: DrawerScrollListProps) {
  return (
    <ScrollArea className={cn("h-64", className)}>
      <div className="flex flex-col gap-2 pr-4">
        {items.map((item, index) => (
          <p key={`${item}-${index}`} className="text-sm">
            {item}
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}
