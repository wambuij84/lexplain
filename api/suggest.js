// Vercel serverless function — routes suggestions to Supabase
// This bypasses browser origin restrictions completely

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Allow requests from your Vercel site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const SUPA_URL = "https://mnojnpuecywgwfkvinrq.supabase.co";
  const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ub2pucHVlY3l3Z3dma3ZpbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTE1NzUsImV4cCI6MjA5NDI2NzU3NX0.2VvdhVyuLXqa8nXXhroUIQ7jZfv8qo_aKFXaBcxN4dE";

  try {
    const body = req.body;
    
    const response = await fetch(`${SUPA_URL}/rest/v1/suggestions`, {
      method: 'POST',
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        law_name:        body.law_name        || '',
        jurisdiction:    body.jurisdiction    || '',
        category:        body.category        || '',
        why_important:   body.why_important   || '',
        source_url:      body.source_url      || '',
        submitter_email: body.submitter_email || '',
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Database error', detail: err });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
}
