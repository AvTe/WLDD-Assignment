import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;            // yyyy-mm-dd
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function startDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, required }) => {
  const today = new Date();
  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectDate = (day: number, month: number, year: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${year}-${mm}-${dd}`);
    setOpen(false);
  };

  const handleToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    selectDate(today.getDate(), today.getMonth(), today.getFullYear());
  };

  const handleClear = () => { onChange(''); setOpen(false); };

  // Build calendar grid
  const dim = daysInMonth(viewYear, viewMonth);
  const sd = startDay(viewYear, viewMonth);
  const prevDim = daysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);
  const cells: { day: number; month: number; year: number; outside: boolean }[] = [];

  // Previous month's trailing days
  for (let i = sd - 1; i >= 0; i--) {
    const pm = viewMonth === 0 ? 11 : viewMonth - 1;
    const py = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: prevDim - i, month: pm, year: py, outside: true });
  }
  // Current month
  for (let d = 1; d <= dim; d++) cells.push({ day: d, month: viewMonth, year: viewYear, outside: false });
  // Next month
  const remaining = 42 - cells.length;
  const nm = viewMonth === 11 ? 0 : viewMonth + 1;
  const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, month: nm, year: ny, outside: true });

  const isSelected = (c: typeof cells[0]) =>
    parsed && c.day === parsed.getDate() && c.month === parsed.getMonth() && c.year === parsed.getFullYear();
  const isToday = (c: typeof cells[0]) =>
    c.day === today.getDate() && c.month === today.getMonth() && c.year === today.getFullYear();

  const displayVal = parsed
    ? parsed.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
    : '';

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-xl text-left focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all"
      >
        <span className={displayVal ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'}>
          {displayVal || 'dd-mm-yyyy'}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 left-0 w-[290px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl dark:shadow-black/40 p-3.5 animate-in fade-in slide-in-from-top-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {MONTHS[viewMonth]}, {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={prevMonth} className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button type="button" onClick={nextMonth} className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map((c, i) => {
              const sel = isSelected(c);
              const tod = isToday(c);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDate(c.day, c.month, c.year)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-colors
                    ${sel ? 'bg-accent text-white' : ''}
                    ${!sel && tod ? 'ring-1 ring-accent text-accent' : ''}
                    ${!sel && !tod && c.outside ? 'text-neutral-300 dark:text-neutral-600' : ''}
                    ${!sel && !tod && !c.outside ? 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800' : ''}
                  `}
                >
                  {c.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
            <button type="button" onClick={handleClear} className="text-xs font-medium text-accent hover:underline">Clear</button>
            <button type="button" onClick={handleToday} className="text-xs font-medium text-accent hover:underline">Today</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
