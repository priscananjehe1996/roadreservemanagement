import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import IntelligenceCenter from '../components/IntelligenceCenter';
import logoImg from '../assets/mowt_logo.png';

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Settings & Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nids_settings')) || { autoRefresh: false, compactMode: false };
    } catch {
      return { autoRefresh: false, compactMode: false };
    }
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });

  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/login');
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    localStorage.setItem('nids_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    let interval;
    if (settings.autoRefresh) {
      interval = setInterval(() => {
        fetchApplications();
      }, 30000); // 30 seconds
    }
    return () => clearInterval(interval);
  }, [settings.autoRefresh]);

  async function fetchApplications() {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) console.error(error);
    else setApplications(data || []);
    
    setLoading(false);
  }

  const sortedApplications = useMemo(() => {
    let sortableItems = [...applications];
    
    if (statusFilter !== 'All') {
      sortableItems = sortableItems.filter(app => (app.status || 'Pending') === statusFilter);
    }
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      sortableItems = sortableItems.filter(app => 
        (app.registeredname || '').toLowerCase().includes(lowerQuery) ||
        (app.activitiesundertaken || '').toLowerCase().includes(lowerQuery) ||
        (app.physicallocation || '').toLowerCase().includes(lowerQuery) ||
        String(app.id).includes(lowerQuery)
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';
        
        if (sortConfig.key === 'id') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        } else {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [applications, sortConfig, searchQuery, statusFilter]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  const escapeCSV = (val) => {
    if (val == null) return '""';
    const str = String(val).replace(/"/g, '""').replace(/[\n\r]+/g, ' ');
    return `"${str}"`;
  };

  const exportCSV = () => {
    if (sortedApplications.length === 0) return;
    const headers = ['ID', 'Date', 'Type', 'Applicant', 'TIN', 'Email', 'Activity', 'Location', 'Material', 'Status', 'Attachments'];
    const rows = sortedApplications.map(app => [
      app.id,
      new Date(app.created_at).toLocaleDateString(),
      escapeCSV(app.applicant_type),
      escapeCSV(app.registeredname),
      escapeCSV(app.tin),
      escapeCSV(app.emailaddress),
      escapeCSV(app.activitiesundertaken),
      escapeCSV(app.physicallocation),
      escapeCSV(app.materialused),
      escapeCSV(app.status || 'Pending'),
      app.attachment_urls ? app.attachment_urls.length : 0
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'road_reserve_applications.csv');
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(20);
    doc.setTextColor(56, 189, 248);
    doc.text('MoWT - Roads Reserve Database Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    const tableData = sortedApplications.map(app => [
      app.id,
      new Date(app.created_at).toLocaleDateString(),
      app.applicant_type || 'N/A',
      app.registeredname || 'N/A',
      app.activitiesundertaken || 'N/A',
      app.physicallocation || 'N/A',
      app.status || 'Pending'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Date', 'Type', 'Applicant', 'Activity', 'Location', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [56, 189, 248], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9, cellPadding: 4 },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 6) { 
          if (data.cell.raw === 'Approved') data.cell.styles.textColor = [16, 185, 129];
          else if (data.cell.raw === 'Rejected') data.cell.styles.textColor = [239, 68, 68];
          else data.cell.styles.textColor = [245, 158, 11];
        }
      }
    });
    doc.save('mowt_database_report.pdf');
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const dataSheet = workbook.addWorksheet('Raw Data', { views: [{ state: 'frozen', ySplit: 1 }] });
    
    dataSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Applicant', key: 'applicant', width: 30 },
      { header: 'TIN', key: 'tin', width: 15 },
      { header: 'Activity', key: 'activity', width: 30 },
      { header: 'Location', key: 'location', width: 30 },
      { header: 'Material Used', key: 'material', width: 20 },
      { header: 'Attachments', key: 'attachments', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    dataSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    });

    sortedApplications.forEach(app => {
      dataSheet.addRow({
        id: app.id,
        date: new Date(app.created_at).toLocaleDateString(),
        type: app.applicant_type,
        applicant: app.registeredname,
        tin: app.tin,
        activity: app.activitiesundertaken,
        location: app.physicallocation,
        material: app.materialused,
        attachments: app.attachment_urls ? app.attachment_urls.length : 0,
        status: app.status || 'Pending'
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'mowt_advanced_report.xlsx');
  };

  const chartData = useMemo(() => {
    if (applications.length === 0) {
      return [ { name: 'Jan', count: 0 }, { name: 'Feb', count: 0 }, { name: 'Mar', count: 0 } ];
    }
    return applications.reduce((acc, app) => {
      const month = new Date(app.created_at).toLocaleString('default', { month: 'short' });
      const existing = acc.find(item => item.name === month);
      if (existing) existing.count += 1;
      else acc.push({ name: month, count: 1 });
      return acc;
    }, []);
  }, [applications]);

  const pendingCount = applications.filter(a => (a.status || 'Pending') === 'Pending').length;

  const notificationsList = useMemo(() => {
    const notifs = [];
    if (pendingCount > 0) {
      notifs.push({ id: 1, type: 'warning', text: `${pendingCount} applications require immediate resolution.`, time: 'Just now' });
    }
    const recentlyApproved = applications.filter(a => a.status === 'Approved').length;
    if (recentlyApproved > 0) {
      notifs.push({ id: 2, type: 'success', text: `${recentlyApproved} total applications have been approved.`, time: 'System' });
    }
    notifs.push({ id: 3, type: 'info', text: 'MoWT Secure Server connection established.', time: 'System' });
    return notifs;
  }, [pendingCount, applications]);

  const renderDashboard = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Uganda National Roads Reserve Applications</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Ministry of Works and Transport - Department of National Roads</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Storage Volume</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1 }}>{applications.length}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '0.5rem' }}>Applications in Database</div>
          
          <div style={{ marginTop: '1.5rem', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #38BDF8, #818CF8)' }}></div>
          </div>
        </div>

        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Resolution</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#FCD34D', lineHeight: 1 }}>{pendingCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Awaiting Admin Review</div>
          
          <div style={{ marginTop: '1.5rem', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(pendingCount / Math.max(1, applications.length)) * 100}%`, background: '#FCD34D' }}></div>
          </div>
        </div>

        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>System Health</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10B981', lineHeight: 1 }}>{applications.length > 0 ? 'Optimal' : 'Offline'}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Core services operational</div>
          
          <div style={{ marginTop: '1.5rem', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: '#10B981' }}></div>
          </div>
        </div>

      </div>

      <div className="glass-panel">
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Data Ingestion Over Time</h3>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} allowDecimals={false} />
              <RechartsTooltip cursor={{ fill: 'rgba(56, 189, 248, 0.05)' }} contentStyle={{ background: '#0B0E14', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '0.5rem', color: '#F8FAFC' }} />
              <Bar dataKey="count" fill="url(#colorUv)" radius={[4, 4, 0, 0]} barSize={40} />
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );

  const renderDatabase = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Application Database</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage and export application records.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={exportCSV} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }}>CSV</button>
          <button onClick={exportPDF} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }}>PDF</button>
          <button onClick={exportExcel} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }}>Excel</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(56, 189, 248, 0.1)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search Database..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '250px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '4px', color: 'white', outline: 'none' }}
          />
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '4px', color: 'white', outline: 'none' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '1rem' }} onClick={() => requestSort('id')}>ID {getSortIcon('id')}</th>
                <th style={{ padding: '1rem' }} onClick={() => requestSort('created_at')}>Date {getSortIcon('created_at')}</th>
                <th style={{ padding: '1rem' }} onClick={() => requestSort('registeredname')}>Applicant {getSortIcon('registeredname')}</th>
                <th style={{ padding: '1rem' }} onClick={() => requestSort('physicallocation')}>Location {getSortIcon('physicallocation')}</th>
                <th style={{ padding: '1rem' }}>Docs</th>
                <th style={{ padding: '1rem' }} onClick={() => requestSort('status')}>Status {getSortIcon('status')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedApplications.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No records found.</td></tr>
              ) : sortedApplications.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', fontSize: settings.compactMode ? '0.8rem' : '0.9rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: settings.compactMode ? '0.5rem 1rem' : '1rem' }}>#{app.id}</td>
                  <td style={{ padding: settings.compactMode ? '0.5rem 1rem' : '1rem', color: 'var(--text-secondary)' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: settings.compactMode ? '0.5rem 1rem' : '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{app.registeredname || 'N/A'}</td>
                  <td style={{ padding: settings.compactMode ? '0.5rem 1rem' : '1rem', color: 'var(--text-secondary)' }}>{app.physicallocation || 'N/A'}</td>
                  <td style={{ padding: settings.compactMode ? '0.5rem 1rem' : '1rem' }}>
                    {app.attachment_urls && app.attachment_urls.length > 0 ? (
                      <span style={{ color: 'var(--accent-primary)' }}>{app.attachment_urls.length} File(s)</span>
                    ) : <span style={{ color: 'var(--text-secondary)' }}>-</span>}
                  </td>
                  <td style={{ padding: settings.compactMode ? '0.5rem 1rem' : '1rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', background: app.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: app.status === 'Approved' ? '#10b981' : app.status === 'Rejected' ? '#ef4444' : '#fcd34d' }}>
                      {app.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src={logoImg} alt="MoWT Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
          MoWT System
        </div>
        
        <div className="admin-sidebar-nav">
          <div className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span>📊</span> Dashboard
          </div>
          <div className={`admin-nav-item ${activeTab === 'intelligence' ? 'active' : ''}`} onClick={() => setActiveTab('intelligence')}>
            <span>👁️</span> Intelligence
          </div>
          <div className={`admin-nav-item ${activeTab === 'database' ? 'active' : ''}`} onClick={() => setActiveTab('database')}>
            <span>🗄️</span> Database
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '0.25rem' }}>SYSTEM STATUS</div>
            <div>Secure Connection</div>
            <div>Uptime: 99.9%</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Doomsday Banner if Pending Apps Exist */}
        {pendingCount > 0 && (
          <div style={{ background: '#7f1d1d', borderBottom: '2px solid #ef4444', color: 'white', padding: '0.75rem', textAlign: 'center', animation: 'pulse 2s infinite', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>
            ⚠️ {pendingCount} PENDING APPLICATIONS REQUIRE IMMEDIATE RESOLUTION ⚠️
            <style>{`@keyframes pulse { 0% { background: #7f1d1d; } 50% { background: #991b1b; } 100% { background: #7f1d1d; } }`}</style>
          </div>
        )}

        <div className="admin-header" style={{ position: 'relative', zIndex: 100 }}>
          <input type="text" className="admin-search" placeholder="Search system resources..." />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', position: 'relative' }}>
              <div 
                style={{ cursor: 'pointer', position: 'relative', fontSize: '1.2rem' }} 
                onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
                title="Notifications"
              >
                🔔
                {pendingCount > 0 && <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%', boxShadow: '0 0 5px var(--error)' }}></div>}
              </div>
              <div 
                style={{ cursor: 'pointer', fontSize: '1.2rem' }} 
                onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
                title="System Settings"
              >
                ⚙️
              </div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Admin Root</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>admin@mowt.go.ug</div>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>AR</div>
              <button onClick={handleSignOut} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', marginLeft: '0.5rem', fontSize: '1.2rem' }} title="Sign Out">⏏</button>
            </div>
          </div>
          
          {/* Notifications Modal */}
          {showNotifications && (
            <div className="glass-panel" style={{ position: 'absolute', top: '80px', right: '200px', width: '350px', zIndex: 50, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', fontWeight: 'bold' }}>
                System Notifications
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notificationsList.map(n => (
                  <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.type === 'warning' ? 'var(--warning)' : n.type === 'success' ? 'var(--success)' : 'var(--accent-primary)', marginTop: '0.4rem' }}></div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.text}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Modal */}
          {showSettings && (
            <div className="glass-panel" style={{ position: 'absolute', top: '80px', right: '150px', width: '300px', zIndex: 50, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', fontWeight: 'bold' }}>
                System Settings
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Auto-refresh Database (30s)</span>
                  <input 
                    type="checkbox" 
                    checked={settings.autoRefresh} 
                    onChange={e => setSettings({...settings, autoRefresh: e.target.checked})} 
                    style={{ cursor: 'pointer' }}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Compact Table View</span>
                  <input 
                    type="checkbox" 
                    checked={settings.compactMode} 
                    onChange={e => setSettings({...settings, compactMode: e.target.checked})} 
                    style={{ cursor: 'pointer' }}
                  />
                </label>
                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                  <button onClick={() => { fetchApplications(); setShowSettings(false); }} style={{ width: '100%', background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Force Sync Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="admin-content">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', letterSpacing: '2px' }}>INITIALIZING DATABASE...</div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'intelligence' && <IntelligenceCenter applications={applications} />}
              {activeTab === 'database' && renderDatabase()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
