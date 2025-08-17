import { kv } from '@vercel/kv';

const DEFAULT_STATE = {
  sopra: { state: 'free', user: null },
  sotto: { state: 'free', user: null },
  menu: {},
  turni: {}
};

export default async function handler(req, res) {
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

    if (bagno && newState) {
      if (newState === 'occupied') {
        state[bagno] = { state: 'occupied', user };
      } else {
        if (state[bagno].user === user) {
          state[bagno] = { state: 'free', user: null };
        }
      }
    }

    if (menu)  state.menu = menu;
    if (turni) state.turni = turni;

    await kv.set('bagno_app_state', state);
    return res.status(200).json(state);
  }

  res.status(405).json({error:'Method not allowed'});
}
