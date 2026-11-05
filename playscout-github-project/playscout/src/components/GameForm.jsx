import { useEffect, useState } from "react";
import { categories } from "../data/categories";
import { X } from "lucide-react";

const blank = {
  title: "", slug: "", category: "Action", description: "", instructions: "",
  cover_url: "", game_url: "", embed_url: "", play_mode: "external",
  tags: [], featured: false, is_trending: false, is_new: false, status: "draft",
  seo_title: "", seo_description: ""
};

export default function GameForm({ initial, onSave, onCancel, busy }) {
  const [form, setForm] = useState(blank);
  const [tagsText, setTagsText] = useState("");
  useEffect(() => {
    const next = initial ? { ...blank, ...initial } : blank;
    setForm(next);
    setTagsText((next.tags || []).join(", "));
  }, [initial]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const submit = e => {
    e.preventDefault();
    const slug = (form.slug || form.title).toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    onSave({ ...form, slug, tags: tagsText.split(",").map(x => x.trim()).filter(Boolean) });
  };

  return (
    <div className="admin-form-overlay">
      <form className="admin-form" onSubmit={submit}>
        <div className="form-heading"><div><span className="eyebrow">GAME LIBRARY</span><h2>{initial ? "Edit game" : "Add a game"}</h2></div><button type="button" className="icon-button" onClick={onCancel}><X/></button></div>
        <div className="form-grid">
          <label>Game title *<input required value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Neon Drift"/></label>
          <label>URL slug<input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="auto-generated-from-title"/></label>
          <label>Category<select value={form.category} onChange={e => set("category", e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Status<select value={form.status} onChange={e => set("status", e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
          <label className="full-field">Cover image URL<input value={form.cover_url} onChange={e => set("cover_url", e.target.value)} placeholder="https://..."/></label>
          <label className="full-field">Game page URL<input value={form.game_url} onChange={e => set("game_url", e.target.value)} placeholder="https://official-game-site.com"/></label>
          <label>Play mode<select value={form.play_mode} onChange={e => set("play_mode", e.target.value)}><option value="external">External link</option><option value="embed">Embed in PlayScout</option><option value="both">Embed + external</option></select></label>
          <label>Embed URL<input value={form.embed_url} onChange={e => set("embed_url", e.target.value)} placeholder="Authorized iframe URL"/></label>
          <label className="full-field">Short description *<textarea required rows="3" value={form.description} onChange={e => set("description", e.target.value)} placeholder="What makes this game worth playing?"/></label>
          <label className="full-field">How to play<textarea rows="2" value={form.instructions} onChange={e => set("instructions", e.target.value)} placeholder="Controls, objective, tips..."/></label>
          <label className="full-field">Tags (comma separated)<input value={tagsText} onChange={e => setTagsText(e.target.value)} placeholder="Indie, Relaxing, 3D"/></label>
          <label className="full-field">SEO title<input value={form.seo_title || ""} onChange={e => set("seo_title", e.target.value)} placeholder="Search result title"/></label>
          <label className="full-field">SEO description<textarea rows="2" value={form.seo_description || ""} onChange={e => set("seo_description", e.target.value)} placeholder="Unique search description"/></label>
        </div>
        <div className="check-row">
          <label><input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)}/> Featured</label>
          <label><input type="checkbox" checked={form.is_trending} onChange={e => set("is_trending", e.target.checked)}/> Trending</label>
          <label><input type="checkbox" checked={form.is_new} onChange={e => set("is_new", e.target.checked)}/> New</label>
        </div>
        <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? "Saving..." : "Save game"}</button></div>
      </form>
    </div>
  );
}
