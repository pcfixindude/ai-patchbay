-- Deterministic, production-safe V1 seed. Schema changes belong in migrations, never here.
-- A verified compatibility edge is inserted only when a first-party source is linked below.

insert into public.components (
  id, slug, name, short_name, component_type, subtype, parent_component_id, organization_id,
  description, status, visibility, official_website_url, docs_url, github_url, huggingface_url,
  pricing_url, open_source, open_weights, local_capable, cloud_capable, cli_available, gui_available,
  vision_capable, coding_capable, tool_calling_capable, multimodal, operating_systems, tags, last_verified_at
) values
('00000000-0000-4000-8000-000000000001','alibaba-qwen','Alibaba / Qwen','Qwen','organization',null,null,null,'Creator organization for the Qwen model family.','published','public','https://qwen.ai/',null,'https://github.com/QwenLM',null,null,true,null,false,true,null,null,null,null,null,null,'[]','["Qwen","creator"]','2026-08-29'),
('00000000-0000-4000-8000-000000000004','nous-research','Nous Research','Nous Research','organization',null,null,null,'AI research organization and creator of the Hermes model family and Hermes Agent.','published','public','https://nousresearch.com/',null,'https://github.com/NousResearch',null,null,true,null,false,true,null,null,null,null,null,null,'[]','["Hermes","research","creator"]','2026-08-29'),
('00000000-0000-4000-8000-000000000006','openai','OpenAI','OpenAI','organization',null,null,null,'AI research and deployment company; creator of GPT models and Codex.','published','public','https://openai.com/','https://developers.openai.com/','https://github.com/openai',null,null,null,null,false,true,null,null,null,null,null,null,'[]','["GPT","Codex","creator"]','2026-08-29'),
('00000000-0000-4000-8000-000000000007','anthropic','Anthropic','Anthropic','organization',null,null,null,'AI company and creator of the Claude model family and Claude Code.','published','public','https://www.anthropic.com/','https://docs.anthropic.com/',null,null,null,null,null,false,true,null,null,null,null,null,null,'[]','["Claude","creator"]','2026-08-29'),
('00000000-0000-4000-8000-000000000008','google','Google','Google','organization',null,null,null,'Technology company and creator of the Gemini model family and Gemini CLI.','published','public','https://ai.google/','https://ai.google.dev/',null,null,null,null,null,false,true,null,null,null,null,null,null,'[]','["Gemini","creator"]','2026-08-29'),

('00000000-0000-4000-8000-000000000009','hermes-model-family','Hermes model family','Hermes models','model_family',null,'00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','Nous Research''s family of instruction-tuned, tool-capable open-weight language models.','published','public','https://nousresearch.com/',null,'https://github.com/NousResearch','https://huggingface.co/NousResearch',null,true,true,true,true,null,null,null,true,true,null,'["macOS","Linux","Windows"]','["Hermes","model","open weights"]','2026-08-29'),
('00000000-0000-4000-8000-000000000010','qwen-model-family','Qwen model family','Qwen models','model_family',null,'00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','Alibaba''s family of language and multimodal models.','published','public','https://qwen.ai/',null,'https://github.com/QwenLM','https://huggingface.co/Qwen',null,true,true,true,true,null,null,true,true,true,true,'["macOS","Linux","Windows"]','["Qwen","model","open weights"]','2026-08-29'),
('00000000-0000-4000-8000-000000000002','qwen3-coder-gguf','Qwen3-Coder GGUF','Qwen3-Coder','model_variant','GGUF variant','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','A coding-specialized Qwen model represented here as a GGUF model artifact for local runtimes.','published','public','https://qwen.ai/',null,'https://github.com/QwenLM/Qwen3-Coder','https://huggingface.co/Qwen',null,true,true,true,true,null,null,null,true,true,null,'["macOS","Linux","Windows"]','["Qwen","coding","GGUF","local"]','2026-08-29'),
('00000000-0000-4000-8000-000000000011','claude-model-family','Claude model family','Claude','model_family',null,'00000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000007','Anthropic''s family of cloud-hosted language models.','published','public','https://www.anthropic.com/claude','https://docs.anthropic.com/en/docs/about-claude/models',null,null,'https://www.anthropic.com/pricing',null,false,false,true,null,null,true,true,true,true,'[]','["Claude","model","cloud"]','2026-08-29'),
('00000000-0000-4000-8000-000000000012','gemini-model-family','Gemini model family','Gemini','model_family',null,'00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','Google''s family of multimodal AI models.','published','public','https://deepmind.google/models/gemini/','https://ai.google.dev/gemini-api/docs/models',null,null,'https://ai.google.dev/gemini-api/docs/pricing',null,false,false,true,null,null,true,true,true,true,'[]','["Gemini","model","multimodal","cloud"]','2026-08-29'),

('00000000-0000-4000-8000-000000000003','ollama','Ollama','Ollama','runtime',null,null,null,'A local model runtime with a native API and an OpenAI-compatible interface.','published','public','https://ollama.com/','https://docs.ollama.com/','https://github.com/ollama/ollama',null,null,true,null,true,false,true,true,null,null,null,null,'["macOS","Linux","Windows"]','["runtime","local","GGUF","OpenAI-compatible"]','2026-08-29'),
('00000000-0000-4000-8000-000000000013','lm-studio','LM Studio','LM Studio','runtime',null,null,null,'A desktop application for discovering, running, and serving local language models.','published','public','https://lmstudio.ai/','https://lmstudio.ai/docs/','https://github.com/lmstudio-ai',null,null,null,null,true,false,true,true,null,null,null,null,'["macOS","Linux","Windows"]','["runtime","local","GUI","OpenAI-compatible"]','2026-08-29'),
('00000000-0000-4000-8000-000000000014','openrouter','OpenRouter','OpenRouter','gateway',null,null,null,'A cloud gateway providing a unified API across many model providers.','published','public','https://openrouter.ai/','https://openrouter.ai/docs/',null,null,'https://openrouter.ai/models',null,null,false,true,null,null,null,null,null,null,'[]','["gateway","cloud","OpenAI-compatible"]','2026-08-29'),

('00000000-0000-4000-8000-000000000005','hermes-agent','Hermes Agent','Hermes Agent','agent',null,'00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','A self-improving agent by Nous Research. It is a separate product from the Hermes model family.','published','public','https://hermes-agent.nousresearch.com/','https://hermes-agent.nousresearch.com/docs/','https://github.com/NousResearch/hermes-agent',null,null,true,null,true,true,true,true,null,true,true,null,'["macOS","Linux","Windows"]','["Hermes","agent","MCP","CLI"]','2026-08-29'),
('00000000-0000-4000-8000-000000000015','openai-codex','OpenAI Codex','Codex','coding_agent',null,'00000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000006','OpenAI''s coding agent for software engineering work in local repositories and cloud environments.','published','public','https://openai.com/codex/','https://developers.openai.com/codex/','https://github.com/openai/codex',null,null,true,null,true,true,true,true,null,true,true,null,'["macOS","Linux","Windows"]','["coding agent","CLI","OpenAI"]','2026-08-29'),
('00000000-0000-4000-8000-000000000016','claude-code','Claude Code','Claude Code','coding_agent',null,'00000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000007','Anthropic''s agentic coding tool for terminal and IDE workflows.','published','public','https://www.anthropic.com/claude-code','https://docs.anthropic.com/en/docs/claude-code/overview',null,null,'https://www.anthropic.com/pricing',null,null,true,true,true,true,null,true,true,null,'["macOS","Linux","Windows"]','["coding agent","CLI","Claude","MCP"]','2026-08-29'),
('00000000-0000-4000-8000-000000000017','gemini-cli','Gemini CLI','Gemini CLI','coding_agent',null,'00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','Google''s open-source AI agent for the terminal.','published','public','https://github.com/google-gemini/gemini-cli','https://geminicli.com/docs/','https://github.com/google-gemini/gemini-cli',null,null,true,null,true,true,true,false,null,true,true,null,'["macOS","Linux","Windows"]','["coding agent","CLI","Gemini","MCP"]','2026-08-29'),
('00000000-0000-4000-8000-000000000018','opencode','OpenCode','OpenCode','coding_agent',null,null,null,'An open-source coding agent for terminal-based software development workflows.','published','public','https://opencode.ai/','https://opencode.ai/docs/','https://github.com/anomalyco/opencode',null,null,true,null,true,true,true,false,null,true,true,null,'["macOS","Linux","Windows"]','["coding agent","CLI","open source"]','2026-08-29'),
('00000000-0000-4000-8000-000000000019','aider','Aider','Aider','coding_agent',null,null,null,'An open-source AI pair-programming tool for editing code in a local Git repository.','published','public','https://aider.chat/','https://aider.chat/docs/','https://github.com/Aider-AI/aider',null,null,true,null,true,true,true,false,null,true,true,null,'["macOS","Linux","Windows"]','["coding agent","CLI","Git"]','2026-08-29'),

('00000000-0000-4000-8000-000000000020','model-context-protocol','Model Context Protocol','MCP','protocol',null,null,null,'An open protocol for connecting AI applications to tools and data sources.','published','public','https://modelcontextprotocol.io/','https://modelcontextprotocol.io/docs/','https://github.com/modelcontextprotocol',null,null,true,null,true,true,null,null,null,null,true,null,'[]','["MCP","protocol","tools"]','2026-08-29'),
('00000000-0000-4000-8000-000000000021','filesystem-tool','Filesystem tool','Filesystem','tool',null,null,null,'A local tool capability for reading and writing files within an authorized scope.','published','public',null,null,null,null,null,null,null,true,false,null,null,null,null,null,null,'["macOS","Linux","Windows"]','["local","files","tool"]',null),
('00000000-0000-4000-8000-000000000022','shell-tool','Shell tool','Shell','tool',null,null,null,'A tool capability for executing commands within an explicitly authorized environment.','published','public',null,null,null,null,null,null,null,true,false,true,false,null,true,true,null,'["macOS","Linux","Windows"]','["local","shell","tool"]',null),
('00000000-0000-4000-8000-000000000023','github-tool','GitHub tool','GitHub','tool',null,null,null,'Repository, issue, pull request, and code-hosting capabilities exposed through an integration.','published','public','https://github.com/','https://docs.github.com/',null,null,null,null,null,false,true,null,null,null,null,null,null,'[]','["Git","repository","tool"]','2026-08-29');

insert into public.model_metadata (component_id, inherits_from_component_id, modalities, tool_calling, coding_specialization, weight_format, assumptions) values
('00000000-0000-4000-8000-000000000009',null,'["text"]',true,true,null,'Capabilities vary by the specific Hermes release.'),
('00000000-0000-4000-8000-000000000010',null,'["text"]',true,true,null,'Capabilities vary by the specific Qwen release.'),
('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000010','["text"]',true,true,'GGUF','Hardware fit depends on the selected quantization and artifact.'),
('00000000-0000-4000-8000-000000000011',null,'["text"]',true,true,null,'Cloud model limits vary by named model and provider tier.'),
('00000000-0000-4000-8000-000000000012',null,'["text","image"]',true,true,null,'Capabilities vary by the named Gemini model.');

insert into public.ports (id, component_id, name, slug, direction, protocol_type, transport_type, data_type, cardinality, required, description) values
('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','GGUF weights','gguf-out','output','gguf','file','gguf_model','many',false,'GGUF-format model weights.'),
('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003','Model import','model-in','input','gguf','file','gguf_model','many',true,'Imports supported GGUF model artifacts through a Modelfile.'),
('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','OpenAI API','openai-api-out','output','openai_compatible_api','local_http','model_api','many',false,'OpenAI-compatible HTTP API served locally.'),
('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000005','Model API','model-api-in','input','openai_compatible_api','http','model_api','one',true,'OpenAI-compatible or provider-specific model endpoint.'),
('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000013','Model file','model-in','input','gguf','file','gguf_model','many',true,'A supported local model file.'),
('10000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000013','OpenAI API','openai-api-out','output','openai_compatible_api','local_http','model_api','many',false,'OpenAI-compatible local HTTP server.'),
('10000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000014','OpenAI API','openai-api-out','output','openai_compatible_api','https','model_api','many',false,'Cloud model API using an OpenAI-compatible request shape.'),
('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000005','MCP client','mcp-out','output','mcp','stdio_or_http','tool_protocol','many',false,'Connects Hermes Agent to MCP servers.'),
('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000015','Model provider','model-provider-in','input','openai_responses_api','https','model_api','one',true,'A configured model provider supported by Codex.'),
('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000015','MCP client','mcp-out','output','mcp','stdio_or_http','tool_protocol','many',false,'Connects Codex to configured MCP servers.'),
('10000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000016','MCP client','mcp-out','output','mcp','stdio_or_http','tool_protocol','many',false,'Connects Claude Code to configured MCP servers.'),
('10000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000017','MCP client','mcp-out','output','mcp','stdio_or_http','tool_protocol','many',false,'Connects Gemini CLI to configured MCP servers.'),
('10000000-0000-4000-8000-000000000013','00000000-0000-4000-8000-000000000018','Model API','model-api-in','input','openai_compatible_api','http','model_api','one',true,'A configured OpenAI-compatible model endpoint.'),
('10000000-0000-4000-8000-000000000014','00000000-0000-4000-8000-000000000018','MCP client','mcp-out','output','mcp','stdio_or_http','tool_protocol','many',false,'Connects OpenCode to configured MCP servers.'),
('10000000-0000-4000-8000-000000000015','00000000-0000-4000-8000-000000000019','Model API','model-api-in','input','openai_compatible_api','http','model_api','one',true,'A configured model endpoint.'),
('10000000-0000-4000-8000-000000000016','00000000-0000-4000-8000-000000000020','Client session','client-in','input','mcp','stdio_or_http','tool_protocol','many',true,'An MCP client connection.'),
('10000000-0000-4000-8000-000000000017','00000000-0000-4000-8000-000000000020','Server tools','server-out','output','mcp','stdio_or_http','tool_calls','many',false,'Tools made available by an MCP server.'),
('10000000-0000-4000-8000-000000000018','00000000-0000-4000-8000-000000000023','Tool calls','tool-in','input','mcp','stdio_or_http','tool_calls','many',true,'Authorized GitHub operations exposed as tools.'),
('10000000-0000-4000-8000-000000000019','00000000-0000-4000-8000-000000000021','Tool calls','tool-in','input','mcp','stdio','tool_calls','many',true,'Scoped filesystem operations exposed as tools.'),
('10000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000022','Tool calls','tool-in','input','mcp','stdio','tool_calls','many',true,'Scoped shell operations exposed as tools.'),
('10000000-0000-4000-8000-000000000021','00000000-0000-4000-8000-000000000009','Model weights','weights-out','output','transformers','file','transformers_model','many',false,'Published model weights; format varies by release.'),
('10000000-0000-4000-8000-000000000022','00000000-0000-4000-8000-000000000010','Model weights','weights-out','output','transformers','file','transformers_model','many',false,'Published model weights; format varies by release.');

insert into public.sources (id, title, url, source_type, publisher, retrieved_at, notes) values
('20000000-0000-4000-8000-000000000001','Importing a model — Ollama documentation','https://docs.ollama.com/import','official_docs','Ollama','2026-08-29',null),
('20000000-0000-4000-8000-000000000002','OpenAI compatibility — Ollama documentation','https://docs.ollama.com/openai','official_docs','Ollama','2026-08-29',null),
('20000000-0000-4000-8000-000000000003','Hermes Agent FAQ and provider support','https://github.com/NousResearch/hermes-agent/blob/main/website/docs/reference/faq.md','official_repo','Nous Research','2026-08-29',null),
('20000000-0000-4000-8000-000000000004','Importing models — LM Studio documentation','https://lmstudio.ai/docs/app/basics/import-model','official_docs','LM Studio','2026-08-29',null),
('20000000-0000-4000-8000-000000000005','OpenAI compatibility API — LM Studio documentation','https://lmstudio.ai/docs/developer/openai-compat','official_docs','LM Studio','2026-08-29',null),
('20000000-0000-4000-8000-000000000006','Hermes Agent documentation','https://hermes-agent.nousresearch.com/docs/','official_docs','Nous Research','2026-08-29',null),
('20000000-0000-4000-8000-000000000007','Model Context Protocol in Codex','https://developers.openai.com/codex/mcp/','official_docs','OpenAI','2026-08-29',null),
('20000000-0000-4000-8000-000000000008','OpenRouter API reference','https://openrouter.ai/docs/api/reference/overview','official_docs','OpenRouter','2026-08-29',null),
('20000000-0000-4000-8000-000000000009','MCP architecture overview','https://modelcontextprotocol.io/docs/learn/architecture','official_docs','Model Context Protocol','2026-08-29',null),
('20000000-0000-4000-8000-000000000010','Connect Claude Code to tools via MCP','https://docs.anthropic.com/en/docs/claude-code/mcp','official_docs','Anthropic','2026-08-29',null),
('20000000-0000-4000-8000-000000000011','Gemini CLI MCP servers','https://geminicli.com/docs/tools/mcp-server/','official_docs','Google','2026-08-29',null),
('20000000-0000-4000-8000-000000000012','OpenCode documentation','https://opencode.ai/docs/','official_docs','OpenCode','2026-08-29',null),
('20000000-0000-4000-8000-000000000013','Aider documentation','https://aider.chat/docs/','official_docs','Aider','2026-08-29',null);

insert into public.compatibility_edges (
  id, source_port_id, target_port_id, status, compatibility_level, confidence, notes, limitations,
  configuration_required, configuration_notes, last_verified_at
) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','verified_official','compatible',0.960,'Ollama documents importing GGUF model files through a Modelfile.','The GGUF must use an architecture supported by Ollama.',true,'Create a Modelfile with a FROM path, then run ollama create.','2026-08-29'),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004','verified_first_party','compatible',0.960,'Hermes Agent documents local models via Ollama and OpenAI-compatible endpoints.','Agent quality and tool-call reliability depend on the selected model.',true,'Select Ollama as the provider or configure its local base URL.','2026-08-29'),
('30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000005','verified_first_party','compatible',0.900,'LM Studio documents importing compatible local model files.','Hardware fit and architecture support depend on the selected artifact.',true,'Import a compatible GGUF artifact in LM Studio.','2026-08-29'),
('30000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000004','verified_first_party','compatible',0.950,'Hermes Agent lists LM Studio and custom OpenAI-compatible endpoints as supported providers.','A tool-capable model is recommended for agent workflows.',true,'Start LM Studio''s server and configure its base URL in Hermes Agent.','2026-08-29'),
('30000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000004','verified_official','native',0.990,'Hermes Agent lists OpenRouter as a supported provider.',null,true,'Provide an OpenRouter API key and select a model.','2026-08-29'),
('30000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000016','verified_official','native',0.970,'Hermes Agent documentation describes MCP server support.',null,true,'Configure the MCP server transport and command or URL.','2026-08-29'),
('30000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000016','verified_official','native',0.990,'Codex officially supports MCP server integrations.',null,true,'Add the MCP server in Codex configuration or with the Codex CLI.','2026-08-29'),
('30000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000016','verified_official','native',0.990,'Claude Code officially supports MCP server integrations.',null,true,'Add the MCP server through Claude Code configuration.','2026-08-29'),
('30000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000016','verified_official','native',0.990,'Gemini CLI officially supports MCP server integrations.',null,true,'Configure the MCP server in Gemini CLI settings.','2026-08-29'),
('30000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000017','10000000-0000-4000-8000-000000000018','unverified','compatible',0.550,'This record demonstrates the typed MCP tool boundary; a specific server implementation still needs evidence.','No particular GitHub MCP server is asserted by this fixture record.',true,'Choose and verify a specific GitHub MCP server before production use.',null),
('30000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000017','10000000-0000-4000-8000-000000000019','unverified','compatible',0.550,'This is an explicitly unverified demonstration record for an MCP-exposed filesystem tool.','Tool permissions and sandbox boundaries vary by server.',true,'Review and restrict filesystem roots before enabling the tool.',null),
('30000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000017','10000000-0000-4000-8000-000000000020','unverified','compatible',0.550,'This is an explicitly unverified demonstration record for an MCP-exposed shell tool.','Command permissions and sandbox boundaries vary by server.',true,'Review and restrict command execution before enabling the tool.',null);

insert into public.compatibility_edge_sources (compatibility_edge_id, source_id, evidence_notes) values
('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',null),
('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002',null),
('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003',null),
('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000004',null),
('30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000003',null),
('30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000005',null),
('30000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000003',null),
('30000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000008',null),
('30000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000006',null),
('30000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000009',null),
('30000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000007',null),
('30000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000009',null),
('30000000-0000-4000-8000-000000000008','20000000-0000-4000-8000-000000000010',null),
('30000000-0000-4000-8000-000000000008','20000000-0000-4000-8000-000000000009',null),
('30000000-0000-4000-8000-000000000009','20000000-0000-4000-8000-000000000011',null),
('30000000-0000-4000-8000-000000000009','20000000-0000-4000-8000-000000000009',null),
('30000000-0000-4000-8000-000000000010','20000000-0000-4000-8000-000000000009','Protocol evidence only; the concrete GitHub server relationship remains unverified.'),
('30000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000009','Protocol evidence only; the concrete filesystem server relationship remains unverified.'),
('30000000-0000-4000-8000-000000000012','20000000-0000-4000-8000-000000000009','Protocol evidence only; the concrete shell server relationship remains unverified.');

insert into public.component_sources (component_id, source_id, claim_type, notes) values
('00000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001','feature','GGUF import documentation.'),
('00000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000003','provider_support','Official repository documentation.'),
('00000000-0000-4000-8000-000000000013','20000000-0000-4000-8000-000000000005','feature','OpenAI-compatible API documentation.'),
('00000000-0000-4000-8000-000000000014','20000000-0000-4000-8000-000000000008','feature','Official API documentation.'),
('00000000-0000-4000-8000-000000000015','20000000-0000-4000-8000-000000000007','mcp_support','Official Codex documentation.'),
('00000000-0000-4000-8000-000000000016','20000000-0000-4000-8000-000000000010','mcp_support','Official Claude Code documentation.'),
('00000000-0000-4000-8000-000000000017','20000000-0000-4000-8000-000000000011','mcp_support','Official Gemini CLI documentation.'),
('00000000-0000-4000-8000-000000000018','20000000-0000-4000-8000-000000000012','general','Official OpenCode documentation.'),
('00000000-0000-4000-8000-000000000019','20000000-0000-4000-8000-000000000013','general','Official Aider documentation.'),
('00000000-0000-4000-8000-000000000020','20000000-0000-4000-8000-000000000009','architecture','Official MCP architecture documentation.');

-- Explicit, collision-safe links used by the updater. No fuzzy display-name matching is permitted.
insert into public.component_external_refs (component_id, source_system, external_id, external_url, canonical) values
('00000000-0000-4000-8000-000000000003','github','ollama/ollama','https://github.com/ollama/ollama',true),
('00000000-0000-4000-8000-000000000005','github','NousResearch/hermes-agent','https://github.com/NousResearch/hermes-agent',true),
('00000000-0000-4000-8000-000000000018','github','anomalyco/opencode','https://github.com/anomalyco/opencode',true),
('00000000-0000-4000-8000-000000000019','github','Aider-AI/aider','https://github.com/Aider-AI/aider',true),
('00000000-0000-4000-8000-000000000020','github','modelcontextprotocol/modelcontextprotocol','https://github.com/modelcontextprotocol/modelcontextprotocol',true),
('00000000-0000-4000-8000-000000000009','huggingface','NousResearch/Hermes-3-Llama-3.1-8B','https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B',true),
('00000000-0000-4000-8000-000000000002','huggingface','Qwen/Qwen3-Coder-30B-A3B-Instruct','https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct',true),
('00000000-0000-4000-8000-000000000011','openrouter','anthropic/claude-3.5-sonnet','https://openrouter.ai/anthropic/claude-3.5-sonnet',true),
('00000000-0000-4000-8000-000000000012','openrouter','google/gemini-2.5-pro','https://openrouter.ai/google/gemini-2.5-pro',true),
-- Current exact IDs checked against the upstream model APIs on 2026-08-29.
('00000000-0000-4000-8000-000000000010','openrouter','qwen/qwen3-32b','https://openrouter.ai/qwen/qwen3-32b',true);

insert into public.update_sources (id, name, adapter_type, base_url, enabled, configuration) values
('40000000-0000-4000-8000-000000000001','GitHub official repositories','github','https://api.github.com',true,'{"concurrency":2,"timeoutMs":8000}'),
('40000000-0000-4000-8000-000000000002','Hugging Face Hub','huggingface','https://huggingface.co/api',true,'{"concurrency":2,"timeoutMs":8000}'),
('40000000-0000-4000-8000-000000000003','OpenRouter Models','openrouter','https://openrouter.ai/api/v1',true,'{"concurrency":1,"timeoutMs":8000}'),
('40000000-0000-4000-8000-000000000004','Local Ollama','ollama','http://127.0.0.1:11434',false,'{"concurrency":1,"timeoutMs":3000}');
