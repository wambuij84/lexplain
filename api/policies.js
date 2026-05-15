const SUPA_URL = "https://mnojnpuecywgwfkvinrq.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ub2pucHVlY3l3Z3dma3ZpbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTE1NzUsImV4cCI6MjA5NDI2NzU3NX0.2VvdhVyuLXqa8nXXhroUIQ7jZfv8qo_aKFXaBcxN4dE";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    let url;
    if (slug) {
      // Single policy by slug
      url = `${SUPA_URL}/rest/v1/policies?slug=eq.${slug}&published=eq.true&limit=1`;
    } else {
      // All published policies
      url = `${SUPA_URL}/rest/v1/policies?published=eq.true&select=slug,name,aka,doctype,category,jurisdiction,year,status,icon,short_description,plain_english,impact_summary,threat_summary,weakness_summary,left_out_summary&order=name.asc&limit=500`;
    }

    const response = await fetch(url, {
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const data = await response.json();

    // Cache for 5 minutes on Vercel edge
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
