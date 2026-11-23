// CampaignList: Danh sách bài kêu gọi tài trợ dành cho khách vãng lai
// Kết nối trực tiếp API Backend Spring Boot: GET /guest/campaigns
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiSearch } from 'react-icons/fi';
import Card from '../../../../components/Card/Card';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import Pagination from '../../../../components/Pagination/Pagination';
import Loading from '../../../../components/Loading/Loading';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getAllCampaigns } from '../../../../services/campaignService';
import { formatCurrencyShort } from '../../../../utils/formatCurrency';
import { daysRemaining } from '../../../../utils/formatDate';
import { CAMPAIGN_STATUS_LABEL } from '../../../../utils/constants';
import './CampaignList.css';

const ITEMS_PER_PAGE = 6;

const CampaignList = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Gọi API lấy danh sách chiến dịch kèm tìm kiếm và phân trang từ Backend
  const fetchCampaigns = useCallback(async (page, keyword) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllCampaigns({
        keyword: keyword || undefined,
        page: page - 1, // Spring Boot phân trang từ 0
        size: ITEMS_PER_PAGE,
      });

      setCampaigns(res.items || res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements ?? (res.items || []).length);
    } catch (err) {
      console.error('Lỗi tải dữ liệu chiến dịch:', err);
      setError(err?.message || 'Không thể tải danh sách chiến dịch từ máy chủ');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải danh sách khi đổi trang hoặc khi đổi từ khóa tìm kiếm (kèm debounce 400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCampaigns(currentPage, searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchCampaigns, currentPage, searchQuery]);

  const handleCardClick = (id) => {
    navigate(`/campaigns/${id}`);
  };

  return (
    <div className="container campaign-list-page">
      {/* Hero Banner */}
      <div className="campaign-hero">
        <h1 className="campaign-hero-title">Chung tay vì nụ cười học sinh đặc biệt</h1>
        <p className="campaign-hero-desc">
          Mỗi sự đóng góp dù nhỏ bé đều là nguồn động viên to lớn giúp các em học sinh khiếm thị, khiếm thính và khuyết tật tại trường Nguyễn Đình Chiểu vững bước tới trường.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="campaign-filters">
        <div className="campaign-search-bar" style={{ width: '100%' }}>
          <div className="input-field-wrap campaign-search-input">
            <input
              type="text"
              placeholder="Tìm kiếm chương trình gây quỹ theo tên chiến dịch..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Campaign Grid */}
      {loading ? (
        <Loading type="skeleton" rows={4} />
      ) : error ? (
        <EmptyState
          title="Đã xảy ra lỗi khi tải dữ liệu"
          description={error}
          actionLabel="Thử lại"
          onAction={() => fetchCampaigns(currentPage, searchQuery)}
        />
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="Không tìm thấy bài tài trợ phù hợp"
          description={searchQuery ? `Không có chiến dịch nào chứa từ khóa "${searchQuery}".` : 'Hiện tại chưa có chiến dịch gây quỹ nào đang công khai.'}
          actionLabel={searchQuery ? 'Xem tất cả chương trình' : undefined}
          onAction={searchQuery ? () => {
            setSearchQuery('');
            setCurrentPage(1);
          } : undefined}
        />
      ) : (
        <>
          <div className="campaign-grid">
            {campaigns.map((camp) => {
              const target = camp.mucTieu || 0;
              const raised = camp.tongTienDaNhan || 0;
              const percent = camp.phanTramHoanThanh !== undefined ? camp.phanTramHoanThanh : (target > 0 ? (raised / target) * 100 : 0);
              const daysLeft = daysRemaining(camp.ngayKetThuc);
              const statusKey = camp.trangThai || camp.trangthai;
              const isEnded = statusKey === 'KETTHUC' || statusKey === 'KetThuc';

              return (
                <Card
                  key={camp.maBaiTaiTro}
                  hoverable
                  padding={false}
                  onClick={() => handleCardClick(camp.maBaiTaiTro)}
                >
                  <div className="campaign-card-thumb-wrap">
                    <img
                      src={camp.anhBia || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'}
                      alt={camp.tieuDe}
                      className="campaign-card-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600';
                      }}
                    />
                    <div className="campaign-card-badge">
                      <span className={`badge ${!isEnded ? 'badge--success' : 'badge--primary'}`}>
                        {CAMPAIGN_STATUS_LABEL[statusKey] || (isEnded ? 'Kết thúc' : 'Đang vận động')}
                      </span>
                    </div>
                  </div>

                  <div className="campaign-card-content">
                    <h3 className="campaign-card-title">{camp.tieuDe}</h3>
                    {camp.noiDung && (
                      <p className="campaign-card-desc">{camp.noiDung}</p>
                    )}

                    <ProgressBar percent={percent} showLabel={false} height={8} />

                    <div className="campaign-card-stats">
                      <div className="campaign-card-stats-item campaign-card-stats-item--raised">
                        <span>Đã tiếp nhận</span>
                        <span>{formatCurrencyShort(raised)}</span>
                      </div>
                      <div className="campaign-card-stats-item" style={{ alignItems: 'flex-end' }}>
                        <span>Mục tiêu</span>
                        <span>{formatCurrencyShort(target)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="campaign-card-footer">
                    <div className="campaign-card-days">
                      <FiClock size={14} />
                      <span>{isEnded ? 'Đã kết thúc' : (daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Hôm nay')}</span>
                    </div>
                    <span>{Math.min(100, Math.max(0, percent)).toFixed(0)}% đạt được</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CampaignList;
