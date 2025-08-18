import { kv } from '@vercel/kv';

// Lo stato di default, usato quando il database è vuoto
const DEFAULT_STATE = {
  sopra: { state: 'free', user: null },
  sotto: { state: 'free', user: null },
  menu: {},
  turni: {}
};

export default async function handler(req, res) {
  try {
    // --- RECUPERO E INIZIALIZZAZIONE DELLO STATO ---
    let state = await kv.get('bagno_app_state');

    // CORREZIONE BUG: Controlla in modo sicuro se lo stato è mancante o incompleto.
    // Se lo è, lo crea usando lo stato di default e lo salva.
    if (!state || !state.sopra || !state.sotto || !state.menu || !state.turni) {
      state = { ...DEFAULT_STATE };
      await kv.set('bagno_app_state', state);
    }

    // --- GESTIONE METODO GET ---
    if (req.method === 'GET') {
      return res.status(200).json(state);
    }

    // --- GESTIONE METODO POST ---
    if (req.method === 'POST') {
      const { bagno, state: newState, user, menu, turni, pin } = req.body;

      // Logica per aggiornare lo stato di un bagno
      if (bagno && newState && user) {
        if (newState === 'occupied') {
          // Occupa il bagno se è libero
          if (state[bagno] && state[bagno].state === 'free') {
            state[bagno] = { state: 'occupied', user };
          }
        } else { // newState === 'free'
          // Libera il bagno solo se l'utente è lo stesso che lo ha occupato
          if (state[bagno] && state[bagno].user === user) {
            state[bagno] = { state: 'free', user: null };
          }
        }
      }

      // Logica per aggiornare menu e turni (protetta da PIN)
      // NOTA: Aggiungi una variabile d'ambiente in Vercel chiamata APP_PIN
      if (pin === process.env.APP_PIN) {
        if (menu) {
          state.menu = menu;
        }
        if (turni) {
          state.turni = turni;
        }
      } else if (menu || turni) {
        // Se si tenta di modificare menu/turni senza PIN valido, ritorna un errore
        return res.status(401).json({ error: 'PIN non corretto per modificare menu o turni.' });
      }
      
      // Salva lo stato finale aggiornato nel database
      await kv.set('bagno_app_state', state);

      return res.status(200).json(state);
    }

    // --- GESTIONE METODI NON SUPPORTATI ---
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Metodo ${req.method} non consentito.` });

  } catch (error) {
    // --- GESTIONE ERRORI IMPREVISTI ---
    console.error('Errore nel server:', error);
    return res.status(500).json({ error: 'Errore interno del server.' });
  }
}
