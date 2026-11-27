import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { FiHeart, FiActivity, FiCheckCircle, FiXCircle, FiClock, FiFileText } from 'react-icons/fi';
import Table from '../../../../components/Table/Table';
import { useNotification } from '../../../../components/Notification/Notification';
import { getAdminCampaignStatistics } from '../../../../services/reportService';
import './CampaignStatistics.css';

const PIE_COLORS = ['#2e7d5b', '#4361ee', '#f59e0b', '#dc2626', '#6b7280'];

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
  const { addToast } = useNotification();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getAdminCampaignStatistics();
        setStats(data || null);
      } catch (err) {
        addToast(err?.response?.data?.message || err?.message || 'Không thể tải thống kê chiến dịch', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);

  const total = stats?.tongSoBaiDang ?? 0;
  const active = stats?.soBaiDangChay ?? 0;
  const pending = stats?.soBaiChoDuyet ?? 0;
  const done = stats?.soBaiKetThuc ?? 0;
  const draft = stats?.soBaiNhap ?? 0;
  const rejected = stats?.soBaiTuChoi ?? 0;
  const monthlyList = (Array.isArray(stats?.thongKeTheoThang) ? [...stats.thongKeTheoThang] : [])
    .sort((a, b) => (Number(a.nam || 0) - Number(b.nam || 0)) || (Number(a.thang || 0) - Number(b.thang || 0)));

  const barData = monthlyList.map((m) => ({
    name: `T${m.thang}/${m.nam}`,
    'Chiến dịch': Number(m.soBaiDang || 0),
  }));

  const pieData = [
    { name: 'Đang chạy (DADUYET)', value: active },
    { name: 'Kết thúc (KETTHUC)', value: done },
    { name: 'Chờ duyệt (CHODUYET)', value: pending },
    { name: 'Từ chối (TUCHOI)', value: rejected },
    { name: 'Lưu nháp (NHAP)', value: draft },
  ].filter((item) => item.value > 0);

  const columns = [
    { key: '_stt', title: 'STT', width: 56 },
    { key: 'nam', title: 'Năm', width: 100 },
    { key: 'thang', title: 'Tháng', width: 100, render: (v) => `Tháng ${v}` },
    { key: 'soBaiDang', title: 'Số lượng chiến dịch', align: 'right', render: (v) => <strong>{v}</strong> },
  ];

  return (
    <div className="campaign-statistics">
      <div className="cs-header">
        <div>
          <h1>Thống kê tổng quan chiến dịch</h1>
          <p>Số liệu thực tế về bài đăng gây quỹ và phân bổ theo tháng (GET /admin/statistics/campaigns)</p>
        </div>
      </div>

      <div className="cs-kpis">
        <KpiCard icon={<FiHeart />} label="Tổng chiến dịch" value={loading ? '...' : total} color="#4361ee" />
        <KpiCard icon={<FiActivity />} label="Đang chạy (DADUYET)" value={loading ? '...' : active} color="#2e7d5b" />
        <KpiCard icon={<FiClock />} label="Chờ duyệt (CHODUYET)" value={loading ? '...' : pending} color="#f59e0b" />
        <KpiCard icon={<FiCheckCircle />} label="Đã kết thúc (KETTHUC)" value={loading ? '...' : done} color="#4cc9f0" />
        <KpiCard icon={<FiFileText />} label="Lưu nháp (NHAP)" value={loading ? '...' : draft} color="#6b7280" />
        <KpiCard icon={<FiXCircle />} label="Từ chối (TUCHOI)" value={loading ? '...' : rejected} color="#f72585" />
      </div>

      <div className="cs-charts">
        <div className="cs-chart-card cs-chart-card--wide">
          <h3>Số chiến dịch khởi tạo theo tháng</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Chiến dịch" fill="#4361ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cs-chart-card">
          <h3>Phân bố trạng thái</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={78}
                label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cs-table-card">
        <h3>Thống kê chiến dịch theo tháng</h3>
        <Table
          columns={columns}
          data={monthlyList.map((m, i) => ({ ...m, _stt: i + 1, _id: `${m.nam}-${m.thang}` }))}
          loading={loading}
          rowKey="_id"
          emptyTitle="Chưa có dữ liệu thống kê"
          emptyDescription="Chưa có chiến dịch nào được ghi nhận theo tháng."
        />
      </div>
    </div>
  );
};

export default CampaignStatistics;
