import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity } from 'react-icons/fi';
import { getAllDonations } from '../../../../services/donationService';
import { getAllCampaigns } from '../../../../services/campaignService';
import { getAllDistributions } from '../../../../services/distributionService';
import './FinancialReport.css';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const PIE_COLORS = ['#4361ee','#7209b7','#f72585','#4cc9f0','#4895ef','#3a0ca3'];

const formatCurrency = (n) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + ' Tr'
    : n >= 1_000
    ? (n / 1_000).toFixed(0) + ' K'
    : n + ' ₫';

const formatFull = (n) => (n != null ? n.toLocaleString('vi-VN') + ' ₫' : '0 ₫');

const FinancialReport = () => {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2025);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [donRes, campRes, distRes] = await Promise.all([
          getAllDonations(),
          getAllCampaigns(),
          getAllDistributions(),
        ]);
        setDonations(donRes.data || donRes);
        setCampaigns(campRes.data || campRes);
        setDistributions(distRes.data || distRes);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const yearDonations = donations.filter((d) => {
    const dateStr = d.ngaygui || d.ngayGui || d.ngaytao || '';
    const y = new Date(dateStr).getFullYear();
    return y === year;
  });

  const totalDonated = donations
    .filter((d) => d.trangthai === 'DaNhan' || d.trangthai === 'HoanThanh' || d.trangthai === 'DaDuyet')
    .reduce((s, d) => s + (d.soTienTT ?? d.soTienDK ?? d.amount ?? 0), 0);

  const totalDistributed = distributions
    .filter((d) => d.trangthai === 'DaTrao' || d.trangthai === 'DaDuyet')
    .reduce((s, d) => s + (d.tongtien || (d.chiTiet || []).reduce((ss, ct) => ss + (ct.soTien || 0), 0)), 0);

  const balance = totalDonated - totalDistributed;
  const activeCampaigns = campaigns.filter((c) => c.trangthai === 'DangChay').length;

  const barData = MONTHS.map((month, i) => {
    const monthDons = yearDonations.filter((d) => {
      const dateStr = d.ngaygui || d.ngayGui || '';
      const m = new Date(dateStr).getMonth();
      return m === i;
    });
    return {
      name: month,
      'Quyên góp': monthDons.reduce((s, d) => s + (d.soTienTT ?? d.soTienDK ?? d.amount ?? 0), 0),
    };
  });

  // Biểu đồ tròn: Cơ cấu giải ngân theo từng đợt phân bổ
  const pieData = distributions.slice(0, 6).map((d) => ({
    name: d.tendot || d.title,
    value: d.tongtien || (d.chiTiet || []).reduce((s, ct) => s + (ct.soTien || 0), 0),
  }));

  const topCampaigns = campaigns
    .map((c) => {
      const raised = c.tongtienDaNhan !== undefined && c.tongtienDaNhan !== null
        ? c.tongtienDaNhan
        : donations
            .filter((d) => d.maBaiTaiTro === c.maBaiTaiTro && (d.trangthai === 'DaNhan' || d.trangthai === 'HoanThanh'))
            .reduce((s, d) => s + (d.soTienTT ?? d.soTienDK ?? d.amount ?? 0), 0);
      return { ...c, raised };
    })
    .sort((a, b) => b.raised - a.raised)
    .slice(0, 5);

  const KpiCard = ({ icon, label, value, sub, color }) => (
    <div className="fr-kpi" style={{ '--kpi-color': color }}>
      <div className="fr-kpi__icon">{icon}</div>
      <div className="fr-kpi__body">
        <div className="fr-kpi__value">{value}</div>
        <div className="fr-kpi__label">{label}</div>
        {sub && <div className="fr-kpi__sub">{sub}</div>}
      </div>
    </div>
  );

  if (loading) return <div className="fr-loading">Đang tải báo cáo...</div>;

  return (
    <div className="financial-report">
      <div className="fr-header">
        <div>
          <h1>Báo cáo tài chính</h1>
          <p>Tổng quan thu chi quỹ trường PT Chuyên Biệt Nguyễn Đình Chiểu</p>
        </div>
        <select className="fr-year-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="fr-kpis">
        <KpiCard
          icon={<FiTrendingUp />}
          label="Tổng quyên góp"
          value={formatFull(totalDonated)}
          color="#4361ee"
        />
        <KpiCard
          icon={<FiTrendingDown />}
          label="Tổng giải ngân"
          value={formatFull(totalDistributed)}
          color="#f72585"
        />
        <KpiCard
          icon={<FiDollarSign />}
          label="Số dư quỹ"
          value={formatFull(balance)}
          sub={balance >= 0 ? 'Dương' : 'Âm'}
          color={balance >= 0 ? '#4cc9f0' : '#e74c3c'}
        />
        <KpiCard
          icon={<FiActivity />}
          label="Dự án đang chạy"
          value={activeCampaigns + ' chiến dịch'}
          color="#7209b7"
        />
      </div>

      <div className="fr-charts">
        <div className="fr-chart-card">
          <h3>Quyên góp theo tháng ({year})</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatFull(v)} />
              <Bar dataKey="Quyên góp" fill="#4361ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="fr-chart-card">
          <h3>Cơ cấu kinh phí các đợt phân bổ</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                outerRadius={85}
                dataKey="value"
                label={({ name, percent }) => `${name ? (name.length > 15 ? name.slice(0, 15) + '...' : name) : 'Đợt'} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatFull(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="fr-table-card">
        <h3>Top chiến dịch theo số tiền quyên góp</h3>
        <table className="fr-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tiêu đề chiến dịch</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Đã quyên góp</th>
            </tr>
          </thead>
          <tbody>
            {topCampaigns.map((c, i) => (
              <tr key={c.maBaiTaiTro}>
                <td>{i + 1}</td>
                <td>{c.tieude}</td>
                <td>
                  <span className={`fr-badge fr-badge--${c.trangthai?.toLowerCase()}`}>
                    {c.trangthai}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatFull(c.raised)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialReport;
