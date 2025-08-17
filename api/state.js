import { kv } from '@vercel/kv';

const DEFAULT_STATE = {
  sopra: { state: 'free', user: null },
  sotto: { state: 'free', user: null },
  menu: {},
  turni: {}
};

export default async function handler(req, res) {
  // 1) Recupera lo stato dal KV
  let state = await kv.get('bagno_app_state');

  // 2) Se non c'è ancora nulla salvato → inizializza con DEFAULT_STATE
  if (!state || typeof state !== 'object') {
    state = { ...DEFAULT_STATE };
    await kv.set('bagno_app_state', state);
  }

  // 3) GET → restituisce lo stato
  if (req.method === 'GET') {
    return res.status(200).json(state);
  }

  // 4) POST → aggiorna lo stato
  if (req.method === 'POST') {
    const { bagno, state: newState, user, menu, turni } = req.body;

    // Bagni
    if (bagno && newState) {
      if (newState === 'occupied') {
        state[bagno] = { state: 'occupied', user };
      } else {
        if (state[bagno].user === user) {
          state[bagno] = { state: 'free', user: null };
        }
      }
    }

    // Menu
    if (menu)  state.menu  = menu;

    // Turni
    if (turni) state.turni = turni;

    // Salva nel KV
    await kv.set('bagno_app_state', state);

    return res.status(200).json(state);
  }

  // Metodo non supportato
  return res.status(405).json({ error: 'Method not allowed' });
}


  // ---------- Method Not Allowed ----------
  res.status(405).json({ error: 'Method not allowed' });
}

