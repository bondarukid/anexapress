"use client";

import { BarChart3, ClipboardList, Leaf, Shield, Users, Zap } from "lucide-react";
import { motion } from "motion/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Leaf,
    title: "Emissions tracking",
    description:
      "Record and organize greenhouse gas emissions data in one workspace-ready platform.",
  },
  {
    icon: ClipboardList,
    title: "Structured reporting",
    description:
      "Keep activity records consistent so teams can prepare compliance-ready summaries.",
  },
  {
    icon: BarChart3,
    title: "Team visibility",
    description:
      "Give stakeholders a shared view of progress without exporting scattered spreadsheets.",
  },
  {
    icon: Users,
    title: "Team workspaces",
    description: "Invite teammates, assign roles, and collaborate without sharing passwords.",
  },
  {
    icon: Shield,
    title: "Access control",
    description: "Fine-grained permissions help separate operators, reviewers, and administrators.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    description: "Go from signup to an active workspace in under 30 minutes.",
  },
] as const;

/** End-user feature highlights for documentation overview pages. */
export function FeatureGrid() {
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
        >
          <Card className="border-border/60 h-full">
            <CardHeader className="pb-2">
              <feature.icon className="text-primary mb-2 size-5" aria-hidden />
              <CardTitle className="text-base">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
