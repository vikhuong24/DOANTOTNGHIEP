package com.ndc.gayquy.service.guest;

import com.ndc.gayquy.common.enums.TrangThaiBaiTaiTro;
import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.guest.CampaignDetailResponse;
import com.ndc.gayquy.dto.guest.CampaignSummaryResponse;
import com.ndc.gayquy.dto.guest.DonationHistoryItemResponse;
import com.ndc.gayquy.dto.guest.PageCustomResponse;
import com.ndc.gayquy.entity.TaiTro;
import com.ndc.gayquy.entity.TTTaiTro;
import com.ndc.gayquy.repository.TaiTroRepository;
import com.ndc.gayquy.repository.TTTaiTroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CampaignService {

    private final TTTaiTroRepository ttTaiTroRepository;
    private final TaiTroRepository taiTroRepository;

    /**
     * Lấy danh sách bài đăng gây quỹ (trangthai = 'DaDuyet', 'DangChay', hoặc 'DANG_VAN_DONG').
     * Hỗ trợ tìm kiếm theo từ khóa (tiêu đề) và phân trang.
     */
    @Transactional(readOnly = true)
    public PageCustomResponse<CampaignSummaryResponse> layDanhSachBaiDang(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("maBaiTaiTro").descending());

        // Hỗ trợ các trạng thái hợp lệ của bài đăng
        List<TrangThaiBaiTaiTro> validStatuses = Arrays.asList(
                TrangThaiBaiTaiTro.DANG_VAN_DONG,
                TrangThaiBaiTaiTro.DangChay,
                TrangThaiBaiTaiTro.DaDuyet,
                TrangThaiBaiTaiTro.HOAN_THANH
        );

        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        Page<TTTaiTro> pageResult = ttTaiTroRepository.findActiveCampaigns(validStatuses, searchKeyword, pageable);

        Page<CampaignSummaryResponse> mappedPage = pageResult.map(this::mapToSummary);
        return PageCustomResponse.from(mappedPage);
    }

    /**
     * Chi tiết bài đăng gây quỹ + danh sách Nhà hảo tâm đã ủng hộ (tenhienthi, soitentt)
     */
    @Transactional(readOnly = true)
    public CampaignDetailResponse layChiTietBaiDang(Long id) {
        TTTaiTro campaign = ttTaiTroRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND));

        // Lấy danh sách các lượt tài trợ đã thành công (THANH_CONG hoặc DaNhan)
        List<TrangThaiTaiTro> successStatuses = Arrays.asList(TrangThaiTaiTro.THANH_CONG, TrangThaiTaiTro.DaNhan);
        List<TaiTro> donations = taiTroRepository.findByBaiTaiTro_MaBaiTaiTro(id).stream()
                .filter(t -> successStatuses.contains(t.getTrangThai()))
                .collect(Collectors.toList());

        List<DonationHistoryItemResponse> donationItems = donations.stream()
                .map(d -> DonationHistoryItemResponse.builder()
                        .maTaiTro(d.getMaTaiTro())
                        .tenHienThi(d.getTenHienThi() != null && !d.getTenHienThi().isBlank() ? d.getTenHienThi() : "Nhà hảo tâm ẩn danh")
                        .soTienTt(d.getSoTienTt())
                        .ngayNhan(d.getNgayNhan())
                        .ghiChu(d.getGhiChu())
                        .build())
                .collect(Collectors.toList());

        BigDecimal mucTieu = campaign.getMucTieu() != null ? campaign.getMucTieu() : BigDecimal.ZERO;
        BigDecimal daNhan = campaign.getTongTienDaNhan() != null ? campaign.getTongTienDaNhan() : BigDecimal.ZERO;
        double percent = 0.0;
        if (mucTieu.compareTo(BigDecimal.ZERO) > 0) {
            percent = daNhan.divide(mucTieu, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        return CampaignDetailResponse.builder()
                .maBaiTaiTro(campaign.getMaBaiTaiTro())
                .tieuDe(campaign.getTieuDe())
                .noiDung(campaign.getNoiDung())
                .anhBia(campaign.getAnhBia())
                .mucTieu(campaign.getMucTieu())
                .tongTienDaNhan(campaign.getTongTienDaNhan())
                .phanTramHoanThanh(percent)
                .trangThai(campaign.getTrangThai())
                .ngayBatDau(campaign.getNgayBatDau())
                .ngayKetThuc(campaign.getNgayKetThuc())
                .maCanBo(campaign.getCanBo() != null ? campaign.getCanBo().getMaNguoiDung() : null)
                .tenCanBo(campaign.getCanBo() != null ? campaign.getCanBo().getHoTen() : null)
                .tenHieuTruongDuyet(campaign.getHieuTruong() != null ? campaign.getHieuTruong().getHoTen() : null)
                .danhSachNhaHaoTam(donationItems)
                .build();
    }

    private CampaignSummaryResponse mapToSummary(TTTaiTro campaign) {
        BigDecimal mucTieu = campaign.getMucTieu() != null ? campaign.getMucTieu() : BigDecimal.ZERO;
        BigDecimal daNhan = campaign.getTongTienDaNhan() != null ? campaign.getTongTienDaNhan() : BigDecimal.ZERO;
        double percent = 0.0;
        if (mucTieu.compareTo(BigDecimal.ZERO) > 0) {
            percent = daNhan.divide(mucTieu, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        return CampaignSummaryResponse.builder()
                .maBaiTaiTro(campaign.getMaBaiTaiTro())
                .tieuDe(campaign.getTieuDe())
                .anhBia(campaign.getAnhBia())
                .mucTieu(campaign.getMucTieu())
                .tongTienDaNhan(campaign.getTongTienDaNhan())
                .phanTramHoanThanh(percent)
                .trangThai(campaign.getTrangThai())
                .ngayBatDau(campaign.getNgayBatDau())
                .ngayKetThuc(campaign.getNgayKetThuc())
                .tenCanBoPhuTrach(campaign.getCanBo() != null ? campaign.getCanBo().getHoTen() : null)
                .build();
    }
}
