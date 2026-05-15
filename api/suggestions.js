const SUPA_URL = "https://mnojnpuecywgwfkvinrq.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ub2pucHVlY3l3Z3dma3ZpbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTE1NzUsImV4cCI6MjA5NDI2NzU3NX0.2VvdhVyuLXqa8nXXhroUIQ7jZfv8qo_aKFXaBcxN4dE";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    const response = await fetch(
      `${SUPA_URL}/rest/v1/suggestions?order=created_at.desc&limit=50`,
      { headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` } }
    );
    const data = await response.json();
    return res.status(200).json(data);
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    const response = await fetch(
      `${SUPA_URL}/rest/v1/suggestions?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPA_KEY,
          'Authorization': `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status })
      }
    );
    const data = await response.json();
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
