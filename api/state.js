import { kv } from '@vercel/kv';

const DEFAULT_STATE = {
  sopra: { state: 'free', user: null },
  sotto: { state: 'free', user: null },
  menu: {},
  turni: {}
};

export default async function handler(req, res) {

  // Recupera lo stato dal KV (o inizializza con default_state se non esiste)
  let state = await kv.get('bagno_app_state');

  // Se lo stato non esiste (null) oppure le proprietà fondamentali mancano,
  // inizializziamo con lo stato di default
  if (
    !state ||
    state.sopra === undefined ||
    state.sotto === undefined ||
    state.menu  === undefined ||
    state.turni === undefined
  ) {
    state = { ...DEFAULT_STATE };
    await kv.set('bagno_app_state', state);
  }

  // ---------- GET ----------
  if (req.method === 'GET') {
    return res.status(200).json(state);
  }

  // ---------- POST ----------
  if (req.method === 'POST') {
    const { bagno, state: newState, user, menu, turni } = req.body;

    // Aggiorna il bagno
    if (bagno && newState) {
      if (newState === 'occupied') {
        state[bagno] = { state: 'occupied', user };
      } else {
        if (state[bagno].user === user) {
          state[bagno] = { state: 'free', user: null };
        }
      }
    }

    // Aggiorna menu
    if (menu) {
      state.menu = menu;
    }

    // Aggiorna turni
    if (turni) {
      state.turni = turni;
    }

    // Salva nel KV
    await kv.set('bagno_app_state', state);

    return res.status(200).json(state);
  }

  // ---------- Method Not Allowed ----------
  res.status(405).json({ error: 'Method not allowed' });
}

