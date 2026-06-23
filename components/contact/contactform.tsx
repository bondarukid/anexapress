"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { getSiteHostLabel, getSiteUrl } from "@/lib/docs/host";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { contactFormSchema, type ContactFormData } from "@/schemas/contact.schema";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlobeIcon, LoaderIcon, MailIcon, PhoneIcon } from "lucide-react";

interface ContactProps {
  title?: string;
  description?: string;
  phone?: string;
  email?: string;
  web?: { label: string; url: string };
  className?: string;
  onSubmit?: (data: ContactFormData) => Promise<void>;
}

const Contact = ({
  title = "Contact Us",
  description = "Have a question or want to work together? We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.",
  phone = "(123) 34567890",
  email = "bondarukid@icloud.com",
  web = {
    label: getSiteHostLabel(),
    url: getSiteUrl(),
  },
  className,
  onSubmit,
}: ContactProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setIsSubmitted(true);
      setShowSuccess(true);
      form.reset();
      setTimeout(() => setShowSuccess(false), 4500);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch {
      form.setError("root", {
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 lg:flex-row lg:gap-24">
          <div className="flex flex-1 flex-col gap-10">
            <div>
              <h1 className="mb-4 text-4xl font-medium tracking-tight md:text-5xl">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-col gap-6">
              <a href={`tel:${phone}`} className="group flex items-center gap-3">
                <PhoneIcon className="text-muted-foreground size-5" />
                <span className="group-hover:underline">{phone}</span>
              </a>
              <a href={`mailto:${email}`} className="group flex items-center gap-3">
                <MailIcon className="text-muted-foreground size-5" />
                <span className="group-hover:underline">{email}</span>
              </a>
              <a href={web.url} target="_blank" className="group flex items-center gap-3">
                <GlobeIcon className="text-muted-foreground size-5" />
                <span className="group-hover:underline">{web.label}</span>
              </a>
            </div>
          </div>
          <div className="flex-1">
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="bg-muted/50 flex flex-col gap-6 rounded-xl p-8 md:p-10"
            >
              <div>
                <h2 className="text-xl font-semibold">Send us a message</h2>
                <p className="text-muted-foreground text-sm">We&#39;ll respond within 24 hours</p>
              </div>
              {isSubmitted && (
                <div
                  className={cn(
                    "rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center transition-opacity duration-500",
                    showSuccess ? "opacity-100" : "opacity-0",
                  )}
                >
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Thank you! Your message has been sent.
                  </p>
                </div>
              )}
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name} id={getFieldLabelId(field.name)}>
                          First Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          aria-labelledby={getFieldLabelId(field.name)}
                          placeholder="John"
                          className="bg-background"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name} id={getFieldLabelId(field.name)}>
                          Last Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          aria-labelledby={getFieldLabelId(field.name)}
                          placeholder="Doe"
                          className="bg-background"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} id={getFieldLabelId(field.name)}>
                        Email <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        aria-invalid={fieldState.invalid}
                        aria-labelledby={getFieldLabelId(field.name)}
                        placeholder="john@example.com"
                        className="bg-background"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="subject"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} id={getFieldLabelId(field.name)}>
                        Subject <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        aria-labelledby={getFieldLabelId(field.name)}
                        placeholder="How can we help?"
                        className="bg-background"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="message"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} id={getFieldLabelId(field.name)}>
                        Message <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        aria-labelledby={getFieldLabelId(field.name)}
                        placeholder="Tell us about your organization or use case..."
                        rows={4}
                        className="bg-background"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                {form.formState.errors.root && (
                  <p className="text-destructive text-sm">{form.formState.errors.root.message}</p>
                )}
                <Button size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <LoaderIcon className="mr-2 size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
