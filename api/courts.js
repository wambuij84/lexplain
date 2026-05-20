// CourtListener API proxy — judicial branch live activity
// Token kept server-side only, never exposed to frontend

const CL_TOKEN = process.env.COURTLISTENER_TOKEN || "31b1deda305b9a8e2e2a771f0041e81f09c1ef5e";
const CL_BASE  = "https://www.courtlistener.com/api/rest/v4";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=600'); // cache 10 min

  const { query, days = 90, courts = "", limit = 5 } = req.query;
  if (!query) return res.status(400).json({ error: 'query required' });

  const since = new Date();
  since.setDate(since.getDate() - parseInt(days));
  const sinceStr = since.toISOString().split('T')[0];

  let url = `${CL_BASE}/search/?q=${encodeURIComponent(query)}&type=o` +
    `&order_by=dateFiled+desc&filed_after=${sinceStr}&stat_Published=on` +
    `&format=json&page_size=${limit}`;

  if (courts) {
    courts.split(',').forEach(c => { url += `&court=${c.trim()}`; });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${CL_TOKEN}`,
        'User-Agent': 'LexPlain/1.0 (wambuij@udel.edu; civic legal education)',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('CourtListener error:', response.status, errText);
      return res.status(200).json({ opinions: [] });
    }

    const data = await response.json();

    const opinions = (data.results || []).map(r => ({
      caseName:    r.caseName || "",
      dateFiled:   r.dateFiled || "",
      court:       r.court || "",
      courtShort:  r.court_citation_string || "",
      judge:       r.judge || "",
      docket:      r.docketNumber || "",
      status:      r.status || "Published",
      url:         `https://www.courtlistener.com${r.absolute_url || ""}`,
      snippet:     r.opinions?.[0]?.snippet?.slice(0, 300) || "",
    }));

    return res.status(200).json({ opinions, count: data.count || 0 });

  } catch (e) {
    console.error('CourtListener fetch error:', e);
    return res.status(200).json({ opinions: [] });
  }
}
