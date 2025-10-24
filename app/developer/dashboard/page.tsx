'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type DashboardStats = {
  totalApps: number;
  totalDownloads: number;
  totalRevenue: number;
  activeUsers: number;
  avgRating: number;
  pendingReviews: number;
  monthlyGrowth: number;
  totalViews: number;
};

type AppRow = {
  id: string;
  name: string;
  status: 'PUBLISHED' | 'IN_REVIEW' | 'DRAFT' | 'CHANGES_REQUESTED' | 'SUSPENDED';
  downloads: number;
  revenue: number;
  rating: number;
  lastUpdated: string;
  version: string;
  iconUrl?: string;
};

type RecentActivity = {
  id: string;
  type: 'download' | 'review' | 'update' | 'revenue';
  message: string;
  timestamp: string;
  appName?: string;
};

export default function EnhancedDeveloperDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'downloads' | 'revenue' | 'rating' | 'updated'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appsRes, activityRes] = await Promise.all([
        fetch('/api/developer/stats'),
        fetch('/api/developer/apps'),
        fetch('/api/developer/activity')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (appsRes.ok) setApps(await appsRes.json());
      if (activityRes.ok) setRecentActivity(await activityRes.json());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = apps
    .filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'downloads': return b.downloads - a.downloads;
        case 'revenue': return b.revenue - a.revenue;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

  const toggleAppSelection = (appId: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedApps(newSelected);
  };

  const getStatusBadge = (status: AppRow['status']) => {
    const configs = {
      PUBLISHED: { bg: '#dcfce7', text: '#166534', icon: '✓' },
      IN_REVIEW: { bg: '#fef9c3', text: '#854d0e', icon: '⏳' },
      DRAFT: { bg: '#f1f5f9', text: '#334155', icon: '📝' },
      CHANGES_REQUESTED: { bg: '#ffedd5', text: '#9a3412', icon: '⚠️' },
      SUSPENDED: { bg: '#fee2e2', text: '#991b1b', icon: '🚫' }
    };
    const config = configs[status];
    return (
      <span style={{
        background: config.bg,
        color: config.text,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>{config.icon}</span>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f8fa' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 50,
              height: 50,
              border: '4px solid #e5e7eb',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              margin: '0 auto 20px'
            }}
          />
          <p style={{ color: '#64748b', fontSize: 14 }}>Loading developer dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fa' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 18
                }}
              >
                D
              </motion.div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>Developer Portal</h1>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Manage your VR applications</p>
              </div>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/developer/apps/new">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <span style={{ fontSize: 18 }}>+</span>
                  Submit New App
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18
                }}
              >
                🔔
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  border: 'none'
                }}
              >
                A
              </motion.button>
            </nav>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Welcome back! 👋
          </h2>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>
            Here's what's happening with your apps today
          </p>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 32
            }}
          >
            {[
              { label: 'Total Apps', value: stats.totalApps, icon: '📱', color: '#2563eb', change: '+2' },
              { label: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), icon: '⬇️', color: '#10b981', change: `+${stats.monthlyGrowth}%` },
              { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: '#8b5cf6', change: '+12%' },
              { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: '👥', color: '#f59e0b', change: '+8%' },
              { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: '⭐', color: '#eab308', change: '+0.2' },
              { label: 'Pending Reviews', value: stats.pendingReviews, icon: '⏳', color: '#ef4444', change: '-1' },
              { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: '👁️', color: '#06b6d4', change: '+25%' },
              { label: 'Success Rate', value: '94%', icon: '✓', color: '#14b8a6', change: '+3%' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 20,
                  border: '1px solid #e5e7eb',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 100,
                  height: 100,
                  background: `${stat.color}15`,
                  borderRadius: '50%',
                  transform: 'translate(30%, -30%)'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{stat.icon}</span>
                  <span style={{
                    background: `${stat.color}20`,
                    color: stat.color,
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {stat.change}
                  </span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, marginBottom: 32 }}>
          {/* Apps Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'white',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}
            >
              {/* Toolbar */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Your Applications</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setViewMode('list')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        background: viewMode === 'list' ? '#f1f5f9' : 'white',
                        cursor: 'pointer',
                        fontSize: 14
                      }}
                    >
                      📋
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setViewMode('grid')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        background: viewMode === 'grid' ? '#f1f5f9' : 'white',
                        cursor: 'pointer',
                        fontSize: 14
                      }}
                    >
                      ⊞
                    </motion.button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 200,
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      fontSize: 14,
                      outline: 'none',
                      cursor: 'pointer',
                      background: 'white'
                    }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CHANGES_REQUESTED">Changes Requested</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      fontSize: 14,
                      outline: 'none',
                      cursor: 'pointer',
                      background: 'white'
                    }}
                  >
                    <option value="updated">Recently Updated</option>
                    <option value="name">Name</option>
                    <option value="downloads">Most Downloaded</option>
                    <option value="revenue">Highest Revenue</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                {selectedApps.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: '#eff6ff',
                      padding: '12px 16px',
                      borderRadius: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1e40af' }}>
                      {selectedApps.size} app{selectedApps.size > 1 ? 's' : ''} selected
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#2563eb',
                          color: 'white',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Export
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedApps(new Set())}
                      >
                        Clear
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Apps List */}
              <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                {viewMode === 'list' ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <input type="checkbox" style={{ cursor: 'pointer' }} />
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          App
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Status
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Downloads
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Revenue
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Rating
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.map((app, index) => (
                        <motion.tr
                          key={app.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ background: '#f8fafc' }}
                          style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                        >
                          <td style={{ padding: '16px' }}>
                            <input
                              type="checkbox"
                              checked={selectedApps.has(app.id)}
                              onChange={() => toggleAppSelection(app.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                background: app.iconUrl ? `url(${app.iconUrl})` : 'linear-gradient(135deg, #2563eb, #60a5fa)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{app.name}</div>
                                <div style={{ fontSize: 12, color: '#64748b' }}>v{app.version}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            {getStatusBadge(app.status)}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, fontSize: 14 }}>
                            {app.downloads.toLocaleString()}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, fontSize: 14, color: '#10b981' }}>
                            ${app.revenue.toFixed(2)}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                              <span style={{ color: '#eab308' }}>⭐</span>
                              <span style={{ fontWeight: 600, fontSize: 14 }}>{app.rating?.toFixed(1) || 'N/A'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <Link href={`/developer/apps/${app.id}/edit`}>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    color: '#2563eb'
                                  }}
                                >
                                  Edit
                                </motion.button>
                              </Link>
                              <Link href={`/developer/apps/${app.id}/analytics`}>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    color: '#10b981'
                                  }}
                                >
                                  Analytics
                                </motion.button>
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: 16,
                    padding: 24
                  }}>
                    {filteredApps.map((app, index) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                        style={{
                          background: 'white',
                          borderRadius: 12,
                          border: '1px solid #e5e7eb',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: '100%',
                          height: 140,
                          background: app.iconUrl ? `url(${app.iconUrl})` : 'linear-gradient(135deg, #2563eb, #60a5fa)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }} />
                        <div style={{ padding: 16 }}>
                          <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px 0' }}>{app.name}</h4>
                          <div style={{ marginBottom: 12 }}>{getStatusBadge(app.status)}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                            <div>
                              <div style={{ color: '#64748b' }}>Downloads</div>
                              <div style={{ fontWeight: 600 }}>{app.downloads.toLocaleString()}</div>
                            </div>
                            <div>
                              <div style={{ color: '#64748b' }}>Revenue</div>
                              <div style={{ fontWeight: 600, color: '#10b981' }}>${app.revenue.toFixed(0)}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {filteredApps.length === 0 && (
                  <div style={{ padding: 80, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>No apps found</h3>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px 0' }}>
                      {searchQuery ? 'Try adjusting your search' : 'Get started by submitting your first app'}
                    </p>
                    {!searchQuery && (
                      <Link href="/developer/apps/new">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          style={{
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: 10,
                            border: 'none',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer'
                          }}
                        >
                          Submit Your First App
                        </motion.button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'white',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                padding: 20
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentActivity.slice(0, 8).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: 12,
                      background: '#f8fafc',
                      borderRadius: 10,
                      fontSize: 13
                    }}
                  >
                    <div style={{ fontSize: 20 }}>
                      {activity.type === 'download' && '⬇️'}
                      {activity.type === 'review' && '⭐'}
                      {activity.type === 'update' && '🔄'}
                      {activity.type === 'revenue' && '💰'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{activity.message}</div>
                      {activity.appName && (
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{activity.appName}</div>
                      )}
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: 'white',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                padding: 20
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'View Analytics', icon: '📊', href: '/developer/analytics' },
                  { label: 'Manage Builds', icon: '🔨', href: '/developer/builds' },
                  { label: 'Request Payout', icon: '💳', href: '/developer/payouts' },
                  { label: 'Support Center', icon: '💬', href: '/developer/support' }
                ].map((action, index) => (
                  <Link key={action.label} href={action.href}>
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{action.icon}</span>
                      {action.label}
                    </motion.button>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Performance Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                borderRadius: 16,
                border: '1px solid #93c5fd',
                padding: 20
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 12 }}>💡</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px 0', color: '#1e40af' }}>
                Performance Tip
              </h3>
              <p style={{ fontSize: 13, color: '#1e3a8a', margin: 0, lineHeight: 1.6 }}>
                Apps with high-quality screenshots get 40% more downloads. Update your app's media assets today!
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}