import React, { useEffect, useState } from 'react';
import Layout from '../../layouts/Layout';
import { PageTitle, Card } from '../../components/Shared';
import api from '../../api/client';

export function PlatformPage({ title, subtitle, path, columns }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    api.get(path)
      .then(({ data }) => { if (active) setRows(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setNotice('This platform list could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path]);

  return (
    <Layout>
      <PageTitle title={title} subtitle={subtitle} />
      <Card title={title}>
        {notice && <p className="mb-3 text-[12px] text-rose-600">{notice}</p>}
        {loading ? <p className="text-[13px] text-slate-400">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  {columns.map((column) => <th key={column.key} className="px-3 py-2 font-semibold">{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td className="px-3 py-6 text-slate-400" colSpan={columns.length}>Nothing is recorded yet.</td></tr>}
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50">
                    {columns.map((column) => <td key={column.key} className="px-3 py-3 text-slate-700">{row[column.key] || '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Layout>
  );
}
