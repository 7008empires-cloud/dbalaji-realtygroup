import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, WHATSAPP_NUMBER } from "./config.js";
document.getElementById("year").textContent = new Date().getFullYear();
const grid = document.getElementById("property-grid");
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("PASTE_") && !SUPABASE_ANON_KEY.includes("PASTE_");
if (!configured) {
  grid.innerHTML = `<div class="empty-state"><h3>Property listings are being set up.</h3><p>Please contact our team for current availability.</p><a class="gold-btn" href="https://wa.me/${WHATSAPP_NUMBER}">WhatsApp Enquiry</a></div>`;
} else {
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let all = [];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function render() {
    const q = document.getElementById("search").value.toLowerCase();
    const cat = document.getElementById("category").value;
    const items = all.filter(p => p.status === "available" && (!cat || p.type === cat) && `${p.title} ${p.location} ${p.description}`.toLowerCase().includes(q));
    grid.innerHTML = items.length ? items.map(p => `<article class="property-card">
      <div class="property-image">${p.photos?.[0] ? `<img src="${esc(p.photos[0])}" alt="${esc(p.title)}">` : `<div class="image-placeholder">D BALAJI<br><small>REALTY GROUP</small></div>`}<span class="tag">${esc(p.type)}</span></div>
      <div class="property-info"><p class="location">⌖ ${esc(p.location)}</p><h3>${esc(p.title)}</h3><div class="property-meta"><span>${esc(p.area || "Details on request")}</span><strong>${esc(p.price || "Price on request")}</strong></div><p class="description">${esc(p.description || "")}</p><a class="card-link" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello, I am interested in " + p.title + " - " + p.location)}" target="_blank" rel="noreferrer">Enquire on WhatsApp ↗</a></div>
    </article>`).join("") : `<div class="empty-state"><h3>No matching properties found</h3><p>Try another category or contact us for assistance.</p><a class="gold-btn" href="https://wa.me/${WHATSAPP_NUMBER}">Contact Us</a></div>`;
  }
  async function load() {
    const { data, error } = await db.from("properties").select("*").eq("status","available").order("created_at",{ascending:false});
    if (error) { grid.innerHTML = `<div class="empty-state"><h3>Listings temporarily unavailable</h3><p>Please contact us directly.</p></div>`; return; }
    all = data || []; render();
  }
  document.getElementById("search").addEventListener("input", render);
  document.getElementById("category").addEventListener("change", render);
  load();
}