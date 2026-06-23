"use client";

import * as React from "react";
import type { FormEvent } from "react";
import { TriangleAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { SupportTicketAttachments } from "@/components/landing/help/support-ticket-attachments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  supportTicketCategories,
  supportTicketDefaults,
  supportTicketPriorities,
} from "@/lib/help/support-ticket";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";
import { supportTicketSchema } from "@/schemas/support-ticket.schema";
import type {
  SupportTicketCategory,
  SupportTicketCategoryId,
  SupportTicketData,
  SupportTicketPriority,
  SupportTicketPriorityId,
} from "@/types/help";

export type SupportTicketFormProps = {
  title?: string;
  description?: string;
  categories?: SupportTicketCategory[];
  priorities?: SupportTicketPriority[];
  layout?: "card" | "plain";
  formId?: string;
  showFooter?: boolean;
  className?: string;
  onSubmit?: (data: SupportTicketData) => void | Promise<void>;
  onSuccess?: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

type FormErrors = Partial<
  Record<"email" | "category" | "priority" | "subject" | "description", boolean>
>;

const initialFormState = {
  email: "",
  category: "" as SupportTicketCategoryId | "",
  priority: "" as SupportTicketPriorityId | "",
  subject: "",
  description: "",
};

function PriorityLabel({ priority }: { priority: SupportTicketPriority }) {
  if (priority.isUrgent) {
    return (
      <span className="flex items-center gap-1.5">
        <TriangleAlert className="text-destructive size-4" />
        {priority.label}
      </span>
    );
  }

  return <span>{priority.label}</span>;
}

function mapSchemaErrors(
  fieldErrors: Partial<Record<keyof FormErrors, string[] | undefined>>,
): FormErrors {
  return {
    email: Boolean(fieldErrors.email?.length),
    category: Boolean(fieldErrors.category?.length),
    priority: Boolean(fieldErrors.priority?.length),
    subject: Boolean(fieldErrors.subject?.length),
    description: Boolean(fieldErrors.description?.length),
  };
}

export function SupportTicketForm({
  title = supportTicketDefaults.title,
  description = supportTicketDefaults.description,
  categories = supportTicketCategories,
  priorities = supportTicketPriorities,
  layout = "plain",
  formId = "support-ticket-form",
  showFooter = true,
  className,
  onSubmit,
  onSuccess,
  onSubmittingChange,
}: SupportTicketFormProps) {
  const [form, setForm] = React.useState(initialFormState);
  const [files, setFiles] = React.useState<File[]>([]);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedPriority = priorities.find((priority) => priority.id === form.priority);

  function updateField<K extends keyof typeof initialFormState>(
    key: K,
    value: (typeof initialFormState)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: false }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = supportTicketSchema.safeParse({
      email: form.email.trim(),
      category: form.category || undefined,
      priority: form.priority || undefined,
      subject: form.subject.trim(),
      description: form.description.trim(),
    });

    if (!parsed.success) {
      const nextErrors = mapSchemaErrors(parsed.error.flatten().fieldErrors);
      setErrors(nextErrors);
      toast.error("Please fill in all required fields.", { id: "support-ticket-submit" });
      return;
    }

    const ticketData: SupportTicketData = {
      ...parsed.data,
      files,
    };

    setIsSubmitting(true);
    onSubmittingChange?.(true);

    try {
      if (onSubmit) {
        await onSubmit(ticketData);
      } else {
        toast.success("Support ticket submitted successfully.", { id: "support-ticket-submit" });
      }

      setForm(initialFormState);
      setFiles([]);
      setErrors({});
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
      onSubmittingChange?.(false);
    }
  }

  const fields = (
    <FieldGroup className={cn(layout === "card" ? "pt-6 pb-8" : "py-6")}>
      <Field>
        <FieldLabel htmlFor="support-ticket-email" id={getFieldLabelId("support-ticket-email")}>
          Email
        </FieldLabel>
        <Input
          id="support-ticket-email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          aria-invalid={errors.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel
            htmlFor="support-ticket-category"
            id={getFieldLabelId("support-ticket-category")}
          >
            Category
          </FieldLabel>
          <Select
            value={form.category || undefined}
            onValueChange={(value) => updateField("category", value as SupportTicketCategoryId)}
          >
            <SelectTrigger
              id="support-ticket-category"
              className="w-full"
              aria-invalid={errors.category}
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="support-ticket-priority"
            id={getFieldLabelId("support-ticket-priority")}
          >
            Priority
          </FieldLabel>
          <Select
            value={form.priority || undefined}
            onValueChange={(value) => updateField("priority", value as SupportTicketPriorityId)}
          >
            <SelectTrigger
              id="support-ticket-priority"
              className="w-full"
              aria-invalid={errors.priority}
            >
              <SelectValue placeholder="Select priority">
                {selectedPriority ? <PriorityLabel priority={selectedPriority} /> : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority.id} value={priority.id}>
                  <PriorityLabel priority={priority} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="support-ticket-subject" id={getFieldLabelId("support-ticket-subject")}>
          Subject
        </FieldLabel>
        <Input
          id="support-ticket-subject"
          placeholder="Brief summary of your issue"
          value={form.subject}
          aria-invalid={errors.subject}
          onChange={(event) => updateField("subject", event.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel
          htmlFor="support-ticket-description"
          id={getFieldLabelId("support-ticket-description")}
        >
          Description
        </FieldLabel>
        <Textarea
          id="support-ticket-description"
          placeholder="Provide as much detail as possible..."
          className="min-h-30"
          value={form.description}
          aria-invalid={errors.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </Field>

      <Field className={cn(layout === "card" && "pb-2")}>
        <FieldLabel>Attachments</FieldLabel>
        <SupportTicketAttachments files={files} onFilesChange={setFiles} />
      </Field>
    </FieldGroup>
  );

  const submitButton = (
    <Button type="submit" form={formId} disabled={isSubmitting}>
      {isSubmitting ? "Submitting..." : "Submit Ticket"}
    </Button>
  );

  if (layout === "card") {
    return (
      <section className={cn("w-full", className)}>
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <form id={formId} onSubmit={handleSubmit}>
              {fields}
            </form>
          </CardContent>
          {showFooter ? (
            <CardFooter className="justify-end border-t pt-6">{submitButton}</CardFooter>
          ) : null}
        </Card>
      </section>
    );
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className={cn("flex flex-col", className)}>
      {fields}
      {showFooter ? <div className="flex justify-end border-t py-4">{submitButton}</div> : null}
    </form>
  );
}
