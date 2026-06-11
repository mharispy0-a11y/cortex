/**
 * Browser E2E smoke test for the M2 auth + workspace flows.
 * Drives the locally installed Chrome (headless) against the dev server.
 *
 * Covers: login → onboarding → create workspace → dashboard → settings →
 * invite link → second user accepts via the UI → auth-aware landing header
 * → sign out.
 *
 * Run: npm run dev (in another shell), then: npx tsx scripts/e2e-smoke.ts
 */
import { config } from "dotenv";
import { chromium, type Browser, type Page } from "playwright-core";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../lib/database.types";

config({ path: ".env.local" });

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase env in .env.local");
  process.exit(1);
}

const admin = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const results: { name: string; pass: boolean; detail: string }[] = [];

function record(name: string, pass: boolean, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✅ PASS" : "❌ FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function provision(label: string, password: string) {
  const email = `e2e-${label}-${Date.now()}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`provision ${label}: ${error?.message}`);
  return { id: data.user.id, email };
}

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function main() {
  const password = `E2e-pass-${Math.random().toString(36)}!7`;
  const owner = await provision("owner", password);
  const invitee = await provision("invitee", password);

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });

    // ── Owner journey ──────────────────────────────────────────────
    const ownerCtx = await browser.newContext();
    const page = await ownerCtx.newPage();

    await login(page, owner.email, password);
    await page.waitForURL("**/onboarding", { timeout: 15000 });
    record("login with no workspace lands on /onboarding", true);

    await page.getByLabel("Workspace name").fill("E2E Workspace");
    await page.getByRole("button", { name: "Create workspace" }).click();
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    const welcome = page.getByRole("heading", { name: "Welcome to E2E Workspace" });
    await welcome.waitFor({ timeout: 10000 });
    record("create workspace via UI → dashboard shows real name", true);

    await page.getByRole("link", { name: "Settings" }).click();
    await page.waitForURL("**/settings", { timeout: 15000 });
    await page.getByRole("button", { name: "Invite member" }).click();
    await page.getByLabel("Email").fill(invitee.email);
    await page.getByRole("button", { name: "Create invite link" }).click();
    const inviteLink = await page
      .locator("#invite-link")
      .inputValue({ timeout: 10000 });
    record(
      "invite dialog produces a copyable link",
      inviteLink.includes("/invite/"),
      inviteLink
    );

    // Auth-aware marketing header (the bug fix from manual QA)
    await page.goto(`${BASE}/`);
    await page
      .getByRole("link", { name: "Open dashboard" })
      .waitFor({ timeout: 10000 });
    record("landing header shows 'Open dashboard' when signed in", true);

    // ── Invitee journey ────────────────────────────────────────────
    const inviteeCtx = await browser.newContext();
    const page2 = await inviteeCtx.newPage();
    await page2.goto(inviteLink);
    await page2.waitForURL("**/login**", { timeout: 15000 });
    record("invite link while signed out redirects to login", true);

    await page2.getByLabel("Email").fill(invitee.email);
    await page2.getByLabel("Password").fill(password);
    await page2.getByRole("button", { name: "Sign in" }).click();
    await page2.waitForURL("**/invite/**", { timeout: 15000 });
    record("login returns to the invite page via ?next=", true);

    await page2.getByRole("button", { name: "Accept invitation" }).click();
    await page2.waitForURL("**/dashboard", { timeout: 15000 });
    await page2
      .getByRole("heading", { name: "Welcome to E2E Workspace" })
      .waitFor({ timeout: 10000 });
    record("invitee accepts and lands in the shared workspace", true);

    // ── Sign out ───────────────────────────────────────────────────
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole("button", { name: "Open user menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await page.waitForURL("**/login", { timeout: 15000 });
    record("sign out returns to /login", true);

    await ownerCtx.close();
    await inviteeCtx.close();
  } catch (err) {
    record("E2E run", false, err instanceof Error ? err.message : String(err));
  } finally {
    if (browser) await browser.close();
    console.log("\nCleaning up…");
    await admin.from("workspaces").delete().eq("owner_id", owner.id);
    await admin.auth.admin.deleteUser(owner.id);
    await admin.auth.admin.deleteUser(invitee.id);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error("E2E crashed:", err);
  process.exit(1);
});
