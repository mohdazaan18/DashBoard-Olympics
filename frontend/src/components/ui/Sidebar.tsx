import { useState, useCallback, useRef, useEffect } from 'react';
import { Filters, FilterOptions } from '../../types';

const YEAR_MIN = 1896;
const YEAR_MAX = 2016;

interface Props {
    filters: Filters;
    options: FilterOptions | null;
    onChange: (f: Filters) => void;
    theme: 'dark' | 'light';
    onThemeToggle: () => void;
}

export function Sidebar({ filters, options, onChange, theme, onThemeToggle }: Props) {
    // ── Pending (local) state ──────────────────────────────────────
    const [pending, setPending] = useState<Filters>(filters);
    const [yMin, setYMin] = useState(Number(filters.yearMin ?? YEAR_MIN));
    const [yMax, setYMax] = useState(Number(filters.yearMax ?? YEAR_MAX));

    // Reset pending when applied filters are cleared externally
    useEffect(() => {
        if (Object.keys(filters).length === 0) {
            setPending({});
            setYMin(YEAR_MIN);
            setYMax(YEAR_MAX);
        }
    }, [filters]);

    const pct = useCallback(
        (v: number) => ((v - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100,
        [],
    );

    const isDirty =
        JSON.stringify({ ...pending, yearMin: yMin > YEAR_MIN ? String(yMin) : undefined, yearMax: yMax < YEAR_MAX ? String(yMax) : undefined })
        !== JSON.stringify(filters);

    const hasPending = !!(pending.season || pending.sport || pending.country)
        || yMin > YEAR_MIN || yMax < YEAR_MAX;

    const raf = useRef<number | null>(null);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Math.min(Number(e.target.value), yMax - 4);
        setYMin(v);
    };
    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Math.max(Number(e.target.value), yMin + 4);
        setYMax(v);
    };

    const applyFilters = useCallback(() => {
        if (raf.current) cancelAnimationFrame(raf.current);
        onChange({
            ...pending,
            yearMin: yMin > YEAR_MIN ? String(yMin) : undefined,
            yearMax: yMax < YEAR_MAX ? String(yMax) : undefined,
        });
    }, [pending, yMin, yMax, onChange]);

    const clearAll = () => {
        setPending({});
        setYMin(YEAR_MIN);
        setYMax(YEAR_MAX);
        onChange({});
    };

    useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

    const rings = ['#0085C7', '#F4C300', '#2D2D2D', '#009F6B', '#DF0024'];

    return (
        <aside className="sidebar">
            {/* ── Brand + theme toggle ────────────────────────────── */}
            <div className="sidebar-brand">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 3 }}>
                            {rings.map((c, i) => (
                                <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', border: `2.5px solid ${c}` }} />
                            ))}
                        </div>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    </div>
                    <button
                        onClick={onThemeToggle}
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: 'var(--card-bg-2)', border: '1px solid var(--border)',
                            color: 'var(--text-2)', cursor: 'pointer', fontSize: 14,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', flexShrink: 0,
                        }}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.05rem', letterSpacing: '0.06em', color: 'var(--text)', lineHeight: 1.1 }}>
                    Olympic Intelligence
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                    120 Years of Athletic History
                </div>
            </div>

            {/* ── Dataset mini stats ──────────────────────────────── */}
            <div className="sidebar-section">
                <div className="sidebar-label">Dataset</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                    {[
                        { v: '271K', l: 'Records' },
                        { v: '66', l: 'Sports' },
                        { v: '230+', l: 'Nations' },
                        { v: '120yr', l: 'Span' },
                    ].map(({ v, l }) => (
                        <div key={l} style={{ background: 'var(--card-bg-2)', borderRadius: 7, padding: '7px 9px' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em' }}>{v}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Season ─────────────────────────────────────────── */}
            <div className="sidebar-section">
                <div className="sidebar-label">Season</div>
                <div className="pill-group">
                    {(['', 'Summer', 'Winter'] as const).map((s) => (
                        <button
                            key={s || 'All'}
                            className={`pill${(pending.season ?? '') === s ? ' active' : ''}`}
                            onClick={() => setPending(p => ({ ...p, season: s || undefined }))}
                        >
                            {s === '' ? 'All' : s === 'Summer' ? '☀ Sun' : '❄ Win'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Year Range ─────────────────────────────────────── */}
            <div className="sidebar-section">
                <div className="sidebar-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Year Range</span>
                    <span className="year-badge">{yMin} – {yMax}</span>
                </div>
                <div className="range-wrap">
                    <div className="range-track" />
                    <div className="range-fill" style={{ left: `${pct(yMin)}%`, width: `${pct(yMax) - pct(yMin)}%` }} />
                    <input
                        className="range-input"
                        type="range" min={YEAR_MIN} max={YEAR_MAX} step={4}
                        value={yMin} onChange={handleMinChange}
                        style={{ zIndex: yMin > YEAR_MAX - 40 ? 5 : 3 }}
                    />
                    <input
                        className="range-input"
                        type="range" min={YEAR_MIN} max={YEAR_MAX} step={4}
                        value={yMax} onChange={handleMaxChange}
                        style={{ zIndex: 4 }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                    <span>{YEAR_MIN}</span><span>{YEAR_MAX}</span>
                </div>
            </div>

            {/* ── Sport ──────────────────────────────────────────── */}
            <div className="sidebar-section">
                <div className="sidebar-label">Sport</div>
                <select
                    className={`sb-select${pending.sport ? ' active' : ''}`}
                    value={pending.sport ?? ''}
                    onChange={e => setPending(p => ({ ...p, sport: e.target.value || undefined }))}
                >
                    <option value="">All Sports</option>
                    {options?.sports.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* ── Country ────────────────────────────────────────── */}
            <div className="sidebar-section">
                <div className="sidebar-label">Country / NOC</div>
                <select
                    className={`sb-select${pending.country ? ' active' : ''}`}
                    value={pending.country ?? ''}
                    onChange={e => setPending(p => ({ ...p, country: e.target.value || undefined }))}
                >
                    <option value="">All Countries</option>
                    {options?.countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* ── Actions ────────────────────────────────────────── */}
            <div className="sidebar-section" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                    className={`apply-btn${isDirty ? ' dirty' : ''}`}
                    onClick={applyFilters}
                    disabled={!isDirty}
                >
                    {isDirty ? '● Apply Filters' : '✓ Applied'}
                </button>
                {hasPending && (
                    <button className="clear-btn" onClick={clearAll}>✕ Reset</button>
                )}
            </div>
        </aside>
    );
}
