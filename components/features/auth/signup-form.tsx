"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { OAuthButtons } from "@/components/features/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupValues } from "@/lib/validation/auth";
import { signUpWithPassword } from "@/server/actions/auth";

export function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
    mode: "onBlur",
  });

  function onSubmit(values: SignupValues) {
    startTransition(async () => {
      const result = await signUpWithPassword(values);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setSentTo(values.email);
      }
    });
  }

  if (sentTo) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
        <span
          className="mx-auto flex size-12 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300"
          aria-hidden="true"
        >
          <MailCheck className="size-6" />
        </span>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{sentTo}</span>. Click
          it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Free to start. No credit card required.
      </p>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Ada Lovelace"
            aria-invalid={!!form.formState.errors.fullName}
            {...form.register("fullName")}
          />
          {form.formState.errors.fullName && (
            <p role="alert" className="text-xs text-destructive">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p role="alert" className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <p className="text-xs text-muted-foreground">
            At least 8 characters.
          </p>
          {form.formState.errors.password && (
            <p role="alert" className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          Create account
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
      </div>

      <OAuthButtons />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-300 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
