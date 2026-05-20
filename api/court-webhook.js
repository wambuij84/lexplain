// CourtListener Webhook Receiver
// Receives push notifications when new court opinions match our saved searches
// Stores results in Supabase for instant display without polling

const SUPA_URL = "https://mnojnpuecywgwfkvinrq.supabase.co";
const SUPA_KEY = process.env.SUPABASE_ANON_KEY || "";

export default async function handler(req, res) {

  // CourtListener sends POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body;

    // CourtListener webhook payload structure:
    // { webhook_event_type: "search.alert.hit", results: { count, next, previous, results: [...] } }
    if (!payload || payload.webhook_event_type !== "search.alert.hit") {
      return res.status(200).json({ received: true }); // acknowledge but ignore
    }

    const opinions = payload.results?.results || [];
    if (opinions.length === 0) {
      return res.status(200).json({ received: true, stored: 0 });
    }

    // Normalize opinions for storage
    const normalized = opinions.map(r => ({
      case_name:   r.caseName || "",
      date_filed:  r.dateFiled || "",
      court:       r.court || "",
      court_short: r.court_citation_string || "",
      judge:       r.judge || "",
      docket:      r.docketNumber || "",
      url:         `https://www.courtlistener.com${r.absolute_url || ""}`,
      snippet:     r.opinions?.[0]?.snippet?.slice(0, 400) || "",
      received_at: new Date().toISOString(),
    }));

    // Store in Supabase court_activity table
    if (SUPA_KEY) {
      const supaRes = await fetch(`${SUPA_URL}/rest/v1/court_activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPA_KEY,
          "Authorization": `Bearer ${SUPA_KEY}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify(normalized),
      });

      if (!supaRes.ok) {
        console.error("Supabase store error:", await supaRes.text());
      }
    }

    // Always return 200 quickly — CourtListener retries if we don't
    return res.status(200).json({ received: true, stored: normalized.length });

  } catch (e) {
    console.error("Webhook error:", e);
    // Still return 200 — don't want CourtListener to keep retrying
    return res.status(200).json({ received: true, error: e.message });
  }
}
