const SUPA_URL = "https://mnojnpuecywgwfkvinrq.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ub2pucHVlY3l3Z3dma3ZpbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTE1NzUsImV4cCI6MjA5NDI2NzU3NX0.2VvdhVyuLXqa8nXXhroUIQ7jZfv8qo_aKFXaBcxN4dE";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    // Get published alerts that haven't expired
    const url = `${SUPA_URL}/rest/v1/update_alerts?status=eq.published&order=published_at.desc&limit=10`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) return res.status(200).json([]);

    const data = await response.json();
    
    // Filter out expired alerts on the server side
    const active = data.filter(a => !a.expires_at || a.expires_at >= today);
    
    return res.status(200).json(active);
  } catch (error) {
    return res.status(200).json([]);
  }
}
