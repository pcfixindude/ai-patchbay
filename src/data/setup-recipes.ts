import type { SetupRecipe } from "@/lib/setup/schemas";

const allPlatforms = ["macOS", "Linux", "Windows"] as const;
const unixPlatforms = ["macOS", "Linux"] as const;
const verified = "2026-08-29";

/** Source-backed data only; the setup domain resolves exact IDs, never names. */
export const setupRecipes = [
  {
    id: "recipe-lm-studio-install", kind: "component", componentId: "00000000-0000-4000-8000-000000000013", title: "Install LM Studio",
    sourceIds: ["20000000-0000-4000-8000-000000000014", "20000000-0000-4000-8000-000000000015"], lastVerifiedAt: verified, platforms: [...allPlatforms],
    steps: [
      { id: "download", title: "Download the desktop application", description: "Download the LM Studio desktop application for your operating system from the official download page.", sourceId: "20000000-0000-4000-8000-000000000014", lastVerifiedAt: verified, platforms: [...allPlatforms], validation: "Open LM Studio and confirm that the application starts.", order: 10 },
      { id: "macos-requirements", title: "Check Apple Silicon requirements", description: "Use LM Studio on a supported Apple Silicon Mac with macOS 14 or later. LM Studio does not list Intel Macs as supported; this path deliberately contains no CUDA instruction.", sourceId: "20000000-0000-4000-8000-000000000015", lastVerifiedAt: verified, platforms: ["macOS"], validation: "Confirm the machine and operating-system requirements before downloading a model.", order: 20 },
      { id: "linux-requirements", title: "Check Linux requirements", description: "Use the distribution format and system requirements listed by LM Studio; its documentation identifies AppImage as a Linux distribution option.", sourceId: "20000000-0000-4000-8000-000000000015", lastVerifiedAt: verified, platforms: ["Linux"], validation: "Confirm the downloaded application launches on the target Linux distribution.", order: 20 },
      { id: "windows-requirements", title: "Check Windows requirements", description: "Review LM Studio's documented x64 or ARM Windows requirements before selecting a model; select an accelerator path only when it matches the machine.", sourceId: "20000000-0000-4000-8000-000000000015", lastVerifiedAt: verified, platforms: ["Windows"], validation: "Confirm the installed application starts on the target Windows machine.", order: 20 },
    ],
  },
  {
    id: "recipe-ollama-install", kind: "component", componentId: "00000000-0000-4000-8000-000000000003", title: "Install Ollama",
    sourceIds: ["20000000-0000-4000-8000-000000000016", "20000000-0000-4000-8000-000000000017", "20000000-0000-4000-8000-000000000018"], lastVerifiedAt: verified, platforms: [...allPlatforms],
    steps: [
      { id: "download", title: "Use the official installation path", description: "Install Ollama using the official download path for macOS or Windows, or the official Linux installer.", sourceId: "20000000-0000-4000-8000-000000000016", lastVerifiedAt: verified, platforms: [...allPlatforms], validation: "Run `ollama` to open the interactive menu, or run `ollama -v` to check the installed version.", order: 10 },
      { id: "linux-install", title: "Run the Linux installer", description: "Run Ollama's documented Linux installer.", sourceId: "20000000-0000-4000-8000-000000000017", lastVerifiedAt: verified, platforms: ["Linux"], validation: "Run `ollama -v` after the installer completes.", order: 20, command: { command: "curl -fsSL https://ollama.com/install.sh | sh", verified: true, sourceId: "20000000-0000-4000-8000-000000000017", expectedResult: "The `ollama` command is available." } },
      { id: "macos-hardware", title: "Use the Apple Silicon path", description: "Ollama documents Apple M-series CPU and GPU support. This Apple Silicon path does not require or show CUDA setup.", sourceId: "20000000-0000-4000-8000-000000000018", lastVerifiedAt: verified, platforms: ["macOS"], validation: "Start Ollama and select a model appropriate for available unified memory.", order: 20 },
    ],
  },
  {
    id: "recipe-hermes-install", kind: "component", componentId: "00000000-0000-4000-8000-000000000005", title: "Install Hermes Agent", sourceIds: ["20000000-0000-4000-8000-000000000019"], lastVerifiedAt: verified, platforms: [...allPlatforms],
    steps: [
      { id: "unix-install", title: "Install Hermes Agent", description: "Run the Hermes Agent installer documented for macOS and Linux. Git must be available before using the installer.", sourceId: "20000000-0000-4000-8000-000000000019", lastVerifiedAt: verified, platforms: [...unixPlatforms], validation: "Reload the shell as directed by Hermes, then run `hermes model` to begin provider configuration.", order: 10, command: { command: "curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash", verified: true, sourceId: "20000000-0000-4000-8000-000000000019", expectedResult: "The Hermes CLI is installed and can begin provider setup." } },
      { id: "windows-install", title: "Install Hermes Agent", description: "Run the Hermes Agent installer documented for native Windows PowerShell.", sourceId: "20000000-0000-4000-8000-000000000019", lastVerifiedAt: verified, platforms: ["Windows"], validation: "Run `hermes model` to begin provider configuration.", order: 10, command: { command: "iex (irm https://hermes-agent.nousresearch.com/install.ps1)", verified: true, sourceId: "20000000-0000-4000-8000-000000000019", expectedResult: "The Hermes CLI is installed and can begin provider setup." } },
    ],
  },
  {
    id: "recipe-codex-install", kind: "component", componentId: "00000000-0000-4000-8000-000000000015", title: "Set up Codex", sourceIds: ["20000000-0000-4000-8000-000000000020"], lastVerifiedAt: verified, platforms: [...allPlatforms],
    steps: [{ id: "official-setup", title: "Follow the current Codex setup path", description: "Follow the official Codex documentation for the current installation and sign-in path. This recipe intentionally has no installer command because its cited documentation does not publish one.", sourceId: "20000000-0000-4000-8000-000000000020", lastVerifiedAt: verified, platforms: [...allPlatforms], validation: "Open Codex and confirm its configuration surface is available before adding integrations.", order: 10 }],
  },
  {
    id: "recipe-mcp-boundary", kind: "component", componentId: "00000000-0000-4000-8000-000000000020", title: "Review the MCP client/server boundary", sourceIds: ["20000000-0000-4000-8000-000000000009"], lastVerifiedAt: verified, platforms: [...allPlatforms],
    steps: [{ id: "review-boundary", title: "Identify a specific MCP server", description: "Review the official MCP architecture before choosing a server and its transport. A protocol record is not an installable server, so this recipe does not invent a server command.", sourceId: "20000000-0000-4000-8000-000000000009", lastVerifiedAt: verified, platforms: [...allPlatforms], validation: "Identify the specific MCP server, its publisher, and its least-privilege configuration before enabling it.", order: 10 }],
  },
  {
    id: "recipe-qwen-to-ollama", kind: "edge", edgeId: "30000000-0000-4000-8000-000000000001", title: "Import the exact GGUF artifact into Ollama", sourceIds: ["20000000-0000-4000-8000-000000000001"], lastVerifiedAt: verified, platforms: [...allPlatforms], dependsOn: ["recipe-ollama-install"],
    steps: [{ id: "import", title: "Import the selected GGUF artifact", description: "Follow Ollama's documented GGUF import process using a Modelfile whose FROM value identifies the selected local GGUF artifact. Preserve the artifact's Hugging Face identifier separately from the Ollama model tag used locally.", sourceId: "20000000-0000-4000-8000-000000000001", lastVerifiedAt: verified, platforms: [...allPlatforms], validation: "Run the Ollama model using the local tag selected during import.", order: 10 }],
  },
  {
    id: "recipe-qwen-to-lm-studio", kind: "edge", edgeId: "30000000-0000-4000-8000-000000000003", title: "Load the exact GGUF artifact in LM Studio", sourceIds: ["20000000-0000-4000-8000-000000000005"], lastVerifiedAt: verified, platforms: [...allPlatforms], dependsOn: ["recipe-lm-studio-install"],
    steps: [{ id: "load", title: "Load the selected GGUF artifact", description: "Import or download the selected compatible GGUF artifact in LM Studio, then load it. Keep the artifact's Hugging Face identifier distinct from LM Studio's local model identifier.", sourceId: "20000000-0000-4000-8000-000000000005", lastVerifiedAt: verified, platforms: [...allPlatforms], validation: "Load the model and confirm it is available to the LM Studio local server.", order: 10 }],
  },
  {
    id: "recipe-ollama-to-hermes", kind: "edge", edgeId: "30000000-0000-4000-8000-000000000002", title: "Connect Hermes Agent to Ollama", sourceIds: ["20000000-0000-4000-8000-000000000003", "20000000-0000-4000-8000-000000000002"], lastVerifiedAt: verified, platforms: [...allPlatforms], dependsOn: ["recipe-ollama-install", "recipe-hermes-install"],
    steps: [{ id: "configure-provider", title: "Select Ollama as Hermes's provider", description: "Use Hermes's provider configuration to select Ollama or configure the documented local OpenAI-compatible endpoint. Do not place credentials in this guide; use the Hermes configuration flow for secrets.", sourceId: "20000000-0000-4000-8000-000000000003", lastVerifiedAt: verified, platforms: [...allPlatforms], validation: "Complete provider configuration and confirm Hermes can reach the chosen local model.", order: 10 }],
  },
  {
    id: "recipe-lm-studio-to-hermes", kind: "edge", edgeId: "30000000-0000-4000-8000-000000000004", title: "Connect Hermes Agent to LM Studio", sourceIds: ["20000000-0000-4000-8000-000000000003", "20000000-0000-4000-8000-000000000005"], lastVerifiedAt: verified, platforms: [...allPlatforms], dependsOn: ["recipe-lm-studio-install", "recipe-hermes-install"],
    steps: [{ id: "configure-provider", title: "Select LM Studio as Hermes's provider", description: "Start LM Studio's OpenAI-compatible local server, then use Hermes's provider configuration to select LM Studio or an OpenAI-compatible endpoint. Keep any API key as a secret placeholder, never a literal value in the guide.", sourceId: "20000000-0000-4000-8000-000000000003", lastVerifiedAt: verified, platforms: [...allPlatforms], validation: "Complete provider configuration and confirm Hermes can reach the loaded local model.", order: 10 }],
  },
  {
    id: "recipe-hermes-mcp", kind: "edge", edgeId: "30000000-0000-4000-8000-000000000006", title: "Configure Hermes Agent's specific MCP server", sourceIds: ["20000000-0000-4000-8000-000000000006", "20000000-0000-4000-8000-000000000009"], lastVerifiedAt: verified, platforms: [...allPlatforms], dependsOn: ["recipe-hermes-install", "recipe-mcp-boundary"],
    steps: [{ id: "configure-server", title: "Add the selected MCP server", description: "Configure the selected MCP server's supported transport only after reviewing its publisher, permissions, command or URL, and required secrets. The catalog's protocol node does not identify a server implementation.", sourceId: "20000000-0000-4000-8000-000000000006", lastVerifiedAt: verified, platforms: [...allPlatforms], validation: "Confirm Hermes lists the selected server and that only intended tools are available.", order: 10 }],
  },
  {
    id: "recipe-codex-mcp", kind: "edge", edgeId: "30000000-0000-4000-8000-000000000007", title: "Configure Codex's specific MCP server", sourceIds: ["20000000-0000-4000-8000-000000000007", "20000000-0000-4000-8000-000000000009"], lastVerifiedAt: verified, platforms: [...allPlatforms], dependsOn: ["recipe-codex-install", "recipe-mcp-boundary"],
    steps: [{ id: "configure-server", title: "Add the selected MCP server", description: "Add the selected MCP server using Codex's documented configuration path. Review the server's command or URL, permissions, and any secret placeholders before enabling it.", sourceId: "20000000-0000-4000-8000-000000000007", lastVerifiedAt: verified, platforms: [...allPlatforms], validation: "Confirm Codex can discover the intended tools from the selected MCP server.", order: 10 }],
  },
] as unknown as SetupRecipe[];
