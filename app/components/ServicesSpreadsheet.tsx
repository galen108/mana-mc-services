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

  const sorted = useMemo(() => {
    return [...services].sort((a, b) => {
      let va = '';
      let vb = '';
      switch (sortKey) {
        case 'name':        va = a.name;           vb = b.name;           break;
        case 'category':    va = a.category;        vb = b.category;       break;
        case 'address':     va = a.address ?? '';   vb = b.address ?? '';  break;
        case 'subtype':     va = a.subtype ?? '';   vb = b.subtype ?? '';  break;
        case 'hours':       va = a.hours ?? '';     vb = b.hours ?? '';    break;
        case 'eligibility': va = a.eligibility ?? ''; vb = b.eligibility ?? ''; break;
      }
      const cmp = va.localeCompare(vb);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [services, sortKey, sortDir]);

  return (
    <div className="overflow-auto rounded-xl border border-slate-800 shadow-xl shadow-black/30">
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
  );
}
