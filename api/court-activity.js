// Read recent court activity stored from CourtListener webhooks
// Returns last 90 days of opinions pushed via webhook

const SUPA_URL = "https://mnojnpuecywgwfkvinrq.supabase.co";
const SUPA_KEY = process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ub2pucHVlY3l3Z3dma3ZpbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMzI1OTMsImV4cCI6MjA1OTkwODU5M30.yaxETR0BH6JQUiRbtOcPDBEjlSqP74h8lVJMdBHFpWY";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300'); // cache 5 min

  const { limit = 20, query = "" } = req.query;

  const since = new Date();
  since.setDate(since.getDate() - 90);
  const sinceStr = since.toISOString().split('T')[0];

  try {
    let url = `${SUPA_URL}/rest/v1/court_activity` +
      `?date_filed=gte.${sinceStr}` +
      `&order=date_filed.desc` +
      `&limit=${limit}`;

    // Optional keyword filter
    if (query) {
      url += `&case_name=ilike.*${encodeURIComponent(query)}*`;
    }

    const response = await fetch(url, {
      headers: {
        "apikey": SUPA_KEY,
        "Authorization": `Bearer ${SUPA_KEY}`,
        "Accept": "application/json",
      }
    });

    if (!response.ok) {
      return res.status(200).json({ opinions: [] });
    }

    const data = await response.json();
    return res.status(200).json({ opinions: data || [] });

  } catch (e) {
    return res.status(200).json({ opinions: [] });
  }
}
