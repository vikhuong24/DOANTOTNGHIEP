import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { FiHeart, FiActivity, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Table from '../../../../components/Table/Table';
import { getAllCampaigns } from '../../../../services/campaignService';
import { getAllDonations } from '../../../../services/donationService';
import './CampaignStatistics.css';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const PIE_COLORS = ['#4361ee','#4cc9f0','#f72585','#7209b7','#302b63'];

const formatFull = (n) => (n != null ? n.toLocaleString('vi-VN') + ' ₫' : '0 ₫');

const KpiCard = ({ icon, label, value, color }) => (
  <div className="cs-kpi" style={{ '--kpi-c': color }}>
    <div className="cs-kpi__icon">{icon}</div>
    <div>
      <div className="cs-kpi__value">{value}</div>
      <div className="cs-kpi__label">{label}</div>
    </div>
  </div>
);

const CampaignStatistics = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [campRes, donRes] = await Promise.all([
          getAllCampaigns(),
          getAllDonations(),
        ]);
        setCampaigns(campRes.data || campRes);
        setDonations(donRes.data || donRes);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const total = campaigns.length;
  const active = campaigns.filter((c) => c.trangthai === 'DangChay').length;
  const done = campaigns.filter((c) => c.trangthai === 'KetThuc').length;
  const rejected = campaigns.filter((c) => c.trangthai === 'TuChoi').length;
  const pending = campaigns.filter((c) => c.trangthai === 'ChoDuyet').length;

  const barData = MONTHS.map((month, i) => {
    const count = campaigns.filter((c) => {
      const m = new Date(c.ngaybatdau || '').getMonth();
      return m === i;
    }).length;
    return { name: month, 'Chiến dịch': count };
  });

  const pieData = [
    { name: 'Đang chạy', value: active },
    { name: 'Đã hoàn thành', value: done },
    { name: 'Chờ duyệt', value: pending },
    { name: 'Từ chối', value: rejected },
  ].filter((item) => item.value > 0);

  const topCamps = campaigns
    .map((c) => {
      const raised = c.tongtienDaNhan !== undefined && c.tongtienDaNhan !== null
        ? c.tongtienDaNhan
        : donations
            .filter((d) => d.maBaiTaiTro === c.maBaiTaiTro && (d.trangthai === 'DaNhan' || d.trangthai === 'HoanThanh'))
            .reduce((s, d) => s + (d.soTienTT ?? d.soTienDK ?? d.amount ?? 0), 0);
      return { ...c, raised, _id: c.maBaiTaiTro };
    })
    .sort((a, b) => b.raised - a.raised)
    .slice(0, 10)
    .map((c, i) => ({ ...c, _stt: i + 1 }));

  const statusBadge = (s) => {
    const map = {
      DangChay: { label: 'Đang chạy', cls: 'cs-badge--active' },
      KetThuc: { label: 'Kết thúc', cls: 'cs-badge--done' },
      ChoDuyet: { label: 'Chờ duyệt', cls: 'cs-badge--pending' },
      DaDuyet: { label: 'Đã duyệt', cls: 'cs-badge--approved' },
      TuChoi: { label: 'Từ chối', cls: 'cs-badge--rejected' },
    };
    const info = map[s] || { label: s, cls: '' };
    return <span className={`cs-badge ${info.cls}`}>{info.label}</span>;
  };

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    { key: 'tieude', title: 'Tiêu đề chiến dịch', render: (_, row) => <span className="cs-title">{row.tieude}</span> },
    { key: 'trangthai', title: 'Trạng thái', render: (_, row) => statusBadge(row.trangthai) },
    { key: 'ngaybatdau', title: 'Ngày bắt đầu', render: (_, row) => row.ngaybatdau },
    { key: 'raised', title: 'Đã tiếp nhận', align: 'right', render: (_, row) => <strong>{formatFull(row.raised)}</strong> },
  ];

  if (loading) return <div className="cs-loading">Đang tải thống kê...</div>;

  return (
    <div className="campaign-statistics">
      <div className="cs-header">
        <h1>Thống kê chiến dịch</h1>
        <p>Tổng quan tất cả bài kêu gọi tài trợ trên hệ thống</p>
      </div>

      <div className="cs-kpis">
        <KpiCard icon={<FiHeart />} label="Tổng chiến dịch" value={total} color="#302b63" />
        <KpiCard icon={<FiActivity />} label="Đang chạy" value={active} color="#4361ee" />
        <KpiCard icon={<FiCheckCircle />} label="Hoàn thành" value={done} color="#4cc9f0" />
        <KpiCard icon={<FiXCircle />} label="Từ chối" value={rejected} color="#f72585" />
      </div>

      <div className="cs-charts">
        <div className="cs-chart-card">
          <h3>Chiến dịch theo tháng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Chiến dịch" fill="#302b63" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="cs-chart-card">
          <h3>Phân bố theo trạng thái chiến dịch</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData} cx="50%" cy="50%" outerRadius={85}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cs-table-card">
        <h3>Top 10 chiến dịch gây quỹ nhiều nhất</h3>
        <Table
          columns={columns}
          data={topCamps}
          rowKey="_id"
          emptyTitle="Không có dữ liệu"
        />
      </div>
    </div>
  );
};

export default CampaignStatistics;
