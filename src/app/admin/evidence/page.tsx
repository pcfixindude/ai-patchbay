import Link from "next/link";
import { attachEvidence } from "../actions";
import { requireEditor } from "@/lib/auth/authorization";

export const metadata = { title: "Add evidence · AI Patchbay" };

export default async function EvidencePage() {
  const { supabase } = await requireEditor("/admin/evidence");
  const { data: components, error } = await supabase.from("components").select("id,name").in("status", ["published", "deprecated"]).order("name");
  if (error) throw new Error(error.message);
  return <main className="detail-page"><Link href="/admin" className="detail-link">← Update Center</Link><section className="detail-card"><span className="eyebrow">Manual verification</span><h1>Attach evidence</h1><p>A verification needs a traceable source. Use <em>internal test</em> only for explicitly tested-internal claims.</p><form action={attachEvidence} className="login-form"><label>Component<select name="componentId" required>{components.map((component) => <option key={component.id} value={component.id}>{component.name}</option>)}</select></label><label>Source URL<input name="url" type="url" required /></label><label>Source title<input name="title" required /></label><label>Publisher<input name="publisher" required /></label><label>Source type<select name="sourceType" defaultValue="official_docs"><option value="official_docs">Official documentation</option><option value="official_repo">Official repository</option><option value="model_card">Model card</option><option value="announcement">Announcement</option><option value="community">Community</option><option value="internal_test">Tested internal</option></select></label><label>Publication date (optional)<input name="publicationDate" type="date" /></label><label>Notes (optional)<input name="notes" /></label><button className="button primary">Attach evidence</button></form></section></main>;
}
