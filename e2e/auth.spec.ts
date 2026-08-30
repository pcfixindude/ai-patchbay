import { expect, test } from "@playwright/test";
import { authFixtures } from "./auth-fixtures";

async function signIn(page: import("@playwright/test").Page, fixture: { email: string; password: string }, next = "/admin") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(fixture.email); await page.getByLabel("Password").fill(fixture.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("invalid credentials display an error and keep admin protected", async ({ page }) => {
  await signIn(page, { email: "invalid@patchbay.local", password: "not-a-user" });
  await expect(page.getByText("Invalid email or password.", { exact: true })).toBeVisible();
  await page.goto("/admin"); await expect(page.getByRole("heading", { name: "Authentication required" })).toBeVisible();
});

test("editor signs in and sees the authenticated Update Center", async ({ page }) => {
  await signIn(page, authFixtures.editor); await expect(page.getByRole("heading", { name: "Update Center" })).toBeVisible();
  await expect(page.getByText("E2E editor")).toBeVisible();
});

test("admin signs in and normal authenticated users remain denied", async ({ page }) => {
  await signIn(page, authFixtures.admin); await expect(page.getByRole("heading", { name: "Update Center" })).toBeVisible();
  await page.context().clearCookies(); await signIn(page, authFixtures.viewer);
  await expect(page.getByText(/no editor role/i)).toBeVisible();
});

test("logout revokes editor access and preserves protected deep-link redirect", async ({ page }) => {
  await page.goto("/admin/compatibility"); await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fcompatibility/);
  await page.getByLabel("Email").fill(authFixtures.editor.email); await page.getByLabel("Password").fill(authFixtures.editor.password); await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/compatibility/); await page.goto("/admin"); await page.getByRole("button", { name: "Sign out" }).click(); await expect(page).toHaveURL(/\/login/);
  await page.goto("/admin/compatibility"); await expect(page).toHaveURL(/\/login/);
});
