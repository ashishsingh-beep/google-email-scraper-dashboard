import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Assumptions based on backend: table name 'email_table' with columns 'email' and 'created_at'
const TABLE = 'email_table';
const UI_LIMIT = 100;
const CSV_PAGE_SIZE = 1000;

function formatIST(dateIso) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(new Date(dateIso));
  } catch {
    return String(dateIso);
  }
}

function istBounds(dateIso) {
  // Returns UTC ISO bounds for the provided IST calendar day
  if (!dateIso) return null;
  try {
    const start = new Date(`${dateIso}T00:00:00+05:30`);
    const end = new Date(`${dateIso}T23:59:59.999+05:30`);
    return { startUtc: start.toISOString(), endUtc: end.toISOString() };
  } catch {
    return null;
  }
}

export default function SupabaseDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState(''); // YYYY-MM-DD (IST)
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const bounds = istBounds(filterDate);
      let query = supabase
        .from(TABLE)
        .select('email, created_at');

      if (bounds) {
        query = query
          .gte('created_at', bounds.startUtc)
          .lt('created_at', bounds.endUtc);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(UI_LIMIT);
      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    load();
    // Optionally refresh every 30s
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const downloadCsv = async () => {
    setDownloading(true);
    setError('');
    const header = 'email,created_at_ist\n';
    try {
      const bounds = istBounds(filterDate);
      const allRows = [];

      for (let from = 0; ; from += CSV_PAGE_SIZE) {
        let query = supabase
          .from(TABLE)
          .select('email, created_at');

        if (bounds) {
          query = query
            .gte('created_at', bounds.startUtc)
            .lt('created_at', bounds.endUtc);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .range(from, from + CSV_PAGE_SIZE - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        allRows.push(...data);
        if (data.length < CSV_PAGE_SIZE) break;
      }

      if (allRows.length === 0) {
        setError('No rows match the current filter.');
        return;
      }

      const content = allRows.map(r => {
        const email = (r.email || '').replace(/"/g, '""');
        const ts = formatIST(r.created_at).replace(/"/g, '""');
        return `"${email}","${ts}"`;
      }).join('\n');

      const blob = new Blob([header + content + '\n'], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'supabase_emails.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || 'Failed to download CSV');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-5 rounded-xl border card-hover fade-in mb-6 overflow-x-auto bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-blue-600 dark:text-blue-400">Supabase Dashboard</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Filter by date (IST):</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          />
          {filterDate && (
            <button onClick={() => setFilterDate('')} className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm">Clear</button>
          )}
          <button onClick={load} disabled={loading} className={`px-3 py-1 rounded bg-indigo-600 text-white ${loading ? 'opacity-60' : 'hover:bg-indigo-700'}`}>Refresh</button>
          <button
            onClick={downloadCsv}
            disabled={downloading}
            className={`px-3 py-1 rounded bg-emerald-600 text-white ${downloading ? 'opacity-60' : 'hover:bg-emerald-700'}`}
          >
            {downloading ? 'Downloading…' : 'Download CSV'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600">{error}</div>
      )}

      <div className="text-sm text-gray-700 dark:text-gray-300">
        <div className="mb-2">Showing {rows.length} {rows.length === 1 ? 'row' : 'rows'} (latest)</div>
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 pr-4">Email</th>
              <th className="py-2">Created At (IST)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="py-2" colSpan={2}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="py-2" colSpan={2}>No rows found</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 pr-4 break-all">{r.email}</td>
                  <td className="py-2">{formatIST(r.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
