'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type DashboardStats = {
  totalApps: number;
  totalDownloads: number;
  totalRevenue: number;
  activeUsers: number;
  avgRating: number;
  pendingReviews: number;
};

type AppRow = {
  id: string;
  name: string;
  status: 'PUBLISHED' | 'IN_REVIEW' | 'DRAFT' | 'CHANGES_REQUESTED' | 'SUSPENDED';
  downloads: number;
  revenue: number;
  rating: number;
  lastUpdated: string;
};

export default function DeveloperDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [sort, setSort] = useState<'name'|'downloads'|'revenue'|'rating'|'updated'>('updated');

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([
          fetch('/api/developer/stats').then(r => r.json()),
          fetch('/api/developer/apps').then(r => r.json()),
        ]);
        setStats(s);
        setApps(a);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let rows = apps.filter(r =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.id.toLowerCase().includes(q.toLowerCase())
    );
    if (status !== 'ALL') rows = rows.filter(r => r.status === status);
    switch (sort) {
      case 'name': rows.sort((a,b)=>a.name.localeCompare(b.name)); break;
      case 'downloads': rows.sort((a,b)=>b.downloads-a.downloads); break;
      case 'revenue': rows.sort((a,b)=>b.revenue-a.revenue); break;
      case 'rating': rows.sort((a,b)=>b.rating-a.rating); break;
      default: rows.sort((a,b)=>new Date(b.lastUpdated).getTime()-new Date(a.lastUpdated).getTime());
    }
    return rows;
  }, [apps, q, status, sort]);

  if (loading) {
    return (
      <div className="card" style={{padding:'40px', textAlign:'center'}}>
        <div style={{
          width:40,height:40, margin:'0 auto 10px',
          border:'4px solid #1f2937', borderTopColor:'transparent',
          borderRadius:'999px', animation:'spin 1s linear infinite'
        }} />
        <div className="helper">Loading dashboard…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const badge = (s: AppRow['status']) => ({
    PUBLISHED: 'badge badge-green',
    IN_REVIEW: 'badge badge-yellow',
    DRAFT: 'badge badge-gray',
    CHANGES_REQUESTED: 'badge badge-orange',
    SUSPENDED: 'badge badge-red',
  }[s]);

  return (
    <div className="space-y-8">
      <div className="row" style={{justifyContent:'space-between', alignItems:'flex-end'}}>
        <div>
          <h1 style={{fontSize:22, fontWeight:800, margin:0}}>Welcome back!</h1>
          <div className="helper">Here’s an overview of your app performance</div>
        </div>
        <Link href="/developer/apps/new" className="btn-primary">Submit new app</Link>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat"><div className="stat-label">Total Apps</div><div className="stat-value">{stats.totalApps}</div></div>
          <div className="stat"><div className="stat-label">Downloads</div><div className="stat-value">{stats.totalDownloads.toLocaleString()}</div></div>
          <div className="stat"><div className="stat-label">Revenue</div><div className="stat-value">${stats.totalRevenue.toFixed(2)}</div></div>
          <div className="stat"><div className="stat-label">Active Users</div><div className="stat-value">{stats.activeUsers.toLocaleString()}</div></div>
          <div className="stat"><div className="stat-label">Avg Rating</div><div className="stat-value">{stats.avgRating.toFixed(1)}</div></div>
          <div className="stat"><div className="stat-label">Pending Reviews</div><div className="stat-value">{stats.pendingReviews}</div></div>
        </div>
      )}

      <div className="card">
        <div className="row" style={{justifyContent:'space-between', flexWrap:'wrap', gap:12}}>
          <div className="row" style={{flexWrap:'wrap', gap:8}}>
            <input
              className="input"
              placeholder="Search apps…"
              value={q}
              onChange={e=>setQ(e.target.value)}
              style={{minWidth:240}}
            />
            <select value={status} onChange={e=>setStatus(e.target.value)} className="select">
              {['ALL','PUBLISHED','IN_REVIEW','DRAFT','CHANGES_REQUESTED','SUSPENDED'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="row" style={{alignItems:'center'}}>
            <span className="helper">Sort</span>
            <select value={sort} onChange={e=>setSort(e.target.value as any)} className="select">
              <option value="updated">Last updated</option>
              <option value="name">Name</option>
              <option value="downloads">Downloads</option>
              <option value="revenue">Revenue</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
          <tr>
            <th>App</th><th>Status</th><th>Downloads</th><th>Revenue</th><th>Rating</th><th>Last updated</th><th></th>
          </tr>
          </thead>
          <tbody>
          {filtered.map(app => (
            <tr key={app.id}>
              <td style={{fontWeight:600}}>{app.name}</td>
              <td><span className={badge(app.status)}>{app.status.replace('_',' ')}</span></td>
              <td>{app.downloads.toLocaleString()}</td>
              <td>${app.revenue.toFixed(2)}</td>
              <td>{app.rating.toFixed(1)}</td>
              <td className="helper">{new Date(app.lastUpdated).toLocaleDateString()}</td>
              <td style={{textAlign:'right'}}>
                <div className="row" style={{justifyContent:'flex-end'}}>
                  <Link className="btn-outline" href={`/developer/apps/${app.id}/edit`}>Edit</Link>
                  <Link className="btn-outline" href={`/developer/apps/${app.id}/analytics`}>Analytics</Link>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={7} style={{textAlign:'center', padding:'48px', color:'#6b7280'}}>No apps found.</td></tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
