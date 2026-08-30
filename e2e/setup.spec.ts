import { expect, test, type Page } from "@playwright/test";

function setupState(nodes: Array<[string, string]>, connections: Array<[string, string, string, string, string]>) {
  const build = {
    version: 1,
    name: "E2E setup build",
    nodes: nodes.map(([instanceId, componentId], index) => ({ instanceId, componentId, position: { x: index, y: 0 } })),
    connections: connections.map(([id, sourceNodeId, sourcePortId, targetNodeId, targetPortId]) => ({ id, sourceNodeId, sourcePortId, targetNodeId, targetPortId })),
  };
  return Buffer.from(JSON.stringify(build)).toString("base64url");
}

const completeState = setupState(
  [["qwen", "00000000-0000-4000-8000-000000000002"], ["ollama", "00000000-0000-4000-8000-000000000003"]],
  [["qwen-to-ollama", "qwen", "10000000-0000-4000-8000-000000000001", "ollama", "10000000-0000-4000-8000-000000000002"]],
);

const partialState = setupState(
  [["qwen", "00000000-0000-4000-8000-000000000002"], ["ollama", "00000000-0000-4000-8000-000000000003"], ["github", "00000000-0000-4000-8000-000000000023"]],
  [["qwen-to-ollama", "qwen", "10000000-0000-4000-8000-000000000001", "ollama", "10000000-0000-4000-8000-000000000002"]],
);

async function openSetup(page: Page, state: string, platform = "macOS") {
  await page.goto(`/setup?state=${encodeURIComponent(state)}&platform=${platform}`);
}

test("exact build opens a complete source-backed setup guide with persisted progress and copy feedback", async ({ page }) => {
  await page.goto("/build");
  await page.getByRole("button", { name: "Load example chain" }).click();
  await page.getByTitle("Setup this stack").click();
  await expect(page).toHaveURL(/\/setup\?state=/);

  await openSetup(page, completeState);
  await expect(page.getByText("Component: 00000000-0000-4000-8000-000000000003").first()).toBeVisible();
  await expect(page.getByText("Connection: 30000000-0000-4000-8000-000000000001")).toBeVisible();
  await expect(page.getByText(/Coverage: full/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Ollama documentation/i }).first()).toBeVisible();
  await page.getByLabel("Mark step complete").first().check();
  await page.reload();
  await expect(page.getByLabel("Mark step complete").first()).toBeChecked();
  await page.getByRole("button", { name: "Reset setup progress" }).click();
  await expect(page.getByLabel("Mark step complete").first()).not.toBeChecked();

  await openSetup(page, completeState, "Linux");
  await expect(page.getByText("curl -fsSL https://ollama.com/install.sh | sh")).toBeVisible();
  await page.getByRole("button", { name: "Copy command" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await openSetup(page, completeState, "Windows");
  await expect(page.getByText("curl -fsSL https://ollama.com/install.sh | sh")).toHaveCount(0);
});

test("partial setup guide retains verified steps and explicitly reports missing coverage", async ({ page }) => {
  await openSetup(page, partialState);
  await expect(page.getByText("Import the selected GGUF artifact")).toBeVisible();
  await expect(page.getByRole("status")).toContainText(/Missing instructions/);
  await expect(page.getByText("Coverage: partial")).toBeVisible();
});
