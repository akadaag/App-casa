import { kv } from '@upstash/kv';

export default async function handler(req, res) {
  try {
    const value = await kv.get('bagno_app_state');
    return res.status(200).json({ value });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
