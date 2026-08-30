-- Milestone 5 curated catalog. This is intentionally a reviewable, bounded seed—not an API scrape.
-- Every added record receives a first-party resource link below. Unknown specifications remain null.

insert into public.sources(title,url,source_type,publisher,retrieved_at)
values ('llama.cpp backends and build documentation','https://github.com/ggml-org/llama.cpp','official_repo','llama.cpp','2026-08-29') on conflict (url) do nothing;

insert into public.components (slug,name,short_name,component_type,description,status,visibility,official_website_url,docs_url,github_url,huggingface_url,open_source,open_weights,local_capable,cloud_capable,cli_available,gui_available,vision_capable,coding_capable,tool_calling_capable,multimodal,operating_systems,tags,last_verified_at) values
('meta','Meta','Meta','organization','AI company and creator of the Llama model family.','published','public','https://ai.meta.com/',null,'https://github.com/meta-llama',null,null,null,false,true,null,null,null,null,null,false,'[]','["Llama","creator"]','2026-08-29'),
('deepseek','DeepSeek','DeepSeek','organization','AI research organization behind the DeepSeek model family.','published','public','https://www.deepseek.com/',null,'https://github.com/deepseek-ai','https://huggingface.co/deepseek-ai',true,null,false,true,null,null,null,null,null,false,'[]','["DeepSeek","creator"]','2026-08-29'),
('moonshot-ai','Moonshot AI','Moonshot','organization','AI company behind the Kimi model family.','published','public','https://www.moonshot.ai/',null,null,null,null,null,false,true,null,null,null,null,null,false,'[]','["Kimi","creator"]','2026-08-29'),
('mistral-ai','Mistral AI','Mistral','organization','AI company behind Mistral, Mixtral, and Codestral models.','published','public','https://mistral.ai/','https://docs.mistral.ai/','https://github.com/mistralai','https://huggingface.co/mistralai',true,null,false,true,null,null,null,null,null,false,'[]','["Mistral","creator"]','2026-08-29'),
('z-ai','Z.ai','Z.ai','organization','AI company behind the GLM model family.','published','public','https://z.ai/',null,null,null,null,null,false,true,null,null,null,null,null,false,'[]','["GLM","creator"]','2026-08-29'),
('xai','xAI','xAI','organization','AI company behind the Grok model family.','published','public','https://x.ai/',null,null,null,null,null,false,true,null,null,null,null,null,false,'[]','["Grok","creator"]','2026-08-29'),
('microsoft','Microsoft','Microsoft','organization','Technology company behind Phi models and Azure AI services.','published','public','https://www.microsoft.com/en-us/','https://learn.microsoft.com/','https://github.com/microsoft',null,null,null,false,true,null,null,null,null,null,false,'[]','["Phi","creator"]','2026-08-29'),
('nvidia','NVIDIA','NVIDIA','organization','Computing company behind Nemotron models and AI infrastructure.','published','public','https://www.nvidia.com/en-us/ai/','https://docs.nvidia.com/','https://github.com/NVIDIA','https://huggingface.co/nvidia',true,null,false,true,null,null,null,null,null,false,'[]','["Nemotron","creator"]','2026-08-29'),
('cohere','Cohere','Cohere','organization','AI company behind the Command model family.','published','public','https://cohere.com/','https://docs.cohere.com/',null,null,null,null,false,true,null,null,null,null,null,false,'[]','["Command","creator"]','2026-08-29'),
('minimax','MiniMax','MiniMax','organization','AI company behind the MiniMax model family.','published','public','https://www.minimaxi.com/',null,null,null,null,null,false,true,null,null,null,null,null,false,'[]','["MiniMax","creator"]','2026-08-29'),
('ibm','IBM','IBM','organization','Technology company behind Granite models and watsonx.','published','public','https://www.ibm.com/','https://www.ibm.com/watsonx','https://github.com/ibm-granite','https://huggingface.co/ibm-granite',true,null,false,true,null,null,null,null,null,false,'[]','["Granite","creator"]','2026-08-29'),
('hugging-face','Hugging Face','Hugging Face','organization','Organization behind the Hugging Face Hub, Transformers, and Inference Providers.','published','public','https://huggingface.co/','https://huggingface.co/docs','https://github.com/huggingface',null,true,null,false,true,null,null,null,null,null,false,'[]','["Hub","Transformers","creator"]','2026-08-29'),
('gpt-model-family','GPT model family','GPT','model_family','OpenAI general-purpose and coding model family.','published','public','https://platform.openai.com/docs/models','https://platform.openai.com/docs/models',null,null,null,null,false,true,null,null,true,true,true,true,'[]','["GPT","cloud","reasoning","coding"]','2026-08-29'),
('gpt-oss','gpt-oss','gpt-oss','model_family','OpenAI open-weight model family.','published','public','https://openai.com/open-models/','https://platform.openai.com/docs/models',null,'https://huggingface.co/openai',true,true,true,false,null,null,null,true,true,false,'["macOS","Linux","Windows"]','["GPT","open weights","local"]','2026-08-29'),
('gemma-model-family','Gemma model family','Gemma','model_family','Google open model family derived from Gemini research.','published','public','https://ai.google.dev/gemma','https://ai.google.dev/gemma/docs',null,'https://huggingface.co/google',true,true,true,true,null,null,true,true,null,true,'["macOS","Linux","Windows"]','["Gemma","open weights","local"]','2026-08-29'),
('qwen-coder','Qwen Coder','Qwen Coder','model_family','Coding-focused Qwen model family.','published','public','https://qwen.ai/','https://github.com/QwenLM/Qwen3-Coder','https://github.com/QwenLM/Qwen3-Coder','https://huggingface.co/Qwen',true,true,true,true,null,null,null,true,true,false,'["macOS","Linux","Windows"]','["Qwen","coding","open weights"]','2026-08-29'),
('qwen-vl','Qwen vision-language','Qwen VL','model_family','Vision-language branch of the Qwen model family.','published','public','https://qwen.ai/','https://github.com/QwenLM','https://github.com/QwenLM','https://huggingface.co/Qwen',true,true,true,true,null,null,true,null,true,true,'["macOS","Linux","Windows"]','["Qwen","vision","multimodal"]','2026-08-29'),
('deepseek-model-family','DeepSeek model family','DeepSeek','model_family','DeepSeek general, reasoning, and coding model family.','published','public','https://www.deepseek.com/','https://github.com/deepseek-ai','https://github.com/deepseek-ai','https://huggingface.co/deepseek-ai',true,true,true,true,null,null,null,true,null,false,'["macOS","Linux","Windows"]','["DeepSeek","reasoning","coding"]','2026-08-29'),
('kimi-model-family','Kimi model family','Kimi','model_family','Moonshot AI Kimi model family.','published','public','https://www.kimi.com/',null,null,null,null,null,false,true,null,null,null,true,null,false,'[]','["Kimi","cloud"]','2026-08-29'),
('llama-model-family','Llama model family','Llama','model_family','Meta open-weight Llama model family.','published','public','https://www.llama.com/','https://www.llama.com/docs/','https://github.com/meta-llama','https://huggingface.co/meta-llama',true,true,true,true,null,null,true,true,true,true,'["macOS","Linux","Windows"]','["Llama","open weights","local"]','2026-08-29'),
('mistral-model-family','Mistral model family','Mistral','model_family','Mistral AI general model family.','published','public','https://mistral.ai/','https://docs.mistral.ai/','https://github.com/mistralai','https://huggingface.co/mistralai',true,null,true,true,null,null,null,true,true,false,'["macOS","Linux","Windows"]','["Mistral","coding","local"]','2026-08-29'),
('mixtral-model-family','Mixtral model family','Mixtral','model_family','Mistral AI mixture-of-experts model family.','published','public','https://mistral.ai/','https://docs.mistral.ai/',null,'https://huggingface.co/mistralai',true,true,true,true,null,null,null,null,null,false,'["macOS","Linux","Windows"]','["Mixtral","MoE","open weights"]','2026-08-29'),
('codestral-model-family','Codestral model family','Codestral','model_family','Mistral AI coding model family.','published','public','https://mistral.ai/','https://docs.mistral.ai/',null,null,null,null,false,true,null,null,null,true,null,false,'[]','["Codestral","coding"]','2026-08-29'),
('glm-model-family','GLM model family','GLM','model_family','Z.ai GLM model family.','published','public','https://z.ai/',null,null,null,null,null,false,true,null,null,null,true,null,false,'[]','["GLM","coding"]','2026-08-29'),
('grok-model-family','Grok model family','Grok','model_family','xAI Grok model family.','published','public','https://x.ai/',null,null,null,null,null,false,true,null,null,null,true,null,false,'[]','["Grok","cloud"]','2026-08-29'),
('phi-model-family','Phi model family','Phi','model_family','Microsoft Phi small language model family.','published','public','https://www.microsoft.com/en-us/research/','https://azure.microsoft.com/en-us/products/phi',null,'https://huggingface.co/microsoft',true,true,true,true,null,null,null,true,null,false,'["macOS","Linux","Windows"]','["Phi","small model","open weights"]','2026-08-29'),
('nemotron-model-family','Nemotron model family','Nemotron','model_family','NVIDIA Nemotron model family.','published','public','https://www.nvidia.com/en-us/ai/','https://build.nvidia.com/',null,'https://huggingface.co/nvidia',true,null,true,true,null,null,null,true,null,false,'["Linux","Windows"]','["Nemotron","NVIDIA","reasoning"]','2026-08-29'),
('command-model-family','Command model family','Command','model_family','Cohere Command model family.','published','public','https://cohere.com/','https://docs.cohere.com/',null,null,null,null,false,true,null,null,null,true,null,false,'[]','["Command","cloud"]','2026-08-29'),
('granite-model-family','Granite model family','Granite','model_family','IBM Granite model family.','published','public','https://www.ibm.com/granite','https://www.ibm.com/granite/docs','https://github.com/ibm-granite','https://huggingface.co/ibm-granite',true,true,true,true,null,null,null,true,null,false,'["macOS","Linux","Windows"]','["Granite","open weights"]','2026-08-29'),
('minimax-model-family','MiniMax model family','MiniMax','model_family','MiniMax model family.','published','public','https://www.minimaxi.com/',null,null,null,null,null,false,true,null,null,null,true,null,false,'[]','["MiniMax","cloud"]','2026-08-29') on conflict (slug) do nothing;

insert into public.components (slug,name,short_name,component_type,description,status,visibility,official_website_url,docs_url,huggingface_url,open_source,open_weights,local_capable,cloud_capable,vision_capable,coding_capable,tool_calling_capable,multimodal,operating_systems,tags,last_verified_at) values
('gpt-oss-20b','gpt-oss-20b','gpt-oss 20B','model','OpenAI open-weight gpt-oss model variant.','published','public','https://openai.com/open-models/','https://platform.openai.com/docs/models','https://huggingface.co/openai',true,true,true,false,null,true,true,false,'["macOS","Linux","Windows"]','["GPT","open weights","coding"]','2026-08-29'),
('gpt-oss-120b','gpt-oss-120b','gpt-oss 120B','model','OpenAI open-weight gpt-oss model variant.','published','public','https://openai.com/open-models/','https://platform.openai.com/docs/models','https://huggingface.co/openai',true,true,true,false,null,true,true,false,'["Linux","Windows"]','["GPT","open weights","coding"]','2026-08-29'),
('claude-sonnet','Claude Sonnet','Claude Sonnet','model','Current Claude Sonnet tier.','published','public','https://www.anthropic.com/claude','https://docs.anthropic.com/en/docs/about-claude/models',null,null,null,false,true,true,true,true,true,'[]','["Claude","cloud","coding"]','2026-08-29'),
('claude-opus','Claude Opus','Claude Opus','model','Current Claude Opus tier.','published','public','https://www.anthropic.com/claude','https://docs.anthropic.com/en/docs/about-claude/models',null,null,null,false,true,true,true,true,true,'[]','["Claude","cloud","reasoning"]','2026-08-29'),
('gemini-flash','Gemini Flash','Gemini Flash','model','Current Gemini Flash tier.','published','public','https://ai.google.dev/','https://ai.google.dev/gemini-api/docs/models',null,null,null,false,true,true,true,true,true,'[]','["Gemini","cloud","multimodal"]','2026-08-29'),
('gemini-pro','Gemini Pro','Gemini Pro','model','Current Gemini Pro tier.','published','public','https://ai.google.dev/','https://ai.google.dev/gemini-api/docs/models',null,null,null,false,true,true,true,true,true,'[]','["Gemini","cloud","reasoning","multimodal"]','2026-08-29'),
('qwen3-coder','Qwen3-Coder','Qwen3-Coder','model','Qwen coding model variant family representative.','published','public','https://qwen.ai/','https://github.com/QwenLM/Qwen3-Coder','https://huggingface.co/Qwen',true,true,true,true,null,true,true,false,'["macOS","Linux","Windows"]','["Qwen","coding","open weights"]','2026-08-29'),
('qwen-vl-max','Qwen VL','Qwen VL','model','Qwen vision-language model representative.','published','public','https://qwen.ai/','https://github.com/QwenLM','https://huggingface.co/Qwen',true,true,true,true,true,null,true,true,'["macOS","Linux","Windows"]','["Qwen","vision","multimodal"]','2026-08-29'),
('deepseek-r1','DeepSeek R1','DeepSeek R1','model','DeepSeek reasoning model representative.','published','public','https://www.deepseek.com/','https://github.com/deepseek-ai','https://huggingface.co/deepseek-ai',true,true,true,true,null,true,null,false,'["macOS","Linux","Windows"]','["DeepSeek","reasoning"]','2026-08-29'),
('kimi-k2','Kimi K2','Kimi K2','model','Moonshot AI Kimi model representative.','published','public','https://www.kimi.com/',null,null,null,null,false,true,null,true,null,false,'[]','["Kimi","cloud"]','2026-08-29'),
('llama-4','Llama 4','Llama 4','model','Meta Llama model representative.','published','public','https://www.llama.com/','https://www.llama.com/docs/','https://huggingface.co/meta-llama',true,true,true,true,true,true,true,true,'["macOS","Linux","Windows"]','["Llama","open weights","multimodal"]','2026-08-29'),
('mistral-large','Mistral Large','Mistral Large','model','Mistral AI general model representative.','published','public','https://mistral.ai/','https://docs.mistral.ai/',null,null,null,false,true,null,true,true,false,'[]','["Mistral","cloud"]','2026-08-29'),
('codestral','Codestral','Codestral','model','Mistral AI coding model representative.','published','public','https://mistral.ai/','https://docs.mistral.ai/',null,null,null,false,true,null,null,true,false,'[]','["Codestral","coding"]','2026-08-29'),
('glm-4','GLM-4','GLM-4','model','Z.ai GLM model representative.','published','public','https://z.ai/',null,null,null,null,false,true,null,null,true,false,'[]','["GLM","coding"]','2026-08-29'),
('phi-4','Phi-4','Phi-4','model','Microsoft Phi model representative.','published','public','https://www.microsoft.com/en-us/research/','https://azure.microsoft.com/en-us/products/phi','https://huggingface.co/microsoft',true,true,true,true,null,true,null,false,'["macOS","Linux","Windows"]','["Phi","open weights"]','2026-08-29'),
('nemotron-nano','Nemotron Nano','Nemotron Nano','model','NVIDIA Nemotron model representative.','published','public','https://www.nvidia.com/en-us/ai/','https://build.nvidia.com/','https://huggingface.co/nvidia',true,null,true,true,null,true,null,false,'["Linux","Windows"]','["Nemotron","reasoning"]','2026-08-29'),
('command-a','Command A','Command A','model','Cohere Command model representative.','published','public','https://cohere.com/','https://docs.cohere.com/',null,null,null,false,true,null,null,true,false,'[]','["Command","cloud"]','2026-08-29'),
('granite-4','Granite 4','Granite 4','model','IBM Granite model representative.','published','public','https://www.ibm.com/granite','https://www.ibm.com/granite/docs','https://huggingface.co/ibm-granite',true,true,true,true,null,true,null,false,'["macOS","Linux","Windows"]','["Granite","open weights"]','2026-08-29') on conflict (slug) do nothing;

insert into public.components (slug,name,short_name,component_type,description,status,visibility,official_website_url,docs_url,github_url,open_source,local_capable,cloud_capable,cli_available,gui_available,operating_systems,tags,last_verified_at) values
('llama-cpp','llama.cpp','llama.cpp','runtime','Open-source local inference runtime for GGUF models.','published','public','https://github.com/ggml-org/llama.cpp','https://github.com/ggml-org/llama.cpp','https://github.com/ggml-org/llama.cpp',true,true,false,true,false,'["macOS","Linux","Windows"]','["runtime","local","GGUF","Apple Silicon","CUDA","CPU"]','2026-08-29'),
('mlx-lm','MLX LM','MLX LM','runtime','Apple Silicon-focused library and CLI for running language models with MLX.','published','public','https://github.com/ml-explore/mlx-lm','https://ml-explore.github.io/mlx/build/html/index.html','https://github.com/ml-explore/mlx-lm',true,true,false,true,false,'["macOS"]','["runtime","local","MLX","Apple Silicon"]','2026-08-29'),
('vllm','vLLM','vLLM','runtime','Open-source inference and serving engine.','published','public','https://vllm.ai/','https://docs.vllm.ai/','https://github.com/vllm-project/vllm',true,true,false,true,false,'["Linux"]','["runtime","server","CUDA"]','2026-08-29'),
('sglang','SGLang','SGLang','runtime','Open-source serving framework for language and multimodal models.','published','public','https://sgl-project.github.io/','https://docs.sglang.ai/','https://github.com/sgl-project/sglang',true,true,false,true,false,'["Linux"]','["runtime","server","CUDA"]','2026-08-29'),
('localai','LocalAI','LocalAI','runtime','Open-source local AI runtime with API compatibility surfaces.','published','public','https://localai.io/','https://localai.io/features/','https://github.com/mudler/LocalAI',true,true,false,true,false,'["macOS","Linux","Windows"]','["runtime","local","API"]','2026-08-29'),
('jan','Jan','Jan','runtime','Open-source desktop application for local and remote models.','published','public','https://jan.ai/','https://jan.ai/docs','https://github.com/menloresearch/jan',true,true,true,false,true,'["macOS","Linux","Windows"]','["runtime","local","GUI"]','2026-08-29'),
('gpt4all','GPT4All','GPT4All','runtime','Open-source local model desktop and API runtime.','published','public','https://www.nomic.ai/gpt4all','https://docs.gpt4all.io/','https://github.com/nomic-ai/gpt4all',true,true,false,false,true,'["macOS","Linux","Windows"]','["runtime","local","GUI"]','2026-08-29'),
('text-generation-webui','text-generation-webui','text-gen UI','runtime','Open-source local text generation web interface.','published','public','https://github.com/oobabooga/text-generation-webui','https://github.com/oobabooga/text-generation-webui','https://github.com/oobabooga/text-generation-webui',true,true,false,false,true,'["macOS","Linux","Windows"]','["runtime","local","GUI"]','2026-08-29'),
('koboldcpp','KoboldCpp','KoboldCpp','runtime','Local inference runtime built around llama.cpp.','published','public','https://github.com/LostRuins/koboldcpp','https://github.com/LostRuins/koboldcpp','https://github.com/LostRuins/koboldcpp',true,true,false,false,true,'["macOS","Linux","Windows"]','["runtime","local","GGUF"]','2026-08-29'),
('exllamav2','ExLlamaV2','ExLlama','runtime','Local inference library for EXL2 models.','published','public','https://github.com/turboderp-org/exllamav2','https://github.com/turboderp-org/exllamav2','https://github.com/turboderp-org/exllamav2',true,true,false,false,false,'["Linux","Windows"]','["runtime","local","EXL2"]','2026-08-29'),
('transformers','Transformers','Transformers','sdk','Hugging Face library for model inference and training.','published','public','https://huggingface.co/docs/transformers','https://huggingface.co/docs/transformers','https://github.com/huggingface/transformers',true,true,true,false,false,'["macOS","Linux","Windows"]','["SDK","local","models"]','2026-08-29') on conflict (slug) do nothing;

insert into public.components (slug,name,short_name,component_type,description,status,visibility,official_website_url,docs_url,github_url,cloud_capable,cli_available,gui_available,tags,last_verified_at) values
('litellm','LiteLLM','LiteLLM','gateway','Open-source gateway and SDK for provider APIs.','published','public','https://www.litellm.ai/','https://docs.litellm.ai/','https://github.com/BerriAI/litellm',true,true,false,'["gateway","OpenAI-compatible"]','2026-08-29'),
('together-ai','Together AI','Together','inference_provider','Hosted inference provider.','published','public','https://www.together.ai/','https://docs.together.ai/',null,true,false,false,'["provider","cloud"]','2026-08-29'),
('fireworks-ai','Fireworks AI','Fireworks','inference_provider','Hosted inference provider.','published','public','https://fireworks.ai/','https://docs.fireworks.ai/',null,true,false,false,'["provider","cloud"]','2026-08-29'),
('groq','Groq','Groq','inference_provider','Hosted inference provider.','published','public','https://groq.com/','https://console.groq.com/docs',null,true,false,false,'["provider","cloud"]','2026-08-29'),
('cerebras','Cerebras','Cerebras','inference_provider','Hosted inference provider.','published','public','https://www.cerebras.ai/','https://inference-docs.cerebras.ai/',null,true,false,false,'["provider","cloud"]','2026-08-29'),
('hugging-face-inference-providers','Hugging Face Inference Providers','HF Providers','inference_provider','Hugging Face service for routed model inference providers.','published','public','https://huggingface.co/inference-api','https://huggingface.co/docs/inference-providers',null,true,false,false,'["provider","cloud","Hugging Face"]','2026-08-29'),
('aws-bedrock','AWS Bedrock','Bedrock','hosting_platform','AWS managed foundation-model platform.','published','public','https://aws.amazon.com/bedrock/','https://docs.aws.amazon.com/bedrock/',null,true,false,false,'["cloud","platform"]','2026-08-29'),
('azure-ai-foundry','Azure AI Foundry','Azure AI','hosting_platform','Microsoft managed AI platform.','published','public','https://azure.microsoft.com/en-us/products/ai-foundry','https://learn.microsoft.com/azure/ai-foundry/',null,true,false,false,'["cloud","platform"]','2026-08-29'),
('google-vertex-ai','Google Vertex AI','Vertex AI','hosting_platform','Google Cloud AI platform and model garden.','published','public','https://cloud.google.com/vertex-ai','https://cloud.google.com/vertex-ai/docs',null,true,false,false,'["cloud","platform"]','2026-08-29'),
('replicate','Replicate','Replicate','inference_provider','Hosted model inference provider.','published','public','https://replicate.com/','https://replicate.com/docs',null,true,false,false,'["provider","cloud"]','2026-08-29'),
('baseten','Baseten','Baseten','inference_provider','Hosted model inference and deployment platform.','published','public','https://www.baseten.co/','https://docs.baseten.co/',null,true,false,false,'["provider","cloud"]','2026-08-29'),
('portkey','Portkey','Portkey','gateway','AI gateway and observability platform.','published','public','https://portkey.ai/','https://portkey.ai/docs',null,true,false,false,'["gateway","cloud"]','2026-08-29') on conflict (slug) do nothing;

insert into public.components (slug,name,short_name,component_type,description,status,visibility,official_website_url,docs_url,github_url,open_source,local_capable,cloud_capable,cli_available,gui_available,coding_capable,tool_calling_capable,operating_systems,tags,last_verified_at) values
('cline','Cline','Cline','coding_agent','Open-source coding agent for developer workflows.','published','public','https://cline.bot/','https://docs.cline.bot/','https://github.com/cline/cline',true,true,true,false,true,true,true,'["macOS","Linux","Windows"]','["coding agent","IDE"]','2026-08-29'),
('roo-code','Roo Code','Roo','coding_agent','Open-source coding agent extension.','published','public','https://roocode.com/','https://docs.roocode.com/','https://github.com/RooCodeInc/Roo-Code',true,true,true,false,true,true,true,'["macOS","Linux","Windows"]','["coding agent","IDE"]','2026-08-29'),
('kilo-code','Kilo Code','Kilo','coding_agent','Coding agent extension.','published','public','https://kilo.ai/','https://kilo.ai/docs',null,true,true,true,false,true,true,true,'["macOS","Linux","Windows"]','["coding agent","IDE"]','2026-08-29'),
('block-goose','Goose','Goose','agent','Open-source agent for local developer workflows.','published','public','https://block.github.io/goose/','https://block.github.io/goose/docs/','https://github.com/block/goose',true,true,true,true,false,true,true,'["macOS","Linux","Windows"]','["agent","CLI","local"]','2026-08-29'),
('cursor','Cursor','Cursor','ide','AI-native code editor.','published','public','https://cursor.com/','https://docs.cursor.com/',null,false,true,true,false,true,true,true,'["macOS","Linux","Windows"]','["IDE","coding agent"]','2026-08-29'),
('windsurf','Windsurf','Windsurf','ide','AI coding environment.','published','public','https://windsurf.com/','https://docs.windsurf.com/',null,false,true,true,false,true,true,true,'["macOS","Linux","Windows"]','["IDE","coding agent"]','2026-08-29'),
('warp','Warp','Warp','interface','Developer terminal with agentic tooling.','published','public','https://www.warp.dev/','https://docs.warp.dev/',null,false,true,true,true,false,true,true,'["macOS","Linux","Windows"]','["terminal","agent"]','2026-08-29'),
('replit-agent','Replit Agent','Replit','agent','Cloud agent for application development.','published','public','https://replit.com/ai','https://docs.replit.com/',null,false,false,true,false,true,true,true,'[]','["agent","cloud"]','2026-08-29'),
('devin','Devin','Devin','agent','Cloud software engineering agent.','published','public','https://devin.ai/',null,null,false,false,true,false,true,true,true,'[]','["agent","cloud","coding"]','2026-08-29'),
('continue','Continue','Continue','coding_agent','Open-source coding assistant and agent platform.','published','public','https://www.continue.dev/','https://docs.continue.dev/','https://github.com/continuedev/continue',true,true,true,false,true,true,true,'["macOS","Linux","Windows"]','["coding agent","IDE","local"]','2026-08-29'),
('github-copilot-cli','GitHub Copilot CLI','Copilot CLI','coding_agent','GitHub command-line coding agent.','published','public','https://github.com/features/copilot','https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli',null,false,true,true,true,false,true,true,'["macOS","Linux","Windows"]','["coding agent","CLI","MCP"]','2026-08-29') on conflict (slug) do nothing;

insert into public.components (slug,name,short_name,component_type,description,status,visibility,official_website_url,docs_url,github_url,open_source,local_capable,cloud_capable,tags,last_verified_at) values
('openai-agents-sdk','OpenAI Agents SDK','Agents SDK','sdk','OpenAI toolkit for building agentic applications.','published','public','https://openai.github.io/openai-agents-js/','https://openai.github.io/openai-agents-js/','https://github.com/openai/openai-agents-js',true,true,true,'["SDK","agents"]','2026-08-29'),
('claude-agent-sdk','Claude Agent SDK','Claude SDK','sdk','Anthropic SDK for building agents with Claude.','published','public','https://www.anthropic.com/','https://docs.anthropic.com/en/docs/agents-and-tools/claude-code-sdk',null,false,false,true,'["SDK","agents"]','2026-08-29'),
('google-adk','Google ADK','Google ADK','sdk','Google toolkit for building agents.','published','public','https://google.github.io/adk-docs/','https://google.github.io/adk-docs/','https://github.com/google/adk-python',true,true,true,'["SDK","agents"]','2026-08-29'),
('langchain','LangChain','LangChain','agent_framework','Framework for building applications with language models.','published','public','https://www.langchain.com/','https://python.langchain.com/docs/','https://github.com/langchain-ai/langchain',true,true,true,'["framework","agents"]','2026-08-29'),
('langgraph','LangGraph','LangGraph','agent_framework','Framework for stateful agent workflows.','published','public','https://www.langchain.com/langgraph','https://langchain-ai.github.io/langgraph/','https://github.com/langchain-ai/langgraph',true,true,true,'["framework","workflows"]','2026-08-29'),
('crewai','CrewAI','CrewAI','agent_framework','Framework for orchestrating AI agents.','published','public','https://www.crewai.com/','https://docs.crewai.com/','https://github.com/crewAIInc/crewAI',true,true,true,'["framework","agents"]','2026-08-29'),
('pydantic-ai','PydanticAI','PydanticAI','agent_framework','Python agent framework from Pydantic.','published','public','https://ai.pydantic.dev/','https://ai.pydantic.dev/','https://github.com/pydantic/pydantic-ai',true,true,true,'["framework","agents"]','2026-08-29'),
('strands-agents','Strands Agents','Strands','agent_framework','Open-source SDK for building agents.','published','public','https://strandsagents.com/','https://strandsagents.com/latest/','https://github.com/strands-agents/sdk-python',true,true,true,'["framework","agents"]','2026-08-29'),
('agno','Agno','Agno','agent_framework','Open-source framework for building agents.','published','public','https://www.agno.com/','https://docs.agno.com/','https://github.com/agno-agi/agno',true,true,true,'["framework","agents"]','2026-08-29'),
('smolagents','smolagents','smolagents','agent_framework','Hugging Face agent framework.','published','public','https://huggingface.co/docs/smolagents','https://huggingface.co/docs/smolagents','https://github.com/huggingface/smolagents',true,true,true,'["framework","agents"]','2026-08-29'),
('mastra','Mastra','Mastra','agent_framework','TypeScript framework for agent applications.','published','public','https://mastra.ai/','https://mastra.ai/docs','https://github.com/mastra-ai/mastra',true,true,true,'["framework","agents"]','2026-08-29'),
('llamaindex','LlamaIndex','LlamaIndex','agent_framework','Framework for data and agent workflows.','published','public','https://www.llamaindex.ai/','https://docs.llamaindex.ai/','https://github.com/run-llama/llama_index',true,true,true,'["framework","RAG"]','2026-08-29'),
('semantic-kernel','Semantic Kernel','Semantic Kernel','sdk','Microsoft SDK for AI orchestration.','published','public','https://learn.microsoft.com/semantic-kernel/','https://learn.microsoft.com/semantic-kernel/','https://github.com/microsoft/semantic-kernel',true,true,true,'["SDK","agents"]','2026-08-29'),
('agent2agent','Agent2Agent Protocol','A2A','protocol','Open protocol for communication between agents.','published','public','https://a2a-protocol.org/','https://a2a-protocol.org/latest/', 'https://github.com/a2aproject/A2A',true,true,true,'["protocol","agents"]','2026-08-29'),
('openai-compatible-api','OpenAI-compatible API','OpenAI API','protocol','Common API shape implemented by compatible providers and runtimes.','published','public','https://platform.openai.com/docs/api-reference','https://platform.openai.com/docs/api-reference',null,false,true,true,'["protocol","API"]','2026-08-29'),
('anthropic-messages-api','Anthropic Messages API','Messages API','protocol','Anthropic API message interface.','published','public','https://docs.anthropic.com/','https://docs.anthropic.com/en/api/messages',null,false,false,true,'["protocol","API"]','2026-08-29'),
('git-tool','Git','Git','tool','Version-control capability for agent tool integrations.','published','public','https://git-scm.com/','https://git-scm.com/doc',null,true,true,true,'["tool","version control"]','2026-08-29'),
('browser-tool','Browser','Browser','tool','Browser interaction capability for agent tool integrations.','published','public',null,null,null,false,true,true,'["tool","browser"]','2026-08-29'),
('web-search-tool','Web search','Web search','tool','Web search capability for agent tool integrations.','published','public',null,null,null,false,false,true,'["tool","search"]','2026-08-29'),
('sql-database-tool','SQL database','SQL','tool','Relational database capability for agent tool integrations.','published','public',null,null,null,false,true,true,'["tool","database"]','2026-08-29'),
('vector-database-tool','Vector database','Vector DB','tool','Vector retrieval and RAG capability for agent tool integrations.','published','public',null,null,null,false,true,true,'["tool","RAG","vector"]','2026-08-29'),
('external-api-tool','External APIs','External APIs','tool','General external API capability for agent tool integrations.','published','public',null,null,null,false,false,true,'["tool","API"]','2026-08-29'),
('memory-tool','Memory','Memory','tool','Persistent memory capability for agent tool integrations.','published','public',null,null,null,false,true,true,'["tool","memory"]','2026-08-29'),
('computer-use-tool','Computer use','Computer use','tool','Computer interaction capability for agent tool integrations.','published','public',null,null,null,false,true,true,'["tool","computer use"]','2026-08-29') on conflict (slug) do nothing;

-- Preserve model hierarchy and creator relationships after every referenced component exists.
update public.components child set parent_component_id=parent.id, organization_id=org.id
from (values
  ('gpt-model-family','openai','openai'),('gpt-oss','gpt-model-family','openai'),('gemma-model-family','google','google'),
  ('qwen-coder','qwen-model-family','alibaba-qwen'),('qwen-vl','qwen-model-family','alibaba-qwen'),('deepseek-model-family','deepseek','deepseek'),
  ('kimi-model-family','moonshot-ai','moonshot-ai'),('llama-model-family','meta','meta'),('mistral-model-family','mistral-ai','mistral-ai'),
  ('mixtral-model-family','mistral-model-family','mistral-ai'),('codestral-model-family','mistral-model-family','mistral-ai'),('glm-model-family','z-ai','z-ai'),
  ('grok-model-family','xai','xai'),('phi-model-family','microsoft','microsoft'),('nemotron-model-family','nvidia','nvidia'),
  ('command-model-family','cohere','cohere'),('granite-model-family','ibm','ibm'),('minimax-model-family','minimax','minimax'),
  ('gpt-oss-20b','gpt-oss','openai'),('gpt-oss-120b','gpt-oss','openai'),('claude-sonnet','claude-model-family','anthropic'),
  ('claude-opus','claude-model-family','anthropic'),('gemini-flash','gemini-model-family','google'),('gemini-pro','gemini-model-family','google'),
  ('qwen3-coder','qwen-coder','alibaba-qwen'),('qwen-vl-max','qwen-vl','alibaba-qwen'),('deepseek-r1','deepseek-model-family','deepseek'),
  ('kimi-k2','kimi-model-family','moonshot-ai'),('llama-4','llama-model-family','meta'),('mistral-large','mistral-model-family','mistral-ai'),
  ('codestral','codestral-model-family','mistral-ai'),('glm-4','glm-model-family','z-ai'),('phi-4','phi-model-family','microsoft'),
  ('nemotron-nano','nemotron-model-family','nvidia'),('command-a','command-model-family','cohere'),('granite-4','granite-model-family','ibm')
) as hierarchy(child_slug,parent_slug,org_slug)
join public.components parent on parent.slug=hierarchy.parent_slug
join public.components org on org.slug=hierarchy.org_slug
where child.slug=hierarchy.child_slug;

-- First-party resource evidence for every newly curated component with a branded official resource.
insert into public.sources(title,url,source_type,publisher,retrieved_at)
select c.name || ' official resource', coalesce(c.docs_url,c.official_website_url), 'official_docs', c.name, '2026-08-29'
from public.components c
where c.last_verified_at='2026-08-29' and coalesce(c.docs_url,c.official_website_url) is not null
on conflict (url) do nothing;

insert into public.component_sources(component_id,source_id,claim_type,notes)
select c.id,s.id,'general','First-party resource recorded for the curated catalog.'
from public.components c join public.sources s on s.url=coalesce(c.docs_url,c.official_website_url)
where c.last_verified_at='2026-08-29'
on conflict do nothing;

-- Typed ports are only added for documented connection surfaces; taxonomy records remain descriptive.
insert into public.ports(component_id,name,slug,direction,protocol_type,transport_type,data_type,cardinality,required,description)
select c.id,p.name,p.slug,p.direction,p.protocol_type,p.transport_type,p.data_type,p.cardinality,p.required,p.description
from (values
  ('lm-studio','LM Studio REST API','lm-studio-rest-out','output','lm_studio_api','local_http','model_api','many',false,'LM Studio stateful REST API surface.'),
  ('lm-studio','Anthropic-compatible Messages API','anthropic-messages-out','output','anthropic_messages_api','local_http','model_api','many',false,'LM Studio Anthropic-compatible Messages surface.'),
  ('lm-studio','MCP integration','mcp-tools-out','output','mcp','stdio_or_http','tool_calls','many',false,'LM Studio MCP integration surface; tool support depends on configuration.'),
  ('llama-cpp','GGUF model input','gguf-model-in','input','gguf','file','gguf_model','many',true,'A compatible GGUF model artifact.'),
  ('llama-cpp','OpenAI-compatible API','openai-api-out','output','openai_compatible_api','local_http','model_api','many',false,'llama.cpp server OpenAI-compatible API surface.'),
  ('localai','Local model input','local-model-in','input','model_artifact','file','model_weights','many',true,'A model artifact supported by LocalAI.'),
  ('localai','OpenAI-compatible API','openai-api-out','output','openai_compatible_api','local_http','model_api','many',false,'LocalAI OpenAI-compatible API surface.'),
  ('vllm','Model weights input','model-weights-in','input','transformers','file','transformers_model','many',true,'A compatible Transformers model artifact.'),
  ('vllm','OpenAI-compatible API','openai-api-out','output','openai_compatible_api','http','model_api','many',false,'vLLM OpenAI-compatible serving surface.'),
  ('github-copilot-cli','GitHub MCP tools','github-mcp-out','output','mcp','stdio_or_http','tool_calls','many',false,'GitHub Copilot CLI built-in GitHub MCP server surface.')
) as p(component_slug,name,slug,direction,protocol_type,transport_type,data_type,cardinality,required,description)
join public.components c on c.slug=p.component_slug
on conflict(component_id,slug) do nothing;

insert into public.compatibility_edges(source_port_id,target_port_id,status,compatibility_level,confidence,notes,limitations,configuration_required,configuration_notes,last_verified_at)
select source_port.id,target_port.id,e.status,e.compatibility_level,e.confidence,e.notes,e.limitations,e.configuration_required,e.configuration_notes,'2026-08-29'
from (values
  ('llama-cpp','openai-api-out','hermes-agent','model-api-in','verified_first_party','compatible',0.9,'Hermes Agent documents custom OpenAI-compatible endpoints; llama.cpp documents an OpenAI-compatible server surface.','Configure the local server URL and a compatible model.',true,'Point Hermes Agent at the llama.cpp server URL.'),
  ('localai','openai-api-out','hermes-agent','model-api-in','verified_first_party','compatible',0.9,'Hermes Agent documents custom OpenAI-compatible endpoints; LocalAI documents an OpenAI-compatible API surface.','Configure the local server URL and a compatible model.',true,'Point Hermes Agent at the LocalAI server URL.'),
  ('github-copilot-cli','github-mcp-out','github-tool','tool-in','verified_official','native',0.98,'GitHub documents the Copilot CLI built-in GitHub MCP server.','Availability depends on the active Copilot plan and configuration.',true,'Use the built-in GitHub MCP server or configured MCP servers.'),
  ('lm-studio','mcp-tools-out','github-tool','tool-in','inferred','partial',0.55,'LM Studio documents MCP server use, but this catalog does not assert a preconfigured GitHub server relationship.','Requires a user-configured GitHub MCP server and model tool-use support.',true,'Configure the GitHub MCP server in LM Studio before use.')
) as e(source_component,source_slug,target_component,target_slug,status,compatibility_level,confidence,notes,limitations,configuration_required,configuration_notes)
join public.components source_component on source_component.slug=e.source_component
join public.ports source_port on source_port.component_id=source_component.id and source_port.slug=e.source_slug
join public.components target_component on target_component.slug=e.target_component
join public.ports target_port on target_port.component_id=target_component.id and target_port.slug=e.target_slug
on conflict(source_port_id,target_port_id) do nothing;

-- Curated, documented integration surfaces.  Provider links are intentionally about API
-- connectivity, not an assertion of model quality or unrestricted feature parity.
insert into public.sources(title,url,source_type,publisher,retrieved_at) values
  ('Ollama integrations','https://docs.ollama.com/integrations','official_docs','Ollama','2026-08-29'),
  ('LM Studio Responses API and Codex integration','https://lmstudio.ai/docs/developer/openai-compat/responses','official_docs','LM Studio','2026-08-29'),
  ('OpenCode providers','https://opencode.ai/docs/providers','official_docs','OpenCode','2026-08-29'),
  ('Aider LLM connections','https://aider.chat/docs/llms.html','official_docs','Aider','2026-08-29')
on conflict (url) do nothing;

insert into public.ports(component_id,name,slug,direction,protocol_type,transport_type,data_type,cardinality,required,description)
select c.id,p.name,p.slug,'input','openai_compatible_api','http','model_api','one',true,p.description
from (values
 ('openai-codex','Model integration API','model-in','A documented provider or local OpenAI-compatible integration.'),
 ('claude-code','Model integration API','model-in','A documented provider integration.'),
 ('opencode','OpenAI-compatible model API','model-in','Configured OpenAI-compatible or supported provider endpoint.'),
 ('aider','Model API','model-in','Configured supported model provider endpoint.')
) as p(component_slug,name,slug,description) join public.components c on c.slug=p.component_slug
on conflict(component_id,slug) do nothing;

insert into public.compatibility_edges(source_port_id,target_port_id,status,compatibility_level,confidence,notes,limitations,configuration_required,configuration_notes,last_verified_at)
select sp.id,tp.id,'verified_first_party','compatible',0.92,e.notes,e.limitations,true,e.configuration,'2026-08-29'
from (values
 ('ollama','openai-api-out','openai-codex','model-in','Ollama documents a Codex integration using its supported local integration surface.','Only models suitable for the requested coding task should be selected.','Configure the documented Ollama/Codex integration.'),
 ('lm-studio','lm-studio-rest-out','openai-codex','model-in','LM Studio documents Codex through its OpenAI-compatible Responses API.','Requires the documented local server and Codex configuration.','Start LM Studio and configure the documented endpoint.'),
 ('ollama','openai-api-out','claude-code','model-in','Ollama documents Claude Code among its supported launch integrations.','Integration availability and model capability vary by configuration.','Use the documented ollama launch integration.'),
 ('ollama','openai-api-out','opencode','model-in','Ollama documents OpenCode among its supported launch integrations.','Requires a configured local model.','Use the documented Ollama/OpenCode integration.'),
 ('lm-studio','lm-studio-rest-out','opencode','model-in','OpenCode documents LM Studio as a local model provider.','Requires the local LM Studio server.','Configure LM Studio in OpenCode providers.'),
 ('openrouter','openai-api-out','opencode','model-in','OpenCode documents OpenRouter as a provider.','Provider model availability and pricing are separate concerns.','Configure the OpenRouter provider in OpenCode.'),
 ('ollama','openai-api-out','aider','model-in','Aider documents Ollama as a supported model connection.','Choose an Aider-supported local model.','Configure the Ollama model in Aider.'),
 ('lm-studio','lm-studio-rest-out','aider','model-in','Aider documents LM Studio and OpenAI-compatible local APIs.','Requires a running local server.','Configure the LM Studio endpoint in Aider.'),
 ('openrouter','openai-api-out','aider','model-in','Aider documents OpenRouter as a supported provider.','Provider model availability and pricing are separate concerns.','Configure OpenRouter in Aider.')
) as e(source_component,source_slug,target_component,target_slug,notes,limitations,configuration)
join public.components sc on sc.slug=e.source_component join public.ports sp on sp.component_id=sc.id and sp.slug=e.source_slug
join public.components tc on tc.slug=e.target_component join public.ports tp on tp.component_id=tc.id and tp.slug=e.target_slug
on conflict(source_port_id,target_port_id) do nothing;

insert into public.compatibility_edge_sources(compatibility_edge_id,source_id,evidence_notes)
select edge.id,source.id,'First-party integration documentation for this exact provider-to-agent surface.'
from public.compatibility_edges edge
join public.ports sp on sp.id=edge.source_port_id join public.components sc on sc.id=sp.component_id
join public.ports tp on tp.id=edge.target_port_id join public.components tc on tc.id=tp.component_id
join public.sources source on (tc.slug='opencode' and source.url='https://opencode.ai/docs/providers') or (tc.slug='aider' and source.url='https://aider.chat/docs/llms.html') or (tc.slug='openai-codex' and source.url='https://lmstudio.ai/docs/developer/openai-compat/responses') or ((tc.slug='openai-codex' or tc.slug='claude-code') and source.url='https://docs.ollama.com/integrations')
where (sc.slug,tc.slug) in (('ollama','openai-codex'),('lm-studio','openai-codex'),('ollama','claude-code'),('ollama','opencode'),('lm-studio','opencode'),('openrouter','opencode'),('ollama','aider'),('lm-studio','aider'),('openrouter','aider'))
on conflict do nothing;

-- LM Studio names these representative families in its own local-model documentation.
-- A dedicated catalog-artifact port avoids overstating a particular quantization or checkpoint format.
insert into public.sources(title,url,source_type,publisher,retrieved_at)
values ('LM Studio local model support','https://lmstudio.ai/docs/app','official_docs','LM Studio','2026-08-29') on conflict (url) do nothing;

insert into public.ports(component_id,name,slug,direction,protocol_type,transport_type,data_type,cardinality,required,description)
select c.id,'LM Studio model package','lm-studio-package-out','output','lm_studio_model_package','catalog_download','model_package','many',false,'A model package selected from a documented LM Studio-supported family.'
from public.components c where c.slug in ('gpt-oss-20b','qwen3-coder','llama-4','mistral-large','deepseek-r1')
on conflict(component_id,slug) do nothing;

insert into public.ports(component_id,name,slug,direction,protocol_type,transport_type,data_type,cardinality,required,description)
select c.id,'Documented model package','documented-model-in','input','lm_studio_model_package','catalog_download','model_package','many',true,'A model package from a family listed in LM Studio documentation.'
from public.components c where c.slug='lm-studio'
on conflict(component_id,slug) do nothing;

insert into public.compatibility_edges(source_port_id,target_port_id,status,compatibility_level,confidence,notes,limitations,configuration_required,configuration_notes,last_verified_at)
select sp.id,tp.id,'verified_official','compatible',0.91,'LM Studio documents running this representative model family locally.','Exact artifact, hardware fit, and tool-use quality must be selected and reviewed per model.',true,'Download a compatible artifact and load it through LM Studio.','2026-08-29'
from public.ports sp join public.components sc on sc.id=sp.component_id
join public.components tc on tc.slug='lm-studio' join public.ports tp on tp.component_id=tc.id and tp.slug='documented-model-in'
where sp.slug='lm-studio-package-out' and sc.slug in ('gpt-oss-20b','qwen3-coder','llama-4','mistral-large','deepseek-r1')
on conflict(source_port_id,target_port_id) do nothing;

insert into public.compatibility_edge_sources(compatibility_edge_id,source_id,evidence_notes)
select edge.id,source.id,'LM Studio official documentation lists this model family as runnable locally.'
from public.compatibility_edges edge join public.ports sp on sp.id=edge.source_port_id
join public.sources source on source.url='https://lmstudio.ai/docs/app'
where sp.slug='lm-studio-package-out'
on conflict do nothing;

-- Additional narrow provider/runtime paths already represented by the curated catalog.
insert into public.ports(component_id,name,slug,direction,protocol_type,transport_type,data_type,cardinality,required,description)
select c.id,'Hosted model API','hosted-model-api-out','output','openai_compatible_api','https','model_api','many',false,'Documented hosted model-provider API surface.'
from public.components c where c.slug in ('hugging-face-inference-providers','aws-bedrock','azure-ai-foundry')
on conflict(component_id,slug) do nothing;

insert into public.compatibility_edges(source_port_id,target_port_id,status,compatibility_level,confidence,notes,limitations,configuration_required,configuration_notes,last_verified_at)
select sp.id,tp.id,'verified_first_party','compatible',0.9,e.notes,'Availability and model capability depend on the configured provider and model.',true,e.configuration,'2026-08-29'
from (values
 ('lm-studio','lm-studio-rest-out','claude-code','model-in','LM Studio documents Claude Code among its supported integrations.','Use the documented LM Studio integration configuration.'),
 ('hugging-face-inference-providers','hosted-model-api-out','hermes-agent','model-api-in','Hermes Agent documents Hugging Face inference provider support.','Configure the provider credentials in Hermes Agent.'),
 ('aws-bedrock','hosted-model-api-out','hermes-agent','model-api-in','Hermes Agent documents AWS Bedrock provider support.','Configure AWS Bedrock credentials and a supported model.'),
 ('azure-ai-foundry','hosted-model-api-out','hermes-agent','model-api-in','Hermes Agent documents Azure provider support.','Configure Azure credentials and deployment details.'),
 ('lm-studio','mcp-tools-out','model-context-protocol','client-in','LM Studio documents MCP server use with local models; tool behavior depends on the selected model and configured MCP server.','Configure the MCP server in LM Studio.')
) as e(source_component,source_slug,target_component,target_slug,notes,configuration)
join public.components sc on sc.slug=e.source_component join public.ports sp on sp.component_id=sc.id and sp.slug=e.source_slug
join public.components tc on tc.slug=e.target_component join public.ports tp on tp.component_id=tc.id and tp.slug=e.target_slug
on conflict(source_port_id,target_port_id) do nothing;

insert into public.compatibility_edge_sources(compatibility_edge_id,source_id,evidence_notes)
select edge.id,source.id,'First-party documentation for the documented provider/runtime integration surface.'
from public.compatibility_edges edge join public.ports sp on sp.id=edge.source_port_id join public.components sc on sc.id=sp.component_id
join public.ports tp on tp.id=edge.target_port_id join public.components tc on tc.id=tp.component_id
join public.sources source on (sc.slug='lm-studio' and source.url='https://lmstudio.ai/docs/app') or ((sc.slug in ('hugging-face-inference-providers','aws-bedrock','azure-ai-foundry')) and source.url='https://hermes-agent.nousresearch.com/docs/')
where (sc.slug,tc.slug) in (('lm-studio','claude-code'),('hugging-face-inference-providers','hermes-agent'),('aws-bedrock','hermes-agent'),('azure-ai-foundry','hermes-agent'),('lm-studio','model-context-protocol'))
on conflict do nothing;

-- Precise local fixture: a GGUF Qwen artifact through llama.cpp's documented GGUF
-- loading surface, then its existing OpenAI-compatible API route to Hermes Agent.
insert into public.compatibility_edges(source_port_id,target_port_id,status,compatibility_level,confidence,notes,limitations,configuration_required,configuration_notes,last_verified_at)
select source_port.id,target_port.id,'verified_first_party','compatible',0.9,'llama.cpp supports loading compatible GGUF model files and serving local inference.','Exact quantization, context length, and backend settings remain user-selected.',true,'Load a compatible GGUF artifact with llama.cpp, then configure the local API endpoint.','2026-08-29'
from public.components source_component join public.ports source_port on source_port.component_id=source_component.id and source_port.slug='gguf-out'
join public.components target_component on target_component.slug='llama-cpp' join public.ports target_port on target_port.component_id=target_component.id and target_port.slug='gguf-model-in'
where source_component.slug='qwen3-coder-gguf'
on conflict(source_port_id,target_port_id) do nothing;

insert into public.compatibility_edge_sources(compatibility_edge_id,source_id,evidence_notes)
select edge.id,source.id,'llama.cpp first-party documentation supports the GGUF/runtime surface.'
from public.compatibility_edges edge join public.ports source_port on source_port.id=edge.source_port_id join public.components source_component on source_component.id=source_port.component_id
join public.ports target_port on target_port.id=edge.target_port_id join public.components target_component on target_component.id=target_port.component_id
join public.sources source on source.url='https://github.com/ggml-org/llama.cpp'
where source_component.slug='qwen3-coder-gguf' and target_component.slug='llama-cpp'
on conflict do nothing;

insert into public.compatibility_edge_sources(compatibility_edge_id,source_id,evidence_notes)
select edge.id,source.id,'First-party documentation supporting the recorded surface or relationship.'
from public.compatibility_edges edge
join public.ports source_port on source_port.id=edge.source_port_id
join public.components source_component on source_component.id=source_port.component_id
join public.sources source on source.url=coalesce(source_component.docs_url,source_component.official_website_url)
where source_component.slug in ('llama-cpp','localai','github-copilot-cli','lm-studio')
on conflict do nothing;

-- Structured model metadata is included only where the official model catalog exposes an unambiguous value.
insert into public.model_metadata(component_id,parameter_count,architecture,modalities,coding_specialization,weight_format,license,assumptions)
select c.id,m.parameter_count,m.architecture,m.modalities::jsonb,m.coding_specialization,m.weight_format,m.license,m.assumptions
from (values
  ('gpt-oss-20b',20000000000::bigint,'mixture-of-experts','["text"]',true,'open weights','Apache-2.0','Parameter count and license recorded from OpenAI open-model documentation.'),
  ('gpt-oss-120b',120000000000::bigint,'mixture-of-experts','["text"]',true,'open weights','Apache-2.0','Parameter count and license recorded from OpenAI open-model documentation.')
) as m(component_slug,parameter_count,architecture,modalities,coding_specialization,weight_format,license,assumptions)
join public.components c on c.slug=m.component_slug
on conflict(component_id) do update set parameter_count=excluded.parameter_count,architecture=excluded.architecture,modalities=excluded.modalities,coding_specialization=excluded.coding_specialization,weight_format=excluded.weight_format,license=excluded.license,assumptions=excluded.assumptions;

-- Exact updater mappings only: each ID is canonical for the named source system.
insert into public.component_external_refs(component_id,source_system,external_id,external_url,canonical)
select c.id,r.source_system,r.external_id,r.external_url,true
from (values
  ('llama-cpp','github','ggml-org/llama.cpp','https://github.com/ggml-org/llama.cpp'),
  ('vllm','github','vllm-project/vllm','https://github.com/vllm-project/vllm'),
  ('localai','github','mudler/LocalAI','https://github.com/mudler/LocalAI'),
  ('cline','github','cline/cline','https://github.com/cline/cline'),
  ('continue','github','continuedev/continue','https://github.com/continuedev/continue'),
  ('gpt-oss-20b','huggingface','openai/gpt-oss-20b','https://huggingface.co/openai/gpt-oss-20b'),
  ('gpt-oss-120b','huggingface','openai/gpt-oss-120b','https://huggingface.co/openai/gpt-oss-120b'),
  ('deepseek-r1','huggingface','deepseek-ai/DeepSeek-R1','https://huggingface.co/deepseek-ai/DeepSeek-R1')
) as r(component_slug,source_system,external_id,external_url)
join public.components c on c.slug=r.component_slug
on conflict(source_system,external_id) do nothing;
