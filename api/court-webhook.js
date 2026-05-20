// CourtListener Webhook Receiver
// Receives push notifications when new court opinions match saved searches
// Stores in Supabase court_activity table for instant display

const SUPA_URL  = "https://mnojnpuecywgwfkvinrq.supabase.co";
const SUPA_KEY  = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Always respond 200 quickly — CourtListener retries on failure
  try {
    const payload = req.body;

    // Only process search alert hits
    if (!payload || payload.webhook_event_type !== "search.alert.hit") {
      return res.status(200).json({ received: true, skipped: true });
    }

    const opinions = payload.results?.results || [];
    if (opinions.length === 0) {
      return res.status(200).json({ received: true, stored: 0 });
    }

    // Normalize for storage
    const rows = opinions.map(r => ({
      case_name:   (r.caseName || "").slice(0, 500),
      date_filed:  r.dateFiled || null,
      court:       (r.court || "").slice(0, 200),
      court_short: (r.court_citation_string || "").slice(0, 50),
      judge:       (r.judge || "").slice(0, 200),
      docket:      (r.docketNumber || "").slice(0, 100),
      url:         `https://www.courtlistener.com${r.absolute_url || ""}`,
      snippet:     (r.opinions?.[0]?.snippet || "").slice(0, 500),
      received_at: new Date().toISOString(),
    }));

    // Store in Supabase — upsert by URL to avoid duplicates
    if (SUPA_KEY) {
      const supaRes = await fetch(
        `${SUPA_URL}/rest/v1/court_activity`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPA_KEY,
            "Authorization": `Bearer ${SUPA_KEY}`,
            "Prefer": "resolution=ignore-duplicates,return=minimal",
          },
          body: JSON.stringify(rows),
        }
      );

      if (!supaRes.ok) {
        console.error("Supabase error:", supaRes.status, await supaRes.text());
      }
    }

    console.log(`Webhook: stored ${rows.length} court opinion(s)`);
    return res.status(200).json({ received: true, stored: rows.length });

  } catch (e) {
    console.error("Webhook handler error:", e.message);
    return res.status(200).json({ received: true });
  }
}
