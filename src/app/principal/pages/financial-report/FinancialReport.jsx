import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers, FiHeart } from 'react-icons/fi';
import Table from '../../../../components/Table/Table';
import { useNotification } from '../../../../components/Notification/Notification';
import { getPrincipalFinancialReport } from '../../../../services/reportService';
import './FinancialReport.css';

const formatCurrency = (n) => {
  const val = Number(n || 0);
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + ' Tr';
  if (val >= 1_000) return (val / 1_000).toFixed(0) + ' K';
  return val + ' ₫';
};

const formatFull = (n) => (n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '0 ₫');

const FinancialReport = () => {
  const { addToast } = useNotification();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await getPrincipalFinancialReport();
        setReport(data || null);
      } catch (err) {
        addToast(err?.response?.data?.message || err?.message || 'Không thể tải báo cáo tài chính', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [addToast]);

  const totalDonated = report?.tongTienQuyenGop ?? 0;
  const totalDistributed = report?.tongTienGiaiNgan ?? 0;
  const balance = report?.soDuQuyHienTai ?? 0;
  const totalDonationsCount = report?.tongSoLuotQuyenGop ?? 0;
  const totalStudentsSupported = report?.tongSoHocSinhNhanHoTro ?? 0;
  const monthlyList = (Array.isArray(report?.thongKeTheoThang) ? [...report.thongKeTheoThang] : [])
    .sort((a, b) => (Number(a.nam || 0) - Number(b.nam || 0)) || (Number(a.thang || 0) - Number(b.thang || 0)));

  const barData = monthlyList.map((m) => ({
    name: m.thangNam || `${String(m.thang).padStart(2, '0')}/${m.nam}`,
    'Quyên góp': Number(m.tongTienQuyenGop || 0),
    'Giải ngân': Number(m.tongTienGiaiNgan || 0),
  }));

  const columns = [
    { key: 'thangNam', title: 'Tháng / Năm', width: 140, render: (_, r) => r.thangNam || `${String(r.thang).padStart(2, '0')}/${r.nam}` },
    { key: 'tongTienQuyenGop', title: 'Tổng quyên góp', align: 'right', render: (v) => <span style={{ display: 'block', textAlign: 'right' }}>{formatFull(v)}</span> },
    { key: 'tongTienGiaiNgan', title: 'Tổng giải ngân', align: 'right', render: (v) => <span style={{ display: 'block', textAlign: 'right' }}>{formatFull(v)}</span> },
    {
      key: 'chenhLech',
      title: 'Chênh lệch thu - chi',
      align: 'right',
      render: (v) => <strong style={{ display: 'block', textAlign: 'right' }}>{formatFull(v)}</strong>,
    },
  ];

  const KpiCard = ({ icon, label, value, sub, color }) => (
    <div className="fr-kpi" style={{ '--kpi-color': color }}>
      <div className="fr-kpi__icon">{icon}</div>
      <div className="fr-kpi__body">
        <div className="fr-kpi__label">{label}</div>
        <div className="fr-kpi__value">{loading ? '...' : value}</div>
        {sub && <div className="fr-kpi__sub">{sub}</div>}
      </div>
    </div>
  );

  return (
    <div className="financial-report">
      <div className="fr-header">
        <div>
          <h1>Báo cáo tài chính tổng hợp</h1>
          <p>Số liệu thực tế từ hệ thống về nguồn quỹ quyên góp, giải ngân và số dư hiện tại</p>
        </div>
      </div>

      <div className="fr-kpis">
        <KpiCard
          icon={<FiTrendingUp />}
          label="Tổng tiền quyên góp"
          value={formatFull(totalDonated)}
          sub={`${totalDonationsCount} lượt đóng góp thành công`}
          color="#2e7d5b"
        />
        <KpiCard
          icon={<FiTrendingDown />}
          label="Tổng tiền giải ngân"
          value={formatFull(totalDistributed)}
          sub="Đã trao hỗ trợ học sinh"
          color="#4361ee"
        />
        <KpiCard
          icon={<FiDollarSign />}
          label="Số dư quỹ hiện tại"
          value={formatFull(balance)}
          sub="Số dư khả dụng"
          color="#7209b7"
        />
        <KpiCard
          icon={<FiUsers />}
          label="Học sinh nhận hỗ trợ"
          value={`${totalStudentsSupported} em`}
          sub="Tổng số học sinh đã thụ hưởng"
          color="#f72585"
        />
      </div>

      <div className="fr-charts">
        <div className="fr-chart-card fr-chart-card--wide">
          <h3>Biểu đồ Quyên góp & Giải ngân theo tháng</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => formatFull(val)} />
              <Legend />
              <Bar dataKey="Quyên góp" fill="#2e7d5b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Giải ngân" fill="#4361ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="fr-chart-card">
          <h3>Chỉ số tổng hợp</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span>Tổng lượt quyên góp</span>
              <strong><FiHeart style={{ verticalAlign: 'middle', marginRight: 4 }} />{totalDonationsCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span>Học sinh thụ hưởng</span>
              <strong>{totalStudentsSupported} em</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span>Tổng thu</span>
              <strong>{formatFull(totalDonated)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tổng chi</span>
              <strong>{formatFull(totalDistributed)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="fr-table-card">
        <h3>Chi tiết thu - chi theo từng tháng</h3>
        <Table
          columns={columns}
          data={monthlyList.map((m, idx) => ({ ...m, _rowId: m.thangNam || `${m.nam}-${m.thang}-${idx}` }))}
          loading={loading}
          rowKey="_rowId"
          emptyTitle="Chưa có dữ liệu thống kê theo tháng"
          emptyDescription="Chưa phát sinh giao dịch quyên góp hoặc giải ngân."
        />
      </div>
    </div>
  );
};

export default FinancialReport;
