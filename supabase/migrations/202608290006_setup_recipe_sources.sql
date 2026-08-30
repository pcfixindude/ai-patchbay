insert into public.sources (id, title, url, source_type, publisher, retrieved_at) values
  ('20000000-0000-4000-8000-000000000014', 'Download LM Studio', 'https://lmstudio.ai/download', 'official_docs', 'LM Studio', '2026-08-29'),
  ('20000000-0000-4000-8000-000000000015', 'LM Studio system requirements', 'https://lmstudio.ai/docs/app/system-requirements', 'official_docs', 'LM Studio', '2026-08-29'),
  ('20000000-0000-4000-8000-000000000016', 'Ollama quickstart', 'https://docs.ollama.com/quickstart', 'official_docs', 'Ollama', '2026-08-29'),
  ('20000000-0000-4000-8000-000000000017', 'Ollama Linux installation', 'https://docs.ollama.com/linux', 'official_docs', 'Ollama', '2026-08-29'),
  ('20000000-0000-4000-8000-000000000018', 'Ollama macOS installation', 'https://docs.ollama.com/macos', 'official_docs', 'Ollama', '2026-08-29'),
  ('20000000-0000-4000-8000-000000000019', 'Hermes Agent quickstart', 'https://github.com/NousResearch/hermes-agent/blob/main/website/docs/getting-started/quickstart.md', 'official_repo', 'Nous Research', '2026-08-29'),
  ('20000000-0000-4000-8000-000000000020', 'Codex overview', 'https://developers.openai.com/codex/', 'official_docs', 'OpenAI', '2026-08-29')
on conflict (id) do nothing;
