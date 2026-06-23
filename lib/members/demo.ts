import type { MemberDisplayItem } from "@/types/member-display";

export const demoMembers: MemberDisplayItem[] = [
  {
    id: "demo-1",
    name: "Alex Thompson",
    subtitle: "Engineering Lead",
    avatarUrl: "https://github.com/shadcn.png",
    badges: [{ id: "dept-1", label: "Engineering" }],
    presence: { label: "Active", tone: "active" },
  },
  {
    id: "demo-2",
    name: "Sarah Chen",
    subtitle: "Product Manager",
    avatarUrl: "https://github.com/shadcn.png",
    badges: [{ id: "dept-2", label: "Product" }],
    presence: { label: "In a meeting", tone: "busy" },
  },
  {
    id: "demo-3",
    name: "Michael Park",
    subtitle: "UI Designer",
    avatarUrl: "https://github.com/shadcn.png",
    badges: [{ id: "dept-3", label: "Design" }],
    presence: { label: "Away", tone: "away" },
  },
  {
    id: "demo-4",
    name: "Lisa Brown",
    subtitle: "Backend Developer",
    avatarUrl: "https://github.com/shadcn.png",
    badges: [{ id: "dept-4", label: "Engineering" }],
    presence: { label: "Active", tone: "active" },
  },
  {
    id: "demo-5",
    name: "David Kim",
    subtitle: "Data Scientist",
    avatarUrl: "https://github.com/shadcn.png",
    badges: [{ id: "dept-5", label: "Analytics" }],
    presence: { label: "Do not disturb", tone: "offline" },
  },
  {
    id: "demo-6",
    name: "Emma Wilson",
    subtitle: "Content Strategist",
    avatarUrl: "https://github.com/shadcn.png",
    badges: [{ id: "dept-6", label: "Marketing" }],
    presence: { label: "Active", tone: "active" },
    verified: true,
  },
];
