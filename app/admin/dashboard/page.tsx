'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type AppSubmission = {
  id: string;
  name: string;
  status: string;
  version: string;
  category: string;
  developer: {
    organizationName: string;
    user: {
      name: string;
      email: string;
    };
  };
  createdAt: string;
  reviews: any[];
};

type AdminStats = {
  totalApps: number;
  pendingReview: number;
  published: number;
  rejected: number;
  totalDevelopers: number;
  totalRevenue: number;
  recentReviews: number;
  reviewRate: string;
};

export default function AdminDashboard() {
  const [apps, setApps] = useState<AppSubmission[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterStatus, searchQuery]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);

      const [appsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/apps?${params}`, { credentials: 'include' }),
        fetch('/api/admin/stats', { credentials: 'include' })
      ]);

      if (appsRes.ok) setApps(await appsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/admin/login';
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      IN_REVIEW: '#fbbf24',
      PUBLISHED: '#10b981',
      SUSPENDED: '#ef4444',
      CHANGES_REQUESTED: '#f97316',
      DRAFT: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 50,
            height: 50,
            border: '4px solid #e5e7eb',
            borderTopColor: '#667eea',
            borderRadius: '50%'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fa' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Review and manage app submissions</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: '#ef4444',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
        {/* Stats Grid */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 32
          }}>
            <motion.div
              whileHover={{ y: -4 }}
              style={{
                background: 'white',
                padding: 20,
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalApps}</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Total Apps</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              style={{
                background: 'white',
                padding: 20,
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fbbf24' }}>{stats.pendingReview}</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Pending Review</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              style={{
                background: 'white',
                padding: 20,
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{stats.published}</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Published</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              style={{
                background: 'white',
                padding: 20,
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🚀</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalDevelopers}</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Developers</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              style={{
                background: 'white',
                padding: 20,
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>${stats.totalRevenue.toFixed(2)}</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Total Revenue</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              style={{
                background: 'white',
                padding: 20,
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.reviewRate}%</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Approval Rate</div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 12,
          marginBottom: 24,
          display: 'flex',
          gap: 16,
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search apps or developers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 14
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Status</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {/* Apps Table */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>App Name</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Developer</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Submitted</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{app.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>v{app.version}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div>{app.developer.organizationName}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{app.developer.user.email}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>{app.category}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getStatusColor(app.status)}20`,
                      color: getStatusColor(app.status)
                    }}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Link href={`/admin/review/${app.id}`}>
                      <button style={{
                        background: '#667eea',
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                        Review
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {apps.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No apps found</div>
              <div style={{ color: '#6b7280' }}>Try adjusting your filters</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}