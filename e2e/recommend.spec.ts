import { expect, test, type Page } from "@playwright/test";

async function openFirstRecommendationInPatchbay(page: Page) {
  const recommendation = page.getByTestId("recommendation-card").first();
  await expect(recommendation).toBeVisible();
  const componentNames = (
    await recommendation.getByTestId("recommendation-chain").innerText()
  )
    .split(" → ")
    .filter(Boolean);
  await recommendation.getByRole("link", { name: "Open in Patchbay" }).click();
  await expect(page).toHaveURL(/\/build\?state=/);
  const loadedComponentNames = await page
    .locator(".patch-node .node-title strong")
    .allTextContents();
  for (const component of componentNames) {
    expect(loadedComponentNames).toContain(component);
  }
}

async function selectNvidiaCudaProfile(page: Page) {
  await page.getByLabel("Profile name").fill("E2E CUDA workstation");
  await page.getByLabel("Operating system").selectOption("Linux");
  await page.getByLabel("Architecture").selectOption("x64");
  await page.getByLabel("Total memory (GB)").fill("64");
  await page.getByLabel("GPU").selectOption("nvidia");
  const vram = page.getByLabel("VRAM (GB)");
  await expect(vram).toBeVisible();
  await vram.fill("24");
  await expect(vram).toHaveValue("24");
  await page.getByLabel("CUDA available").check();
  await page.getByLabel("Require CUDA-supported runtime").check();
}

test("strict CUDA recommendation uses the CUDA-supported fixture route and loads its chain in Patchbay", async ({
  page,
}) => {
  await page.goto("/recommend");
  await selectNvidiaCudaProfile(page);

  const recommendations = page.getByRole("region", { name: "Recommendations" });
  await expect(
    recommendations
      .getByText(/selected runtime matches this hardware profile/i)
      .first(),
  ).toBeVisible();
  await expect(
    recommendations.getByTestId("recommendation-card").first(),
  ).toBeVisible();
  expect(
    (
      await recommendations
        .getByTestId("recommendation-chain")
        .allTextContents()
    ).join(" "),
  ).not.toMatch(/Ollama|LM Studio/);
  await openFirstRecommendationInPatchbay(page);
});

test("CPU-only recommendation excludes CUDA-only routes and loads its chain in Patchbay", async ({
  page,
}) => {
  await page.goto("/recommend");
  await page.getByLabel("Profile name").fill("E2E CPU workstation");
  await page.getByLabel("Operating system").selectOption("Linux");
  await page.getByLabel("Architecture").selectOption("x64");
  await page.getByLabel("Total memory (GB)").fill("64");
  await page.getByLabel("GPU").selectOption("none");

  const recommendations = page.getByRole("region", { name: "Recommendations" });
  await expect(
    recommendations
      .getByText(/selected runtime matches this hardware profile/i)
      .first(),
  ).toBeVisible();
  await expect(
    recommendations.getByTestId("recommendation-card").first(),
  ).toBeVisible();
  expect(
    (
      await recommendations
        .getByTestId("recommendation-chain")
        .allTextContents()
    ).join(" "),
  ).not.toMatch(/vLLM|SGLang/);
  await expect(recommendations.getByText(/Tradeoff:/).first()).toBeVisible();
  await openFirstRecommendationInPatchbay(page);
});

test("no-route state presents structured reasons and explicit relaxations", async ({
  page,
}) => {
  await page.goto("/recommend");
  await selectNvidiaCudaProfile(page);
  await page.getByLabel("Task").selectOption("vision");

  await expect(page.getByTestId("recommendation-card")).toHaveCount(0);
  await expect(page.getByTestId("no-route-reason")).toHaveAttribute(
    "data-reason-codes",
    /strict_cuda_no_viable_route/,
  );
  await expect(
    page.getByRole("button", { name: "Allow lower-trust compatibility" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Allow cloud-capable routes" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove strict CUDA requirement" }),
  ).toBeVisible();
});

test("saved hardware profiles can be created, persisted, edited, and deleted", async ({
  page,
}) => {
  await page.goto("/recommend");
  await page.getByLabel("Profile name").fill("E2E saved profile");
  await page.getByLabel("Operating system").selectOption("Linux");
  await page.getByLabel("Architecture").selectOption("x64");
  await page.getByLabel("GPU").selectOption("none");
  await page.getByLabel("Total memory (GB)").fill("32");
  await page
    .getByRole("button", { name: "Save this hardware profile" })
    .click();
  await page.reload();

  const profileSelect = page.getByLabel("Saved hardware profile");
  await expect(profileSelect).toContainText("E2E saved profile");
  await profileSelect.selectOption({ label: "E2E saved profile" });
  await page.getByLabel("Total memory (GB)").fill("48");
  await page
    .getByRole("button", { name: "Save this hardware profile" })
    .click();
  await page.reload();

  await profileSelect.selectOption({ label: "E2E saved profile" });
  await expect(page.getByLabel("Total memory (GB)")).toHaveValue("48");
  await page
    .getByRole("button", { name: "Delete saved hardware profile" })
    .click();
  await expect(profileSelect).not.toContainText("E2E saved profile");
});
