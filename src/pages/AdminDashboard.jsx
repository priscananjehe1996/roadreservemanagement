import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#fcd34d', '#10b981', '#ef4444']; // Pending (Yellow), Approved (Green), Rejected (Red)

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sorting & Filtering State
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

  async function fetchApplications() {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error(error);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  }

  // --- Filtering & Sorting Logic ---
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
        
        // Handle numeric sorting for ID
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

  // --- Summary Aggregations ---
  const materialSummary = useMemo(() => {
    return sortedApplications.reduce((acc, curr) => {
      const mat = curr.materialused || 'Unspecified';
      acc[mat] = (acc[mat] || 0) + 1;
      return acc;
    }, {});
  }, [sortedApplications]);

  const typeSummary = useMemo(() => {
    return sortedApplications.reduce((acc, curr) => {
      const type = curr.singledoublemultiface || 'Unspecified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }, [sortedApplications]);

  const applicantTypeSummary = useMemo(() => {
    return sortedApplications.reduce((acc, curr) => {
      const type = curr.applicant_type || 'Unspecified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }, [sortedApplications]);

  // --- Export Logic ---
  const exportCSV = () => {
    if (sortedApplications.length === 0) return;
    const headers = ['ID', 'Date', 'Type', 'Applicant', 'TIN', 'Email', 'Activity', 'Location', 'Material', 'Status', 'Attachments'];
    const rows = sortedApplications.map(app => [
      app.id,
      new Date(app.created_at).toLocaleDateString(),
      app.applicant_type || '',
      `"${app.registeredname || ''}"`,
      app.tin || '',
      app.emailaddress || '',
      `"${app.activitiesundertaken || ''}"`,
      `"${app.physicallocation || ''}"`,
      app.materialused || '',
      app.status || 'Pending',
      app.attachment_urls ? app.attachment_urls.length : 0
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'road_reserve_applications.csv');
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Road Reserve Management - Application Report', 14, 22);
    
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

    doc.autoTable({
      startY: 40,
      head: [['ID', 'Date', 'Type', 'Applicant', 'Activity', 'Location', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
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

    doc.save('road_reserve_report.pdf');
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    
    const dataSheet = workbook.addWorksheet('Raw Data', { views: [{ state: 'frozen', ySplit: 1 }] });
    
    const columns = [
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
    dataSheet.columns = columns;

    // Excel Comments (Notes) that don't break
    dataSheet.getCell('A1').note = 'System generated unique identifier';
    dataSheet.getCell('C1').note = 'Type of Applicant';
    dataSheet.getCell('D1').note = 'Registered Name of the Applicant or Entity';
    dataSheet.getCell('E1').note = 'Tax Identification Number';
    dataSheet.getCell('J1').note = 'Current Processing Status (Pending/Approved/Rejected)';

    dataSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
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

    const summarySheet = workbook.addWorksheet('Summary Report');
    summarySheet.getColumn('A').width = 25;
    summarySheet.getColumn('B').width = 15;

    summarySheet.getCell('A1').value = 'Automated Summary Report';
    summarySheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF3B82F6' } };
    summarySheet.mergeCells('A1:B1');

    summarySheet.getCell('A3').value = 'Metric';
    summarySheet.getCell('B3').value = 'Count';
    summarySheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };

    // Dynamic Excel Formulas
    summarySheet.getCell('A4').value = 'Total Applications';
    summarySheet.getCell('B4').value = { formula: `COUNTA('Raw Data'!A2:A10000)` };

    summarySheet.getCell('A5').value = 'Pending Review';
    summarySheet.getCell('B5').value = { formula: `COUNTIF('Raw Data'!J:J, "Pending")` };

    summarySheet.getCell('A6').value = 'Approved';
    summarySheet.getCell('B6').value = { formula: `COUNTIF('Raw Data'!J:J, "Approved")` };

    summarySheet.getCell('A7').value = 'Rejected';
    summarySheet.getCell('B7').value = { formula: `COUNTIF('Raw Data'!J:J, "Rejected")` };

    ['B4','B5','B6','B7'].forEach(cell => {
      summarySheet.getCell(cell).alignment = { horizontal: 'right' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'road_reserve_advanced_report.xlsx');
  };

  // --- Charts Data ---
  const mockMonthlyData = [
    { name: 'Jan', count: 0 }, { name: 'Feb', count: 0 }, { name: 'Mar', count: 0 },
    { name: 'Apr', count: 0 }, { name: 'May', count: 0 }, { name: 'Jun', count: 0 },
  ];

  const mockStatusData = [
    { name: 'Pending', value: 0 }, { name: 'Approved', value: 0 }, { name: 'Rejected', value: 0 },
  ];

  const chartData = applications.length > 0 ? applications.reduce((acc, app) => {
    const month = new Date(app.created_at).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.name === month);
    if (existing) existing.count += 1;
    else acc.push({ name: month, count: 1 });
    return acc;
  }, []) : mockMonthlyData;

  const statusData = applications.length > 0 ? [
    { name: 'Pending', value: applications.filter(a => a.status === 'Pending' || !a.status).length },
    { name: 'Approved', value: applications.filter(a => a.status === 'Approved').length },
    { name: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length },
  ] : mockStatusData;

  const hasStatusData = statusData.some(d => d.value > 0);
  const displayStatusData = hasStatusData ? statusData : [{ name: 'No Data', value: 1 }];

  return (
    <div className="app-container" style={{ maxWidth: '1200px' }}>
      <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ textAlign: 'left', margin: 0 }}>Admin Dashboard</h1>
          <p style={{ textAlign: 'left', margin: 0 }}>Official review of Road Reserve applications.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Sign Out
          </button>
          <Link to="/" className="btn-submit" style={{ width: 'auto', padding: '0.5rem 1rem', margin: 0, textDecoration: 'none' }}>
            &larr; Back to App
          </Link>
        </div>
      </div>

      {/* Export Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border-color)', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Data Export Tools</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Download currently filtered data</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={exportCSV} style={{ background: '#4b5563', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>CSV Export</button>
          <button onClick={exportPDF} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Color PDF</button>
          <button onClick={exportExcel} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Excel Workbook</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search by ID, Name, or Location..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: '250px' }}
        />
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '150px' }}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Total Applications</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'var(--text-primary)' }}>{sortedApplications.length}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Pending Review</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#fcd34d' }}>{sortedApplications.filter(a => (a.status || 'Pending') === 'Pending').length}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Approved</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#10b981' }}>{sortedApplications.filter(a => a.status === 'Approved').length}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Bar Chart */}
        <div className="form-section" style={{ margin: 0 }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Applications Over Time {applications.length === 0 && <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '1rem'}}>(Simulated Empty State)</span>}</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }} />
                <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categorical Reports */}
        <div className="form-section" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Categorical Summaries</h3>
          
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Applicant Type Breakdown</h4>
            {Object.keys(applicantTypeSummary).length === 0 ? <p style={{fontSize: '0.85rem'}}>No data</p> : 
              Object.entries(applicantTypeSummary).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.9rem' }}>{key}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{val}</span>
                </div>
              ))
            }
          </div>

          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Material Used Breakdown</h4>
            {Object.keys(materialSummary).length === 0 ? <p style={{fontSize: '0.85rem'}}>No data</p> : 
              Object.entries(materialSummary).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.9rem' }}>{key}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{val}</span>
                </div>
              ))
            }
          </div>

          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Signage Type Breakdown</h4>
            {Object.keys(typeSummary).length === 0 ? <p style={{fontSize: '0.85rem'}}>No data</p> : 
              Object.entries(typeSummary).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.9rem' }}>{key}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{val}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 style={{ marginBottom: '1rem' }}>Filtered Applications ({sortedApplications.length})</h2>
        
        {loading ? (
          <p>Loading applications...</p>
        ) : sortedApplications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No applications match your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <th style={{ padding: '1rem' }} onClick={() => requestSort('id')}>ID {getSortIcon('id')}</th>
                  <th style={{ padding: '1rem' }} onClick={() => requestSort('created_at')}>Date {getSortIcon('created_at')}</th>
                  <th style={{ padding: '1rem' }} onClick={() => requestSort('applicant_type')}>Type {getSortIcon('applicant_type')}</th>
                  <th style={{ padding: '1rem' }} onClick={() => requestSort('registeredname')}>Applicant {getSortIcon('registeredname')}</th>
                  <th style={{ padding: '1rem' }} onClick={() => requestSort('activitiesundertaken')}>Activity {getSortIcon('activitiesundertaken')}</th>
                  <th style={{ padding: '1rem' }} onClick={() => requestSort('physicallocation')}>Location {getSortIcon('physicallocation')}</th>
                  <th style={{ padding: '1rem' }}>Docs</th>
                  <th style={{ padding: '1rem' }} onClick={() => requestSort('status')}>Status {getSortIcon('status')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedApplications.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem' }}>#{app.id}</td>
                    <td style={{ padding: '1rem' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {app.applicant_type || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{app.registeredname || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{app.activitiesundertaken || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{app.physicallocation || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      {app.attachment_urls && app.attachment_urls.length > 0 ? (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', maxWidth: '100px' }}>
                          {app.attachment_urls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" title="View Document">
                              <div style={{ width: '24px', height: '24px', background: 'var(--accent-primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', textDecoration: 'none' }}>
                                📄
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>None</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', background: app.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: app.status === 'Approved' ? '#10b981' : app.status === 'Rejected' ? '#ef4444' : '#fcd34d' }}>
                        {app.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
