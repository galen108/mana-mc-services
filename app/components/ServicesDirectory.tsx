'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { SERVICES, CATEGORIES, type Service, type CategoryKey, type CategoryMeta } from '../data/services';

type SortKey = 'name-asc' | 'name-desc' | 'category';

const CATEGORY_MAP = new Map<CategoryKey, CategoryMeta>(
  CATEGORIES.map((c) => [c.key, c])
);

function getCategoryMeta(key: CategoryKey): CategoryMeta {
  return CATEGORY_MAP.get(key)!;
}

function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `tel:+1${digits}`;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-400/30 text-amber-200 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function ServiceCard({ service, query, isOpen, onToggle }: {
  service: Service;
  query: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const meta = getCategoryMeta(service.category);

  return (
    <article
      className={`bg-slate-800 border border-slate-700 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-500 hover:shadow-lg hover:shadow-black/30 border-l-4 ${meta.borderAccent} flex flex-col`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
        aria-expanded={isOpen}
        aria-controls={`detail-${service.id}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide ${meta.badgeBg} ${meta.badgeText}`}>
                {meta.label}
              </span>
              {service.subtype && (
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-300">
                  {service.subtype}
                </span>
              )}
            </div>
            <h3 className="text-white font-semibold text-base leading-snug">
              {highlightText(service.name, query)}
            </h3>
            {service.address && (
              <p className="mt-1.5 text-sm text-slate-400 flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{highlightText(service.address, query)}</span>
              </p>
            )}
            {service.phone && service.phone.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {service.phone.map((p) => (
                  <a
                    key={p}
                    href={phoneHref(p)}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                    aria-label={`Call ${p}`}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {highlightText(p, query)}
                  </a>
                ))}
              </div>
            )}
          </div>
          <svg
            className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200 mt-0.5 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          id={`detail-${service.id}`}
          className="px-5 pb-5 border-t border-slate-700/60 mt-0 pt-4 space-y-3"
        >
          {service.description && (
            <p className="text-sm text-slate-300 leading-relaxed">{service.description}</p>
          )}
          <dl className="grid grid-cols-1 gap-2 text-sm">
            {service.hours && (
              <div className="flex gap-2">
                <dt className="text-slate-500 shrink-0 w-24 font-medium">Hours</dt>
                <dd className="text-slate-300">{service.hours}</dd>
              </div>
            )}
            {service.eligibility && (
              <div className="flex gap-2">
                <dt className="text-slate-500 shrink-0 w-24 font-medium">Eligibility</dt>
                <dd className="text-slate-300">{service.eligibility}</dd>
              </div>
            )}
            {service.languages && service.languages.length > 0 && (
              <div className="flex gap-2">
                <dt className="text-slate-500 shrink-0 w-24 font-medium">Languages</dt>
                <dd className="text-slate-300">{service.languages.join(', ')}</dd>
              </div>
            )}
            {service.website && (
              <div className="flex gap-2">
                <dt className="text-slate-500 shrink-0 w-24 font-medium">Website</dt>
                <dd>
                  <a href={service.website} target="_blank" rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-2 break-all"
                  >
                    {service.website}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          {service.note && (
            <p className="text-xs text-slate-500 italic border-t border-slate-700 pt-2 mt-2">{service.note}</p>
          )}
        </div>
      )}
    </article>
  );
}

export default function ServicesDirectory() {
  const [query, setQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<CategoryKey>>(new Set());
  const [sort, setSort] = useState<SortKey>('name-asc');
  const [openId, setOpenId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const toggleCategory = useCallback((key: CategoryKey) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    setOpenId(null);
  }, []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setActiveCategories(new Set());
    setOpenId(null);
    searchRef.current?.focus();
  }, []);

  const categoryCounts = useMemo(() => {
    const lq = query.toLowerCase();
    const counts = new Map<CategoryKey, number>();
    for (const s of SERVICES) {
      if (lq) {
        const hit =
          s.name.toLowerCase().includes(lq) ||
          (s.address?.toLowerCase().includes(lq) ?? false) ||
          (s.phone?.some((p) => p.toLowerCase().includes(lq)) ?? false) ||
          (s.description?.toLowerCase().includes(lq) ?? false);
        if (!hit) continue;
      }
      counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    }
    return counts;
  }, [query]);

  const filtered = useMemo(() => {
    const lq = query.toLowerCase();
    let results = SERVICES.filter((s) => {
      if (activeCategories.size > 0 && !activeCategories.has(s.category)) return false;
      if (!lq) return true;
      return (
        s.name.toLowerCase().includes(lq) ||
        (s.address?.toLowerCase().includes(lq) ?? false) ||
        (s.phone?.some((p) => p.toLowerCase().includes(lq)) ?? false) ||
        (s.description?.toLowerCase().includes(lq) ?? false) ||
        (s.subtype?.toLowerCase().includes(lq) ?? false) ||
        (s.eligibility?.toLowerCase().includes(lq) ?? false)
      );
    });

    results = [...results].sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      if (sort === 'category') {
        const catCmp = a.category.localeCompare(b.category);
        return catCmp !== 0 ? catCmp : a.name.localeCompare(b.name);
      }
      return 0;
    });

    return results;
  }, [query, activeCategories, sort]);

  const hasFilters = query !== '' || activeCategories.size > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Header ── */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-1">
                Montgomery Area · Narcotics Anonymous
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Montgomery County, MD
                <span className="text-amber-400"> Services Directory</span>
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {SERVICES.length} resources across {CATEGORIES.length} service categories
              </p>
            </div>
            <a
              href="https://pickupthepiecesmoco.org/services/"
              target="_blank"
              rel="noopener noreferrer"
              className="self-start sm:self-end inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors border border-slate-700 rounded-lg px-3 py-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Source: pickupthepiecesmoco.org
            </a>
          </div>
        </div>

        {/* ── Emergency Bar ── */}
        <div className="bg-red-950/70 border-t border-red-900/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400 shrink-0">
                Emergency
              </span>
              <a href="tel:911" className="inline-flex items-center gap-1.5 text-sm font-bold text-red-300 hover:text-red-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                911 — Medical Emergencies & Overdoses
              </a>
              <a href="tel:988" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-300 hover:text-amber-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                988 — Mental Health & Substance Use Crisis
              </a>
              <a href="tel:+12407774000" className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-300 hover:text-sky-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (240) 777-4000 — County 24/7 Crisis Center
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── Sticky Controls ── */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          {/* Search + Sort row */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpenId(null); }}
                placeholder="Search by name, address, phone, or description…"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
                aria-label="Search services"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setOpenId(null); searchRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs text-slate-500 hidden sm:block whitespace-nowrap">Sort by</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent cursor-pointer appearance-none pr-8 transition-colors"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                aria-label="Sort order"
              >
                <option value="name-asc">Name A → Z</option>
                <option value="name-desc">Name Z → A</option>
                <option value="category">By Category</option>
              </select>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
            <button
              onClick={() => { setActiveCategories(new Set()); setOpenId(null); }}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                activeCategories.size === 0
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              aria-pressed={activeCategories.size === 0}
            >
              All ({SERVICES.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = categoryCounts.get(cat.key) ?? 0;
              const isActive = activeCategories.has(cat.key);
              if (count === 0 && !isActive) return null;
              return (
                <button
                  key={cat.key}
                  onClick={() => toggleCategory(cat.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    isActive
                      ? `${cat.pillActiveBg} ${cat.pillActiveText} ring-1 ring-current`
                      : `bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700`
                  }`}
                  aria-pressed={isActive}
                >
                  {cat.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-white/20' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">
            {filtered.length === 0
              ? 'No services found'
              : `Showing ${filtered.length} of ${SERVICES.length} service${filtered.length !== 1 ? 's' : ''}`}
            {activeCategories.size > 0 && (
              <span className="text-slate-500"> · {activeCategories.size} category filter{activeCategories.size !== 1 ? 's' : ''} active</span>
            )}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <svg className="w-12 h-12 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-slate-500 text-base">No services match your search.</p>
            <button onClick={clearFilters} className="mt-3 text-sm text-amber-400 hover:text-amber-300 underline underline-offset-2">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                query={query}
                isOpen={openId === service.id}
                onToggle={() => setOpenId(openId === service.id ? null : service.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
            <p>Data sourced from <a href="https://pickupthepiecesmoco.org/services/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 underline underline-offset-2">pickupthepiecesmoco.org</a> · Montgomery County, MD</p>
            <p>Montgomery Area Service Committee of Narcotics Anonymous</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
