'use client';

import { useMemo, useState } from 'react';
import { type Service, type CategoryKey, type CategoryMeta, CATEGORIES } from '../data/services';

type SpreadsheetSortKey = 'name' | 'category' | 'address' | 'subtype' | 'hours' | 'eligibility';
type SortDir = 'asc' | 'desc';

const CATEGORY_MAP = new Map<CategoryKey, CategoryMeta>(
  CATEGORIES.map((c) => [c.key, c])
);

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
      <mark className="bg-amber-400/30 text-amber-200 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const COLUMNS: { key: string; label: string; sortable: boolean; cls: string }[] = [
  { key: 'category',    label: 'Category',    sortable: true,  cls: 'w-44' },
  { key: 'name',        label: 'Name',         sortable: true,  cls: 'min-w-[260px]' },
  { key: 'subtype',     label: 'Subtype',      sortable: true,  cls: 'w-44' },
  { key: 'address',     label: 'Address',      sortable: true,  cls: 'min-w-[220px]' },
  { key: 'phone',       label: 'Phone',        sortable: false, cls: 'w-44' },
  { key: 'hours',       label: 'Hours',        sortable: true,  cls: 'w-28' },
  { key: 'eligibility', label: 'Eligibility',  sortable: true,  cls: 'w-48' },
  { key: 'languages',   label: 'Languages',    sortable: false, cls: 'w-36' },
  { key: 'description', label: 'Description',  sortable: false, cls: 'min-w-[280px] max-w-sm' },
  { key: 'note',        label: 'Note',         sortable: false, cls: 'w-52' },
];

const SORTABLE_OPTIONS: { value: SpreadsheetSortKey; label: string }[] = [
  { value: 'name',        label: 'Name' },
  { value: 'category',    label: 'Category' },
  { value: 'subtype',     label: 'Subtype' },
  { value: 'address',     label: 'Address' },
  { value: 'hours',       label: 'Hours' },
  { value: 'eligibility', label: 'Eligibility' },
];

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <svg className="w-3 h-3 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
    </svg>
  );
}

function MobileServiceCard({
  svc,
  query,
  meta,
  index,
}: {
  svc: Service;
  query: string;
  meta: CategoryMeta;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasExtra = !!(svc.description || svc.eligibility || svc.languages?.length || svc.note);

  return (
    <article className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden border-l-4 ${meta.borderAccent}`}>
      <div className="p-4">
        {/* Row index + badges */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1.5">
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ${meta.badgeBg} ${meta.badgeText}`}>
              {meta.label}
            </span>
            {svc.subtype && (
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] bg-slate-800 text-slate-300">
                {svc.subtype}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-600 shrink-0 mt-0.5">#{index + 1}</span>
        </div>

        {/* Name */}
        <h3 className="text-white font-semibold text-base leading-snug mb-2">
          {highlightText(svc.name, query)}
        </h3>

        {/* Address */}
        {svc.address && (
          <p className="flex items-start gap-1.5 mb-2">
            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[13px] text-slate-400 leading-snug">{highlightText(svc.address, query)}</span>
          </p>
        )}

        {/* Phone numbers — large tap targets */}
        {svc.phone?.length ? (
          <div className="flex flex-col gap-1.5 mb-2">
            {svc.phone.map((p) => (
              <a
                key={p}
                href={phoneHref(p)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 active:text-amber-200 transition-colors min-h-[36px]"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {highlightText(p, query)}
              </a>
            ))}
          </div>
        ) : null}

        {/* Hours badge */}
        {svc.hours && (
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3.5 h-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[12px] text-slate-300 font-medium">{svc.hours}</span>
          </div>
        )}

        {/* Expandable extra info */}
        {hasExtra && (
          <>
            {expanded && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
                {svc.description && (
                  <p className="text-[12px] text-slate-400 leading-relaxed">{svc.description}</p>
                )}
                {svc.eligibility && (
                  <div className="flex gap-2 text-[12px]">
                    <span className="text-slate-500 font-medium shrink-0 w-20">Eligibility</span>
                    <span className="text-slate-300">{svc.eligibility}</span>
                  </div>
                )}
                {svc.languages?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {svc.languages.map((l) => (
                      <span key={l} className="inline-flex rounded px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400">
                        {l}
                      </span>
                    ))}
                  </div>
                ) : null}
                {svc.note && (
                  <p className="text-[11px] text-slate-600 italic">{svc.note}</p>
                )}
              </div>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 inline-flex items-center gap-1 text-[12px] text-amber-400/70 hover:text-amber-300 active:text-amber-200 transition-colors min-h-[36px] -mb-1"
            >
              {expanded ? 'Show less' : 'More details'}
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default function ServicesSpreadsheet({
  services,
  query,
}: {
  services: Service[];
  query: string;
}) {
  const [sortKey, setSortKey] = useState<SpreadsheetSortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(key: SpreadsheetSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function toggleDir() {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  }

  const sorted = useMemo(() => {
    return [...services].sort((a, b) => {
      let va = '';
      let vb = '';
      switch (sortKey) {
        case 'name':        va = a.name;              vb = b.name;              break;
        case 'category':    va = a.category;           vb = b.category;          break;
        case 'address':     va = a.address ?? '';      vb = b.address ?? '';     break;
        case 'subtype':     va = a.subtype ?? '';      vb = b.subtype ?? '';     break;
        case 'hours':       va = a.hours ?? '';        vb = b.hours ?? '';       break;
        case 'eligibility': va = a.eligibility ?? '';  vb = b.eligibility ?? ''; break;
      }
      const cmp = va.localeCompare(vb);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [services, sortKey, sortDir]);

  return (
    <>
      {/* ── Mobile: card list ─────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Sort controls */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500 shrink-0">Sort by</span>
          <select
            value={sortKey}
            onChange={(e) => {
              setSortKey(e.target.value as SpreadsheetSortKey);
              setSortDir('asc');
            }}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
              appearance: 'none',
              paddingRight: '2rem',
            }}
            aria-label="Sort field"
          >
            {SORTABLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={toggleDir}
            className="shrink-0 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white active:bg-slate-700 transition-colors min-w-[42px] flex items-center justify-center"
            aria-label={sortDir === 'asc' ? 'Sort descending' : 'Sort ascending'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
            </svg>
          </button>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {sorted.map((svc, i) => {
            const meta = CATEGORY_MAP.get(svc.category)!;
            return (
              <MobileServiceCard
                key={svc.id}
                svc={svc}
                query={query}
                meta={meta}
                index={i}
              />
            );
          })}
        </div>
      </div>

      {/* ── Desktop: table ────────────────────────────────────────── */}
      <div className="hidden md:block overflow-auto rounded-xl border border-slate-800 shadow-xl shadow-black/30">
        <table className="border-collapse text-sm w-full">
          <thead>
            <tr className="bg-slate-900">
              {/* Row number header */}
              <th className="sticky left-0 z-20 bg-slate-900 px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 border-b border-r border-slate-800 w-12">
                #
              </th>

              {COLUMNS.map((col) => {
                const isActive = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className={`px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-r border-slate-800 ${col.cls} ${
                      col.sortable
                        ? 'cursor-pointer select-none hover:text-slate-300 hover:bg-slate-800/60 transition-colors'
                        : ''
                    } ${isActive ? 'text-amber-400' : ''}`}
                    onClick={col.sortable ? () => handleSort(col.key as SpreadsheetSortKey) : undefined}
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      {col.label}
                      {col.sortable && <SortIcon active={isActive} dir={sortDir} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sorted.map((svc, i) => {
              const meta = CATEGORY_MAP.get(svc.category)!;
              return (
                <tr
                  key={svc.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Row number */}
                  <td className="sticky left-0 z-10 bg-slate-950 group-hover:bg-slate-800/40 transition-colors px-3 py-2.5 text-[11px] font-mono text-slate-600 border-r border-slate-800 w-12 select-none">
                    {i + 1}
                  </td>

                  {/* Category */}
                  <td className="px-3 py-2.5 border-r border-slate-800">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap ${meta.badgeBg} ${meta.badgeText}`}
                    >
                      {meta.label}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="px-3 py-2.5 text-white font-medium leading-snug border-r border-slate-800">
                    {highlightText(svc.name, query)}
                  </td>

                  {/* Subtype */}
                  <td className="px-3 py-2.5 border-r border-slate-800">
                    {svc.subtype ? (
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] bg-slate-800 text-slate-300">
                        {svc.subtype}
                      </span>
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>

                  {/* Address */}
                  <td className="px-3 py-2.5 text-slate-400 text-[12px] leading-snug border-r border-slate-800">
                    {svc.address ? (
                      highlightText(svc.address, query)
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="px-3 py-2.5 border-r border-slate-800">
                    {svc.phone?.length ? (
                      <div className="flex flex-col gap-0.5">
                        {svc.phone.map((p) => (
                          <a
                            key={p}
                            href={phoneHref(p)}
                            className="text-amber-400 hover:text-amber-300 text-[11px] whitespace-nowrap transition-colors"
                          >
                            {highlightText(p, query)}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>

                  {/* Hours */}
                  <td className="px-3 py-2.5 text-slate-400 text-[12px] border-r border-slate-800 whitespace-nowrap">
                    {svc.hours ?? <span className="text-slate-700">—</span>}
                  </td>

                  {/* Eligibility */}
                  <td className="px-3 py-2.5 text-slate-400 text-[12px] leading-snug border-r border-slate-800">
                    {svc.eligibility ?? <span className="text-slate-700">—</span>}
                  </td>

                  {/* Languages */}
                  <td className="px-3 py-2.5 border-r border-slate-800">
                    {svc.languages?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {svc.languages.map((l) => (
                          <span
                            key={l}
                            className="inline-flex rounded px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="px-3 py-2.5 text-slate-500 text-[11px] leading-relaxed border-r border-slate-800">
                    <span className="line-clamp-2">
                      {svc.description ?? <span className="text-slate-700">—</span>}
                    </span>
                  </td>

                  {/* Note */}
                  <td className="px-3 py-2.5 text-slate-600 text-[11px] italic">
                    {svc.note ?? <span className="text-slate-700 not-italic">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
