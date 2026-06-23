import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from './supabase.js';

const rowToCard = (r) => ({
  id: r.id, name: r.name, issuer: r.issuer, color: r.color,
  fee: Number(r.fee) || 0, resetType: r.reset_type,
  anniversaryDate: r.anniversary_date || '', benefits: r.benefits || [],
  sort: r.sort ?? 0,
});
const cardToRow = (c, code) => ({
  id: c.id, code, name: c.name, issuer: c.issuer || '', color: c.color || 'plum',
  fee: c.fee || 0, reset_type: c.resetType || 'calendar',
  anniversary_date: c.anniversaryDate || '', benefits: c.benefits || [],
  sort: c.sort ?? Date.now(),
});

const sortCards = (a, b) => (a.sort - b.sort) || a.name.localeCompare(b.name);

/* Ensure a household + settings row exist for this code. */
export async function ensureHousehold(code) {
  await supabase.from('households').upsert({ code }, { onConflict: 'code' });
  await supabase.from('settings').upsert({ code }, { onConflict: 'code', ignoreDuplicates: true });
}

export async function householdExists(code) {
  const { data } = await supabase.from('households').select('code').eq('code', code).maybeSingle();
  return !!data;
}

/**
 * Live household state synced through Supabase realtime.
 * Returns cards, checks (map k -> {by, at}), users, and mutators.
 */
export function useHousehold(code) {
  const [cards, setCards] = useState([]);
  const [checks, setChecks] = useState({});
  const [users, setUsers] = useState(['Me', 'Partner']);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  // initial load
  useEffect(() => {
    if (!code) return;
    let alive = true;
    setStatus('loading');
    (async () => {
      try {
        await ensureHousehold(code);
        const [c, k, s] = await Promise.all([
          supabase.from('cards').select('*').eq('code', code),
          supabase.from('checks').select('*').eq('code', code),
          supabase.from('settings').select('users').eq('code', code).maybeSingle(),
        ]);
        if (!alive) return;
        setCards((c.data || []).map(rowToCard).sort(sortCards));
        const cm = {};
        (k.data || []).forEach(r => { cm[r.k] = { by: r.checked_by, at: Number(r.checked_at) }; });
        setChecks(cm);
        if (s.data?.users) setUsers(s.data.users);
        setStatus('ready');
      } catch (e) {
        console.error(e);
        if (alive) setStatus('error');
      }
    })();
    return () => { alive = false; };
  }, [code]);

  // realtime
  useEffect(() => {
    if (!code) return;
    const ch = supabase
      .channel(`hh-${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards', filter: `code=eq.${code}` }, (p) => {
        setCards(prev => {
          if (p.eventType === 'DELETE') return prev.filter(x => x.id !== p.old.id);
          const card = rowToCard(p.new);
          const rest = prev.filter(x => x.id !== card.id);
          return [...rest, card].sort(sortCards);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checks', filter: `code=eq.${code}` }, (p) => {
        setChecks(prev => {
          const next = { ...prev };
          if (p.eventType === 'DELETE') delete next[p.old.k];
          else next[p.new.k] = { by: p.new.checked_by, at: Number(p.new.checked_at) };
          return next;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: `code=eq.${code}` }, (p) => {
        if (p.new?.users) setUsers(p.new.users);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [code]);

  /* ----- mutations (optimistic; realtime echoes reconcile) ----- */
  const addCards = useCallback((list) => {
    const stamped = list.map((c, i) => ({ ...c, sort: Date.now() + i }));
    setCards(prev => [...prev, ...stamped].sort(sortCards));
    supabase.from('cards').insert(stamped.map(c => cardToRow(c, code)))
      .then(({ error }) => error && console.error(error));
  }, [code]);

  const updateCard = useCallback((card) => {
    setCards(prev => prev.map(c => c.id === card.id ? { ...card, sort: c.sort } : c).sort(sortCards));
    const existing = cardsRef.current.find(c => c.id === card.id);
    supabase.from('cards').update(cardToRow({ ...card, sort: existing?.sort }, code)).eq('id', card.id)
      .then(({ error }) => error && console.error(error));
  }, [code]);

  const deleteCard = useCallback((id) => {
    setCards(prev => prev.filter(c => c.id !== id));
    setChecks(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.startsWith(id + '|')) delete next[k]; });
      return next;
    });
    supabase.from('checks').delete().eq('code', code).like('k', `${id}|%`).then(() => {});
    supabase.from('cards').delete().eq('id', id).then(({ error }) => error && console.error(error));
  }, [code]);

  const toggle = useCallback((k, byName) => {
    setChecks(prev => {
      const next = { ...prev };
      if (next[k]) {
        delete next[k];
        supabase.from('checks').delete().eq('code', code).eq('k', k).then(() => {});
      } else {
        const rec = { by: byName || 'Me', at: Date.now() };
        next[k] = rec;
        supabase.from('checks').upsert({ code, k, checked_by: rec.by, checked_at: rec.at }, { onConflict: 'code,k' })
          .then(({ error }) => error && console.error(error));
      }
      return next;
    });
  }, [code]);

  const saveUsers = useCallback((u) => {
    setUsers(u);
    supabase.from('settings').upsert({ code, users: u, updated_at: new Date().toISOString() }, { onConflict: 'code' })
      .then(({ error }) => error && console.error(error));
  }, [code]);

  return { cards, checks, users, status, addCards, updateCard, deleteCard, toggle, saveUsers };
}
