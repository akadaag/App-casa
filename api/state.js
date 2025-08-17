// Stato iniziale dei due bagni + menu + turni
let state = {
  sopra: { state: 'free', user: null },
  sotto: { state: 'free', user: null },
  menu: null,        // es. { "Lunedì": {pranzo:"", cena:""}, ... }
  turni: null        // es. { pranzo: "", cena: "" }
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(state);
  }

  if (req.method === 'POST') {
    const body = req.body;

    // Aggiornamento bagno
    if (body.bagno && body.state) {
      const bagno = body.bagno;
      const newState = body.state;
      const user = body.user;
      if (newState === 'occupied') {
        state[bagno] = { state: 'occupied', user };
      } else {
        // libera solo se è lo stesso utente
        if (state[bagno].user === user) {
          state[bagno] = { state: 'free', user: null };
        }
      }
    }

    // Aggiornamento menu
    if (body.menu) {
      state.menu = body.menu;
    }

    // Aggiornamento turni
    if (body.turni) {
      state.turni = body.turni;
    }

    return res.status(200).json(state);
  }

  res.status(405).send('Method not allowed');
}
