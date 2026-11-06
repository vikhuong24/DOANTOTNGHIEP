// CampaignList: Danh sách bài kêu gọi tài trợ dành cho khách vãng lai
import { useState, useEffect, useMemo } from 'react';
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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const campsRes = await getAllCampaigns();
        setCampaigns(campsRes.data || []);
      } catch (err) {
        console.error('Lỗi tải dữ liệu chiến dịch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lọc chiến dịch theo từ khóa tìm kiếm
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      // Chỉ hiển thị các bài ĐangChay, DaDuyet, KetThuc cho khách xem
      const isValidStatus = ['DangChay', 'DaDuyet', 'KetThuc'].includes(camp.trangthai);
      if (!isValidStatus) return false;

      // Search keyword
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = camp.tieude?.toLowerCase().includes(q);
        const matchDesc = camp.noidung?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [campaigns, searchQuery]);

  // Phân trang
  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE) || 1;
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCampaigns.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCampaigns, currentPage]);

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
              placeholder="Tìm kiếm chương trình gây quỹ theo tên hoặc nội dung..."
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
      ) : paginatedCampaigns.length === 0 ? (
        <EmptyState
          title="Không tìm thấy bài tài trợ phù hợp"
          description="Hãy thử thay đổi từ khóa tìm kiếm của bạn."
          actionLabel="Xem tất cả chương trình"
          onAction={() => {
            setSearchQuery('');
            setCurrentPage(1);
          }}
        />
      ) : (
        <>
          <div className="campaign-grid">
            {paginatedCampaigns.map((camp) => {
              const target = camp.muctieu || 0;
              const raised = camp.tongtienDaNhan || 0;
              const percent = target > 0 ? (raised / target) * 100 : 0;
              const daysLeft = daysRemaining(camp.ngaykethuc);

              return (
                <Card
                  key={camp.maBaiTaiTro}
                  hoverable
                  padding={false}
                  onClick={() => handleCardClick(camp.maBaiTaiTro)}
                >
                  <div className="campaign-card-thumb-wrap">
                    <img
                      src={camp.anhbia || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'}
                      alt={camp.tieude}
                      className="campaign-card-thumb"
                    />
                    <div className="campaign-card-badge">
                      <span className={`badge ${camp.trangthai === 'DangChay' ? 'badge--success' : 'badge--primary'}`}>
                        {CAMPAIGN_STATUS_LABEL[camp.trangthai] || camp.trangthai}
                      </span>
                    </div>
                  </div>

                  <div className="campaign-card-content">
                    <h3 className="campaign-card-title">{camp.tieude}</h3>
                    <p className="campaign-card-desc">{camp.noidung}</p>

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
                      <span>{camp.trangthai === 'KetThuc' ? 'Đã kết thúc' : `Còn ${daysLeft} ngày`}</span>
                    </div>
                    <span>{Math.min(100, percent).toFixed(0)}% đạt được</span>
                  </div>
                </Card>
              );
            })}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={(page) => setCurrentPage(page)}
          />
        </>
      )}
    </div>
  );
};

export default CampaignList;
