import React, { useState, useEffect, useMemo } from 'react';
import {
  CADENCES, CARD_COLORS, TEMPLATES, MONTHS_FULL, newBenefit,
  colorCss, lightColor, uid, money, annualPotential,
  periodsFor, currentPeriod, annualCycle, fmtDate, fmtShortDate, relTime,
  makeCode, normCode,
} from './lib/model.js';
import { useHousehold, householdExists, ensureHousehold } from './lib/store.js';

/* ----------------------------- icons ----------------------------- */
const Ic = {
  plus:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 13l4 4L19 7"/></svg>,
  chev:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 6l6 6-6 6"/></svg>,
  edit:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>,
  trash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>,
  x:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  cal:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  spark: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z"/></svg>,
  share: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>,
  copy:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
};

/* ----------------------------- primitives ----------------------------- */
function CheckCircle({ checked, current, onClick, size = 26 }) {
  return (
    <button onClick={onClick} className="shrink-0 grid place-items-center rounded-full transition active:scale-90" style={{ width: size, height: size }}>
      <span className="grid place-items-center rounded-full transition-all" style={{
        width: size, height: size,
        border: checked ? 'none' : `2px solid ${current ? '#0a84ff' : '#c7c7cc'}`,
        background: checked ? (current ? '#0a84ff' : '#34c759') : 'transparent', color: '#fff',
      }}>
        {checked && <Ic.check style={{ width: size * 0.6, height: size * 0.6 }} className="pop" />}
      </span>
    </button>
  );
}

function Pill({ children, tone = 'gray' }) {
  const tones = {
    gray:'bg-gray-100 text-gray-500', blue:'bg-blue-50 text-blue-600',
    green:'bg-green-50 text-green-600', amber:'bg-amber-50 text-amber-700', purple:'bg-purple-50 text-purple-600',
  };
  return <span className={`text-[11px] font-semibold px-2 py-[3px] rounded-full ${tones[tone]}`}>{children}</span>;
}

function SectionHead({ title, count, accent }) {
  return (
    <div className="flex items-center gap-2 px-1 mb-2">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-gray-500">{title}</h2>
      {typeof count === 'number' &&
        <span className={`text-[11px] font-bold px-1.5 py-px rounded-full ${accent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{count}</span>}
    </div>
  );
}
function Empty({ title, sub }) {
  return (
    <div className="text-center py-20 fade-in">
      <div className="text-5xl mb-3">🪪</div>
      <div className="font-semibold text-gray-700">{title}</div>
      <div className="text-sm text-gray-400 mt-1">{sub}</div>
    </div>
  );
}
function Field({ label, children }) {
  return <div><div className="text-[12px] font-bold uppercase tracking-wide text-gray-500 mb-1.5 px-1">{label}</div>{children}</div>;
}
function Seg({ active, onClick, children }) {
  return <button onClick={onClick} className={`rounded-xl py-2.5 text-sm font-semibold transition ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{children}</button>;
}

/* ----------------------------- hero ----------------------------- */
function Hero({ stats, now }) {
  return (
    <div className="relative overflow-hidden rounded-[26px] metal text-white p-5 sm:p-6">
      <div className="absolute inset-0 sheen pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 text-white/55 text-xs font-semibold tracking-wide uppercase">
          <Ic.spark style={{ width: 14, height: 14 }} className="text-amber-300" /> Available to claim now
        </div>
        <div className="mt-1 flex items-end gap-3">
          <div className="text-[44px] leading-none font-bold tracking-tight">{money(stats.claimable)}</div>
          {stats.claimableCount > 0 &&
            <div className="mb-1 text-white/60 text-sm font-medium">{stats.claimableCount} {stats.claimableCount === 1 ? 'benefit' : 'benefits'} live</div>}
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-white/10">
          <Stat label={`Captured ${now.getFullYear()}`} value={money(stats.captured)} sub={`of ${money(stats.potential)}`} />
          <Stat label="Annual potential" value={money(stats.potential)} sub="all credits" />
          <Stat label="Annual fees" value={money(stats.fees)} sub={`${stats.cardCount} cards`} />
          <Stat label="Net captured" value={money(stats.net)} sub="value − fees" tone={stats.net >= 0 ? 'pos' : 'neg'} />
        </div>
      </div>
    </div>
  );
}
function Stat({ label, value, sub, tone }) {
  const color = tone === 'pos' ? 'text-emerald-300' : tone === 'neg' ? 'text-rose-300' : 'text-white';
  return (
    <div className="bg-[#1a1d24]/70 px-3.5 py-3">
      <div className="text-[10.5px] uppercase tracking-wide text-white/45 font-semibold">{label}</div>
      <div className={`mt-1 text-lg font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-[11px] text-white/40">{sub}</div>
    </div>
  );
}

/* ----------------------------- To-Do view ----------------------------- */
function TodoView({ cards, checks, now, toggle }) {
  const items = [];
  cards.forEach(card => {
    card.benefits.forEach(b => {
      if (b.cadence === 'perk') return;
      const p = currentPeriod(card, b, now);
      if (!p) return;
      const key = `${card.id}|${b.id}|${p.key}`;
      const rec = checks[key];
      items.push({ card, b, p, key, checked: !!rec, rec });
    });
  });
  const todo = items.filter(i => !i.checked);
  const done = items.filter(i => i.checked).sort((a, b) => (b.rec?.at || 0) - (a.rec?.at || 0));

  const periodLabel = (b, p) => b.cadence === 'annual' ? (p.renews ? `renews ${fmtShortDate(p.renews.renews)}` : 'this year')
    : b.cadence === 'monthly' ? p.full.split(' ')[0]
    : p.label;

  if (items.length === 0) return <Empty title="Nothing to track yet" sub="Add a card to start your checklist." />;

  return (
    <div className="space-y-6 fade-in">
      <div>
        <SectionHead title="To-Do" count={todo.length} accent />
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
          {todo.length === 0 && <div className="px-4 py-8 text-center text-gray-400 text-sm">🎉 All caught up for this period.</div>}
          {todo.map(i => (
            <Row key={i.key} {...i} meta={`${i.card.name} · ${periodLabel(i.b, i.p)}`} onToggle={() => toggle(i.key)} cardColor={i.card.color} />
          ))}
        </div>
      </div>

      {done.length > 0 &&
        <div>
          <SectionHead title="Done this period" count={done.length} />
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            {done.map(i => (
              <Row key={i.key} {...i} dim meta={`${i.card.name} · ${i.rec?.by || '?'} · ${i.rec?.at ? relTime(i.rec.at, now) : ''}`} onToggle={() => toggle(i.key)} cardColor={i.card.color} />
            ))}
          </div>
        </div>}
    </div>
  );
}

function Row({ b, checked, onToggle, meta, dim, cardColor }) {
  return (
    <div className={`flex items-center gap-3 px-3.5 py-3 ${dim ? 'opacity-60' : ''}`}>
      <CheckCircle checked={checked} current={!checked} onClick={onToggle} />
      <span className="w-1.5 h-9 rounded-full shrink-0" style={{ background: colorCss(cardColor) }} />
      <div className="min-w-0 flex-1">
        <div className={`font-semibold text-[15px] leading-tight ${checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>{b.name}</div>
        <div className="text-[12.5px] text-gray-400 truncate">{meta}</div>
      </div>
      <div className={`text-[15px] font-bold tabular-nums ${checked ? 'text-gray-300' : 'text-gray-900'}`}>{money(b.value)}</div>
    </div>
  );
}

/* ----------------------------- All Cards view ----------------------------- */
function CardsView({ cards, checks, now, toggle, onEdit, onDelete, expanded, setExpanded }) {
  if (cards.length === 0) return <Empty title="No cards yet" sub="Tap + to add your first card." />;
  return (
    <div className="space-y-3 fade-in">
      {cards.map(card => (
        <CardRow key={card.id} card={card} checks={checks} now={now} toggle={toggle}
          onEdit={() => onEdit(card)} onDelete={() => onDelete(card)}
          open={expanded === card.id} setOpen={() => setExpanded(expanded === card.id ? null : card.id)} />
      ))}
    </div>
  );
}

function CardRow({ card, checks, now, toggle, onEdit, onDelete, open, setOpen }) {
  const creditable = card.benefits.filter(b => b.cadence !== 'perk');
  let captured = 0, potential = 0;
  creditable.forEach(b => {
    potential += annualPotential(b);
    periodsFor(card, b, now).forEach(p => { if (checks[`${card.id}|${b.id}|${p.key}`]) captured += b.value; });
  });
  const liveCount = creditable.reduce((acc, b) => {
    const p = currentPeriod(card, b, now);
    return acc + (p && !checks[`${card.id}|${b.id}|${p.key}`] ? 1 : 0);
  }, 0);
  const pct = potential > 0 ? Math.min(100, Math.round(captured / potential * 100)) : 0;
  const needsDate = card.resetType === 'anniversary' && !card.anniversaryDate && creditable.some(b => b.cadence === 'annual');
  const light = lightColor(card.color);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button onClick={setOpen} className="w-full flex items-center gap-3.5 p-3.5 text-left">
        <div className="relative w-14 h-9 rounded-lg shrink-0 overflow-hidden shadow-inner" style={{ background: colorCss(card.color) }}>
          <div className="absolute inset-0 sheen" />
          <div className={`absolute bottom-1 left-1.5 w-4 h-2.5 rounded-[2px] ${light ? 'bg-black/20' : 'bg-white/30'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[15px] text-gray-900 truncate">{card.name}</span>
            {liveCount > 0 && <Pill tone="blue">{liveCount} live</Pill>}
          </div>
          <div className="text-[12.5px] text-gray-400 truncate">
            {card.issuer ? card.issuer + ' · ' : ''}{money(card.fee)}/yr · {money(captured)} of {money(potential)} captured
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? '#34c759' : '#0a84ff' }} />
          </div>
        </div>
        <Ic.chev style={{ width: 18, height: 18 }} className={`text-gray-300 transition ${open ? 'rotate-90' : ''}`} />
      </button>

      {open &&
        <div className="px-3.5 pb-4 fade-in">
          {needsDate &&
            <div className="mb-3 flex items-center justify-between gap-2 text-[12.5px] bg-amber-50 text-amber-800 rounded-xl px-3 py-2">
              <span className="flex items-center gap-1.5"><Ic.cal style={{ width: 15, height: 15 }} /> Set a reset date to anchor annual benefits</span>
              <button onClick={onEdit} className="font-semibold text-amber-900 underline shrink-0">Set</button>
            </div>}

          <div className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-2 flex items-center gap-2">
            <span>Reset:</span>
            <span className="text-gray-600">{card.resetType === 'calendar' ? 'Calendar year (Jan 1)' :
              card.anniversaryDate ? `Anniversary · ${fmtDate(annualCycle(card, now).renews)}` : 'Anniversary (no date)'}</span>
          </div>

          <div className="space-y-3">
            {card.benefits.map(b => <Punchcard key={b.id} card={card} b={b} now={now} checks={checks} toggle={toggle} />)}
            {card.benefits.length === 0 && <div className="text-sm text-gray-400 py-2">No benefits yet — edit the card to add some.</div>}
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl py-2.5 active:scale-[.98] transition">
              <Ic.edit style={{ width: 15, height: 15 }} /> Edit card
            </button>
            <button onClick={onDelete} className="px-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl py-2.5 active:scale-[.98] transition">
              <Ic.trash style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>}
    </div>
  );
}

function Punchcard({ card, b, now, checks, toggle }) {
  const perks = b.cadence === 'perk';
  const periods = periodsFor(card, b, now);
  const used = periods.reduce((a, p) => a + (checks[`${card.id}|${b.id}|${p.key}`] ? 1 : 0), 0);
  const n = CADENCES[b.cadence].n;
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-[14px] text-gray-900 flex items-center gap-2">
            {b.name}{perks && <Pill tone="purple">Perk</Pill>}
          </div>
          {b.note && <div className="text-[12px] text-gray-400 leading-snug">{b.note}</div>}
        </div>
        <div className="text-right shrink-0">
          <div className="text-[14px] font-bold text-gray-900 tabular-nums">{perks ? (b.value ? money(b.value) : '—') : money(b.value)}</div>
          <div className="text-[11px] text-gray-400">{perks ? 'info' : `${money(annualPotential(b))}/yr`}</div>
        </div>
      </div>

      {!perks &&
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {periods.map(p => {
              const key = `${card.id}|${b.id}|${p.key}`;
              const checked = !!checks[key];
              return (
                <button key={p.key} onClick={() => toggle(key)} title={p.full}
                  className="grid place-items-center rounded-lg text-[10.5px] font-bold transition active:scale-90"
                  style={{
                    width: b.cadence === 'monthly' ? 30 : b.cadence === 'annual' ? 'auto' : 46,
                    padding: b.cadence === 'annual' ? '0 12px' : 0, height: 30,
                    background: checked ? '#34c759' : '#f2f2f7',
                    color: checked ? '#fff' : (p.isCurrent ? '#0a84ff' : '#9ca3af'),
                    boxShadow: p.isCurrent && !checked ? 'inset 0 0 0 2px #0a84ff' : 'none',
                  }}>
                  {checked ? <Ic.check style={{ width: 14, height: 14 }} /> : p.label}
                </button>
              );
            })}
          </div>
          <div className="text-[12px] font-semibold text-gray-400 shrink-0 tabular-nums">{used}/{n}</div>
        </div>}
    </div>
  );
}

/* ----------------------------- modal shell ----------------------------- */
function Modal({ title, children, footer, onClose }) {
  useEffect(() => {
    const f = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-[#f7f7f9] sm:rounded-3xl rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl fade-in">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200/70 shrink-0">
          <button onClick={onClose} className="text-blue-500 font-medium text-[15px]">Cancel</button>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <div className="w-12" />
        </div>
        <div className="overflow-y-auto p-4 flex-1 no-scrollbar">{children}</div>
        {footer && <div className="p-4 border-t border-gray-200/70 shrink-0 bg-[#f7f7f9]/95 backdrop-blur">{footer}</div>}
      </div>
    </div>
  );
}

/* ----------------------------- card editor ----------------------------- */
function CardEditor({ initial, onSave, onClose }) {
  const blank = { id: uid(), name: '', issuer: '', color: 'plum', fee: 0, resetType: 'calendar', anniversaryDate: '', benefits: [] };
  const [step, setStep] = useState(initial ? 'edit' : 'template');
  const [c, setC] = useState(initial ? JSON.parse(JSON.stringify(initial)) : blank);
  const [qty, setQty] = useState(1);

  const set = (k, v) => setC(p => ({ ...p, [k]: v }));
  const setBenefit = (id, k, v) => setC(p => ({ ...p, benefits: p.benefits.map(b => b.id === id ? { ...b, [k]: v } : b) }));
  const addBenefit = () => setC(p => ({ ...p, benefits: [...p.benefits, newBenefit()] }));
  const delBenefit = (id) => setC(p => ({ ...p, benefits: p.benefits.filter(b => b.id !== id) }));

  const pickTemplate = (t) => { setC({ ...JSON.parse(JSON.stringify(t)), id: uid(), anniversaryDate: '' }); setStep('edit'); };

  const canSave = c.name.trim().length > 0;
  const submit = () => {
    if (!canSave) return;
    const copies = Math.max(1, Math.min(20, parseInt(qty) || 1));
    const list = [];
    const count = initial ? 1 : copies;
    for (let i = 0; i < count; i++) {
      list.push({
        ...JSON.parse(JSON.stringify(c)),
        id: i === 0 && initial ? c.id : uid(),
        name: count > 1 ? `${c.name.trim()} #${i + 1}` : c.name.trim(),
        benefits: c.benefits.map(b => ({ ...b, id: uid() })),
      });
    }
    onSave(list, !!initial);
  };

  return (
    <Modal onClose={onClose} title={initial ? 'Edit card' : 'Add card'}
      footer={step === 'edit' &&
        <div className="flex items-center gap-2">
          {!initial &&
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-2.5 py-2">
              <span className="text-[12px] text-gray-500 font-medium">Qty</span>
              <input type="number" min="1" max="20" value={qty} onChange={e => setQty(e.target.value)} className="w-10 bg-transparent text-center font-bold text-gray-900 outline-none" />
            </div>}
          <button disabled={!canSave} onClick={submit} className="flex-1 bg-blue-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl py-3 active:scale-[.99] transition">
            {initial ? 'Save changes' : parseInt(qty) > 1 ? `Add ${parseInt(qty)} cards` : 'Add card'}
          </button>
        </div>}>

      {step === 'template' &&
        <div className="space-y-2.5">
          <p className="text-sm text-gray-500 px-1">Start from a template, or build a custom card.</p>
          {TEMPLATES.map((t, i) => (
            <button key={i} onClick={() => pickTemplate(t)} className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 text-left active:scale-[.99] transition hover:border-gray-200">
              <div className="relative w-12 h-8 rounded-lg shrink-0 overflow-hidden" style={{ background: colorCss(t.color) }}><div className="absolute inset-0 sheen" /></div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 text-[15px]">{t.name}</div>
                <div className="text-[12.5px] text-gray-400">{t.issuer || 'Custom'} · {t.fee ? money(t.fee) + '/yr · ' : ''}{t.benefits.length} {t.benefits.length === 1 ? 'benefit' : 'benefits'}</div>
              </div>
              <Ic.chev style={{ width: 16, height: 16 }} className="text-gray-300" />
            </button>
          ))}
        </div>}

      {step === 'edit' &&
        <div className="space-y-4">
          <Field label="Card name">
            <input value={c.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Platinum (mine)" className="w-full bg-gray-100 rounded-xl px-3.5 py-2.5 outline-none font-medium text-gray-900 focus:ring-2 ring-blue-400" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Issuer"><input value={c.issuer} onChange={e => set('issuer', e.target.value)} placeholder="Amex" className="w-full bg-gray-100 rounded-xl px-3.5 py-2.5 outline-none font-medium text-gray-900 focus:ring-2 ring-blue-400" /></Field>
            <Field label="Annual fee ($)"><input type="number" value={c.fee} onChange={e => set('fee', Number(e.target.value) || 0)} className="w-full bg-gray-100 rounded-xl px-3.5 py-2.5 outline-none font-medium text-gray-900 focus:ring-2 ring-blue-400" /></Field>
          </div>

          <Field label="Card color">
            <div className="flex flex-wrap gap-2">
              {CARD_COLORS.map(col => (
                <button key={col.id} onClick={() => set('color', col.id)} title={col.name} className={`w-9 h-9 rounded-xl transition ${c.color === col.id ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : ''}`} style={{ background: col.css }} />
              ))}
            </div>
          </Field>

          <Field label="Resets on">
            <div className="grid grid-cols-2 gap-2">
              <Seg active={c.resetType === 'calendar'} onClick={() => set('resetType', 'calendar')}>Calendar year</Seg>
              <Seg active={c.resetType === 'anniversary'} onClick={() => set('resetType', 'anniversary')}>Card anniversary</Seg>
            </div>
            {c.resetType === 'anniversary' &&
              <div className="mt-2">
                <input type="date" value={c.anniversaryDate || ''} onChange={e => set('anniversaryDate', e.target.value)} className="w-full bg-gray-100 rounded-xl px-3.5 py-2.5 outline-none font-medium text-gray-900 focus:ring-2 ring-blue-400" />
                <p className="text-[11.5px] text-gray-400 mt-1 px-1">Anchors annual benefits. Monthly / quarterly / semi-annual stay on the calendar.</p>
              </div>}
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[12px] font-bold uppercase tracking-wide text-gray-500">Benefits</span>
              <button onClick={addBenefit} className="text-blue-500 font-semibold text-sm flex items-center gap-1"><Ic.plus style={{ width: 15, height: 15 }} />Add</button>
            </div>
            <div className="space-y-2.5">
              {c.benefits.map(b => (
                <div key={b.id} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input value={b.name} onChange={e => setBenefit(b.id, 'name', e.target.value)} placeholder="Benefit name" className="flex-1 bg-white rounded-lg px-3 py-2 outline-none font-semibold text-gray-900 text-sm focus:ring-2 ring-blue-400" />
                    <button onClick={() => delBenefit(b.id)} className="text-gray-300 hover:text-rose-500 p-1"><Ic.trash style={{ width: 17, height: 17 }} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input type="number" value={b.value} onChange={e => setBenefit(b.id, 'value', Number(e.target.value) || 0)} className="w-full bg-white rounded-lg pl-7 pr-3 py-2 outline-none text-sm text-gray-900 focus:ring-2 ring-blue-400" />
                    </div>
                    <select value={b.cadence} onChange={e => setBenefit(b.id, 'cadence', e.target.value)} className="w-full bg-white rounded-lg px-3 py-2 outline-none text-sm text-gray-900 focus:ring-2 ring-blue-400">
                      {Object.entries(CADENCES).map(([k, v]) => <option key={k} value={k}>{v.label}{v.n > 1 ? ` · ${v.n} boxes` : ''}</option>)}
                    </select>
                  </div>
                  <input value={b.note || ''} onChange={e => setBenefit(b.id, 'note', e.target.value)} placeholder="Note (optional)" className="w-full bg-white rounded-lg px-3 py-2 outline-none text-sm text-gray-500 focus:ring-2 ring-blue-400" />
                  <div className="text-[11px] text-gray-400 px-1">
                    {b.cadence === 'perk' ? 'Info only — no checkboxes' : `${money(b.value)} × ${CADENCES[b.cadence].n} = ${money(annualPotential(b))}/yr`}
                  </div>
                </div>
              ))}
              {c.benefits.length === 0 && <div className="text-sm text-gray-400 text-center py-3">No benefits yet.</div>}
            </div>
          </div>
        </div>}
    </Modal>
  );
}

/* ----------------------------- misc modals ----------------------------- */
function Confirm({ text, onYes, onNo }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onNo} />
      <div className="relative bg-white rounded-2xl p-5 w-full max-w-xs text-center shadow-2xl pop">
        <div className="font-semibold text-gray-900">{text}</div>
        <div className="mt-4 flex gap-2">
          <button onClick={onNo} className="flex-1 bg-gray-100 text-gray-700 font-semibold rounded-xl py-2.5">Cancel</button>
          <button onClick={onYes} className="flex-1 bg-rose-500 text-white font-semibold rounded-xl py-2.5">Delete</button>
        </div>
      </div>
    </div>
  );
}

function NameEditor({ users, saveUsers, onClose }) {
  const [a, setA] = useState(users[0]); const [b, setB] = useState(users[1]);
  return (
    <Modal title="Who's using this?" onClose={onClose}
      footer={<button onClick={() => { saveUsers([a.trim() || 'Me', b.trim() || 'Partner']); onClose(); }} className="w-full bg-blue-500 text-white font-bold rounded-xl py-3">Save names</button>}>
      <p className="text-sm text-gray-500 mb-4 px-1">Tap your avatar before checking things off so you both know who claimed what.</p>
      <Field label="Person 1"><input value={a} onChange={e => setA(e.target.value)} className="w-full bg-gray-100 rounded-xl px-3.5 py-2.5 outline-none font-medium focus:ring-2 ring-blue-400" /></Field>
      <div className="h-3" />
      <Field label="Person 2"><input value={b} onChange={e => setB(e.target.value)} className="w-full bg-gray-100 rounded-xl px-3.5 py-2.5 outline-none font-medium focus:ring-2 ring-blue-400" /></Field>
    </Modal>
  );
}

function ShareSheet({ code, onLeave, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `${location.origin}${location.pathname}#${code}`;
  const copy = (text) => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <Modal title="Share with your partner" onClose={onClose}
      footer={<button onClick={onLeave} className="w-full bg-rose-50 text-rose-600 font-semibold rounded-xl py-3">Leave this household</button>}>
      <p className="text-sm text-gray-500 mb-4 px-1">Anyone with this code sees the same shared list, live. Send it to your partner and they tap “Join”.</p>
      <Field label="Household code">
        <button onClick={() => copy(code)} className="w-full flex items-center justify-between bg-gray-100 rounded-xl px-3.5 py-3 active:scale-[.99] transition">
          <span className="font-bold text-gray-900 tracking-wide text-lg">{code}</span>
          <span className="text-blue-500 flex items-center gap-1.5 text-sm font-semibold"><Ic.copy style={{ width: 16, height: 16 }} />{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </Field>
      <div className="h-3" />
      <Field label="Or share a link">
        <button onClick={() => copy(url)} className="w-full flex items-center justify-between bg-gray-100 rounded-xl px-3.5 py-3 active:scale-[.99] transition">
          <span className="text-gray-600 text-sm truncate mr-2">{url}</span>
          <span className="text-blue-500 shrink-0"><Ic.share style={{ width: 18, height: 18 }} /></span>
        </button>
      </Field>
    </Modal>
  );
}

/* ----------------------------- join / create gate ----------------------------- */
function Gate({ onEnter }) {
  const [mode, setMode] = useState('home'); // home | join
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const create = async () => {
    setBusy(true);
    const code = makeCode();
    await ensureHousehold(code);
    onEnter(code);
  };
  const join = async () => {
    const code = normCode(input);
    if (!code) return;
    setBusy(true); setErr('');
    const exists = await householdExists(code);
    if (exists) onEnter(code);
    else { setBusy(false); setErr("No household with that code. Check the spelling, or create a new one."); }
  };

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-sm fade-in">
        <div className="relative overflow-hidden rounded-[26px] metal text-white p-6 mb-6">
          <div className="absolute inset-0 sheen" />
          <div className="relative">
            <div className="flex items-center gap-2 text-amber-300"><Ic.spark style={{ width: 22, height: 22 }} /></div>
            <h1 className="text-3xl font-bold tracking-tight mt-3">Perked</h1>
            <p className="text-white/55 text-sm mt-1 leading-snug">Track every card credit you and your partner actually use — synced live, on both your phones.</p>
          </div>
        </div>

        {mode === 'home' &&
          <div className="space-y-2.5">
            <button onClick={create} disabled={busy} className="w-full bg-blue-500 text-white font-bold rounded-2xl py-3.5 active:scale-[.99] transition disabled:opacity-60">
              {busy ? 'Creating…' : 'Create a household'}
            </button>
            <button onClick={() => setMode('join')} className="w-full bg-white text-gray-800 font-semibold rounded-2xl py-3.5 shadow-sm active:scale-[.99] transition">
              Join with a code
            </button>
            <p className="text-center text-[12.5px] text-gray-400 pt-2 px-4">Create one, then share the code with your partner so you both see the same list.</p>
          </div>}

        {mode === 'join' &&
          <div className="space-y-3 fade-in">
            <input autoFocus value={input} onChange={e => { setInput(e.target.value); setErr(''); }} onKeyDown={e => e.key === 'Enter' && join()}
              placeholder="e.g. swift-otter-4821" className="w-full bg-white rounded-2xl px-4 py-3.5 outline-none font-semibold text-gray-900 shadow-sm focus:ring-2 ring-blue-400" />
            {err && <p className="text-[12.5px] text-rose-500 px-1">{err}</p>}
            <button onClick={join} disabled={busy || !input.trim()} className="w-full bg-blue-500 text-white font-bold rounded-2xl py-3.5 active:scale-[.99] transition disabled:opacity-50">
              {busy ? 'Joining…' : 'Join'}
            </button>
            <button onClick={() => { setMode('home'); setErr(''); }} className="w-full text-gray-500 font-medium py-2">Back</button>
          </div>}
      </div>
    </div>
  );
}

/* ----------------------------- top bar bits ----------------------------- */
function UserSwitch({ users, me, setMe, onEdit }) {
  const colors = ['bg-blue-500', 'bg-pink-500'];
  return (
    <div className="flex items-center gap-1.5 bg-white rounded-full p-1 shadow-sm">
      {users.map((u, i) => (
        <button key={i} onClick={() => setMe(i)} title={u} className={`w-9 h-9 rounded-full grid place-items-center font-bold text-sm transition ${me === i ? colors[i % 2] + ' text-white scale-105' : 'bg-gray-100 text-gray-400'}`}>
          {(u[0] || '?').toUpperCase()}
        </button>
      ))}
      <button onClick={onEdit} className="w-7 h-9 grid place-items-center text-gray-300"><Ic.edit style={{ width: 14, height: 14 }} /></button>
    </div>
  );
}

/* ----------------------------- App ----------------------------- */
export default function App() {
  const [code, setCode] = useState(() => {
    const fromHash = normCode(location.hash.replace('#', ''));
    return fromHash || localStorage.getItem('perked.code') || '';
  });
  const [me, setMe] = useState(() => Number(localStorage.getItem('perked.me') || 0));
  const [view, setView] = useState('todo');
  const [editor, setEditor] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [editingNames, setEditingNames] = useState(false);
  const [sharing, setSharing] = useState(false);

  const now = useMemo(() => new Date(), []);
  const hh = useHousehold(code);
  const { cards, checks, users, status, addCards, updateCard, deleteCard, toggle, saveUsers } = hh;

  useEffect(() => { if (code) localStorage.setItem('perked.code', code); }, [code]);
  useEffect(() => { localStorage.setItem('perked.me', String(me)); }, [me]);

  const enter = (c) => { setCode(c); history.replaceState(null, '', location.pathname); };
  const leave = () => { localStorage.removeItem('perked.code'); setCode(''); setSharing(false); };

  const stats = useMemo(() => {
    let claimable = 0, claimableCount = 0, captured = 0, potential = 0, fees = 0;
    cards.forEach(card => {
      fees += card.fee || 0;
      card.benefits.forEach(b => {
        if (b.cadence === 'perk') return;
        potential += annualPotential(b);
        periodsFor(card, b, now).forEach(p => { if (checks[`${card.id}|${b.id}|${p.key}`]) captured += b.value; });
        const cp = currentPeriod(card, b, now);
        if (cp && !checks[`${card.id}|${b.id}|${cp.key}`]) { claimable += b.value; claimableCount++; }
      });
    });
    return { claimable, claimableCount, captured, potential, fees, net: captured - fees, cardCount: cards.length };
  }, [cards, checks, now]);

  if (!code) return <Gate onEnter={enter} />;

  const saveCards = (list, isEdit) => {
    if (isEdit) updateCard(list[0]); else addCards(list);
    setEditor(null);
  };
  const removeCard = (card) => { deleteCard(card.id); setConfirm(null); };

  return (
    <div className="min-h-screen pb-28">
      <div className="max-w-xl mx-auto px-3 sm:px-4 pt-5">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-gray-900 leading-none">Perked</h1>
            <button onClick={() => setSharing(true)} className="text-[13px] text-gray-400 mt-0.5 flex items-center gap-1 active:text-blue-500">
              <Ic.share style={{ width: 12, height: 12 }} /> {code}
            </button>
          </div>
          <UserSwitch users={users} me={me} setMe={setMe} onEdit={() => setEditingNames(true)} />
        </div>

        <Hero stats={stats} now={now} />

        {status === 'loading' &&
          <div className="text-center text-gray-400 text-sm py-10 flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="spin" style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.2-8.5" strokeLinecap="round" /></svg>
            Syncing…
          </div>}
        {status === 'error' &&
          <div className="text-center text-rose-500 text-sm py-10">Couldn’t reach the server. Check your connection.</div>}

        {status === 'ready' && <>
          <div className="sticky top-2 z-10 mt-4 mb-4">
            <div className="bg-gray-200/80 backdrop-blur rounded-xl p-1 flex">
              {[['todo', 'To-Do'], ['cards', 'All Cards']].map(([v, label]) => (
                <button key={v} onClick={() => setView(v)} className={`flex-1 py-2 rounded-lg text-[14px] font-semibold transition ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{label}</button>
              ))}
            </div>
          </div>

          {view === 'todo'
            ? <TodoView cards={cards} checks={checks} now={now} toggle={(k) => toggle(k, users[me])} />
            : <CardsView cards={cards} checks={checks} now={now} toggle={(k) => toggle(k, users[me])}
                onEdit={(c) => setEditor({ initial: c })} onDelete={(c) => setConfirm(c)} expanded={expanded} setExpanded={setExpanded} />}
        </>}
      </div>

      <button onClick={() => setEditor({})} className="fixed bottom-6 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-8 z-30 bg-blue-500 text-white rounded-full shadow-xl shadow-blue-500/30 px-5 py-3.5 flex items-center gap-2 font-bold active:scale-95 transition">
        <Ic.plus style={{ width: 20, height: 20 }} /> Add card
      </button>

      {editor && <CardEditor initial={editor.initial} onSave={saveCards} onClose={() => setEditor(null)} />}
      {confirm && <Confirm text={`Delete "${confirm.name}"? Its checked benefits will be removed.`} onYes={() => removeCard(confirm)} onNo={() => setConfirm(null)} />}
      {editingNames && <NameEditor users={users} saveUsers={saveUsers} onClose={() => setEditingNames(false)} />}
      {sharing && <ShareSheet code={code} onLeave={leave} onClose={() => setSharing(false)} />}
    </div>
  );
}
