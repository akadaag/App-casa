import { kv } from '@vercel/kv';

const DEFAULT_STATE = {
  sopra: { state: 'free', user: null },
  sotto: { state: 'free', user: null },
  menu: {},
  turni: {}
};

export default async function handler(req, res) {
  // Recupero stato dal KV (o uso stato iniziale se non esiste)
  let state = await kv.get('bagno_app_state');
  if (!state) {
    state = { ...DEFAULT_STATE };
    await kv.set('bagno_app_state', state);
  }

  if (req.method === 'GET') {
    return res.status(200).json(state);
  }

  if (req.method === 'POST') {
    const { bagno, state: newState, user, menu, turni } = req.body;

    // Aggiornamento bagno
    if (bagno && newState) {
      if (newState === 'occupied') {
        // Salviamo anche userId per riconoscimento frontend
        state[bagno] = { state: 'occupied', user };
      } else {
        // libera solo se è lo stesso utente
        if (state[bagno].user === user) {
          state[bagno] = { state: 'free', user: null };
        }
      }
    }

    if (menu)  state.menu  = menu;
    if (turni) state.turni = turni;

    // Salva lo stato aggiornato nel KV
    await kv.set('bagno_app_state', state);

    return res.status(200).json(state);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

