import { kv } from '@upstash/kv';


const DEFAULT_STATE = {
  sopra: { state: 'free', user: null },
  sotto: { state: 'free', user: null },
  menu: {},
  turni: {}
};

export default async function handler(req) {
  // 1) Recupera lo stato dal KV
  let state = await kv.get('bagno_app_state');

  // Se viene restituita una stringa → parse
  if (typeof state === 'string') {
    try {
      state = JSON.parse(state);
    } catch {
      state = null;
    }
  }

  // 2) Se ancora non esiste lo stato → inizializza
  if (!state || typeof state !== 'object') {
    state = { ...DEFAULT_STATE };
    await kv.set('bagno_app_state', JSON.stringify(state));
  }

  // 3) GET → restituisce lo stato
  if (req.method === 'GET') {
    return new Response(JSON.stringify(state), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 4) POST → aggiorna lo stato
  if (req.method === 'POST') {
    const { bagno, state: newState, user, menu, turni } = await req.json();

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

    // Menu + Turni
    if (menu)  state.menu  = menu;
    if (turni) state.turni = turni;

    await kv.set('bagno_app_state', JSON.stringify(state));

    return new Response(JSON.stringify(state), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Metodo non supportato
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
