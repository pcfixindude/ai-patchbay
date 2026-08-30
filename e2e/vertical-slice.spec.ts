import { expect, test } from "@playwright/test";

test("explores Hermes as separate model and agent concepts", async ({ page }) => {
  await page.goto("/explore");
  await page.getByLabel("Search component library").fill("Hermes");
  await expect(page.getByRole("button", { name: "Reveal Hermes model family" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reveal Hermes Agent" })).toBeVisible();
});

test("Explore reveals searched hierarchy descendants and only renders visible edges", async ({ page }) => {
  await page.goto("/explore");
  const before = await page.locator(".patch-node").count();
  await page.getByLabel("Search component library").fill("Hermes Agent");
  await page.getByRole("button", { name: "Reveal Hermes Agent" }).click();
  await expect(page.getByRole("button", { name: "Collapse Nous Research" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Hermes Agent, agent", exact: true })).toBeVisible();
  expect(await page.locator(".patch-node").count()).toBeGreaterThan(before);
});

test("route planner exposes persistent trust and deprecation controls", async ({ page }) => {
  await page.goto("/explore");
  const planner = page.getByRole("region", { name: "Route planner" });
  await expect(planner.getByLabel("Verified only")).toBeChecked();
  await expect(planner.getByLabel("Avoid deprecated")).toBeChecked();
  await planner.getByLabel("Allow inferred/unverified").check();
  await expect(planner.getByLabel("Allow inferred/unverified")).toBeChecked();
  await expect(planner.getByText("Highest confidence").first()).toBeVisible();
  await expect(planner.getByText(/Official\/first-party:.*Community:.*Inferred:.*Unverified:.*Stale:.*Deprecated:.*Weakest:/).first()).toBeVisible();
});

test("loads, inspects, saves, and restores a sourced example build", async ({ page }) => {
  await page.goto("/build");
  await page.getByRole("button", { name: "Load example chain" }).click();
  await expect(page.locator(".patch-node")).toHaveCount(5);
  await expect(page.locator(".patch-node").filter({ hasText: "Qwen3-Coder" })).toBeVisible();
  await page.getByTitle("Save locally").click();
  await expect(page.getByText("Build saved on this device.")).toBeVisible();
  await page.getByTitle("Clear canvas").click();
  await expect(page.locator(".patch-node")).toHaveCount(0);
  await page.getByTitle("Restore saved build").click();
  await expect(page.locator(".patch-node")).toHaveCount(5);
  await page.locator(".patch-node").filter({ hasText: "Hermes Agent" }).dblclick();
  await expect(page.getByRole("complementary", { name: "Hermes Agent details" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Documentation", exact: true })).toHaveAttribute("href", /hermes-agent/);
  await page.getByLabel("Close details").click();
  await page.locator(".react-flow__edge").first().click({ force: true });
  await expect(page.getByRole("complementary", { name: "Cable details" })).toBeVisible();
  await expect(page.getByText("Supporting evidence")).toBeVisible();
});

test("accepts a verified typed connection and rejects an incompatible drop with an explanation", async ({ page }) => {
  await page.goto("/build");
  await page.getByRole("button", { name: "Add Ollama" }).click();
  await page.getByRole("button", { name: "Add Hermes Agent" }).click();
  await page.getByLabel("Ollama OpenAI API output").dragTo(page.getByLabel("Hermes Agent Model API input"));
  await expect(page.locator(".react-flow__edge")).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText(/verified/i);

  await page.reload();
  await page.getByRole("button", { name: "Add Qwen3-Coder GGUF" }).click();
  await page.getByRole("button", { name: "Add Hermes Agent" }).click();
  await page.getByLabel("Qwen3-Coder GGUF GGUF weights output").dragTo(page.getByLabel("Hermes Agent Model API input"));
  await expect(page.locator(".react-flow__edge")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText(/model weights need a compatible runtime/i);
});

test("loads a canonical component detail page from Supabase", async ({ page }) => {
  await page.goto("/component/qwen3-coder-gguf");
  await expect(page.getByRole("heading", { name: "Qwen3-Coder GGUF" })).toBeVisible();
  await expect(page.getByText("Model metadata")).toBeVisible();
  await expect(page.getByText("Compatibility")).toBeVisible();
  await expect(page.getByText("Evidence")).toBeVisible();
});

test("unauthorized admin route exposes no edit controls", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Authentication required" })).toBeVisible();
  await expect(page.getByRole("button", { name: /save|publish|delete/i })).toHaveCount(0);
  await expect(page.getByTestId("data-source")).toHaveText(/Local Supabase/);
});
