"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface ContactFormProps {
  initialEmail?: string;
  isEmailReadOnly?: boolean;
}

export default function ContactForm({ initialEmail, isEmailReadOnly }: ContactFormProps) {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: initialEmail ?? "",
    message: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialEmail) {
      setFormState((prev) => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setError(null);

    // Client-side validation matching API requirements
    if (formState.name.trim().length < 2) {
      setError("Please provide your name (at least 2 characters).");
      return;
    }

    if (formState.message.trim().length < 10) {
      setError("Please enter at least 10 characters in your message so we can better assist you.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formState),
        });

        if (!response.ok) {
          let errorMessage = "We couldn't submit your message just yet.";

          try {
            const data = await response.json();
            // Handle Zod validation errors from API
            if (data?.errors?.fieldErrors) {
              if (data.errors.fieldErrors.message?.[0]) {
                errorMessage = data.errors.fieldErrors.message[0];
              } else if (data.errors.fieldErrors.name?.[0]) {
                errorMessage = data.errors.fieldErrors.name[0];
              }
            }
            // Handle other API errors
            if (data?.error) {
              errorMessage = data.error;
            }
          } catch {
            // If JSON parsing fails, use default message
          }

          throw new Error(errorMessage);
        }

        setFeedback("Thanks for reaching out! We'll get back to you shortly.");
        setFormState({ name: "", email: initialEmail ?? "", message: "" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-300">
            Full name
          </label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={formState.name}
            onChange={handleChange("name")}
            required
            className="border-white/10 bg-white/5 !text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={formState.email}
            onChange={handleChange("email")}
            required
            readOnly={!!isEmailReadOnly}
            className="border-white/10 bg-white/5 !text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            disabled={!!isEmailReadOnly}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-300">
          Message
        </label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Tell us what you'd like to achieve with HumanWritePro..."
          value={formState.message}
          onChange={handleChange("message")}
          required
          className="border-white/10 bg-white/5 !text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <p className="text-[12px] text-slate-400">Minimum 10 characters.</p>
      </div>

      {feedback ? (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-400">
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        data-analytics-id="contact-form-submit-button"
        className="w-full justify-center rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-6 py-3 text-lg font-semibold text-white shadow-xl shadow-black/50 shadow-blue-200 transition hover:from-blue-600 hover:via-blue-700 hover:to-blue-800"
      >
        {isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

