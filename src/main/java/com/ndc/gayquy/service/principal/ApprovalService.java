package com.ndc.gayquy.service.principal;

import com.ndc.gayquy.common.enums.TrangThaiBaiDang;
import com.ndc.gayquy.common.enums.TrangThaiDotPhanBo;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.principal.*;
import com.ndc.gayquy.entity.*;
import com.ndc.gayquy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service("principalApprovalService")
@RequiredArgsConstructor
public class ApprovalService {

    private final TTTaiTroRepository ttTaiTroRepository;
    private final DotPhanBoRepository dotPhanBoRepository;
    private final CTPhanBoRepository ctPhanBoRepository;
    private final NguoiDungRepository nguoiDungRepository;

    // ==========================================
    // 1. DUYỆT BÀI ĐĂNG KÊU GỌI (TT_TAITRO)
    // ==========================================

    /**
     * 1.1 Lấy danh sách bài đăng gây quỹ chờ duyệt (trangthai = 'ChoDuyet' hoặc 'CHO_DUYET')
     */
    @Transactional(readOnly = true)
    public List<PrincipalCampaignResponse> getPendingCampaigns() {
        List<TrangThaiBaiDang> pendingStatuses = List.of(
                TrangThaiBaiDang.CHODUYET
        );
        List<TTTaiTro> list = ttTaiTroRepository.findByTrangThaiInOrderByMaBaiTaiTroDesc(pendingStatuses);

        return list.stream()
                .map(this::mapToCampaignResponse)
                .collect(Collectors.toList());
    }

    /**
     * 1.2 Hiệu trưởng phê duyệt (DADUYET) hoặc từ chối (TUCHOI) bài đăng
     */
    @Transactional
    public PrincipalCampaignResponse decideCampaign(Long maBaiTaiTro, Long hieuTruongId, PrincipalDecisionRequest request) {
        TTTaiTro campaign = ttTaiTroRepository.findById(maBaiTaiTro)
                .orElseThrow(() -> new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND));

        NguoiDung hieuTruong = nguoiDungRepository.findById(hieuTruongId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String decision = request.getTrangthai() != null ? request.getTrangthai().trim() : "";

        if (decision.equalsIgnoreCase("DaDuyet") || decision.equalsIgnoreCase("DADUYET")) {
            campaign.setTrangThai(TrangThaiBaiDang.DADUYET);
            log.info("Hiệu trưởng #{} đã PHÊ DUYỆT bài đăng kêu gọi #{}", hieuTruongId, maBaiTaiTro);
        } else if (decision.equalsIgnoreCase("TuChoi") || decision.equalsIgnoreCase("TUCHOI") || decision.equalsIgnoreCase("TU_CHOI")) {
            campaign.setTrangThai(TrangThaiBaiDang.TUCHOI);
            log.info("Hiệu trưởng #{} đã TỪ CHỐI bài đăng kêu gọi #{}, lý do: {}",
                    hieuTruongId, maBaiTaiTro, request.getLydo());
        } else {
            throw new AppException(ErrorCode.INVALID_KEY, "Trạng thái quyết định không hợp lệ! Chỉ chấp nhận 'DADUYET' hoặc 'TUCHOI'.");
        }

        campaign.setHieuTruong(hieuTruong);
        TTTaiTro saved = ttTaiTroRepository.save(campaign);

        return mapToCampaignResponse(saved);
    }

    // ==========================================
    // 2. DUYỆT ĐỢT PHÂN BỔ KINH PHÍ (DOTPHANBO)
    // ==========================================

    /**
     * 2.1 Lấy danh sách đợt phân bổ chờ duyệt (trangthai = 'CHODUYET')
     */
    @Transactional(readOnly = true)
    public List<PrincipalDistributionResponse> getPendingDistributions() {
        List<TrangThaiDotPhanBo> pendingStatuses = List.of(
                TrangThaiDotPhanBo.CHODUYET
        );
        List<DotPhanBo> list = dotPhanBoRepository.findByTrangThaiInOrderByMaDotPhanBoDesc(pendingStatuses);

        return list.stream()
                .map(dot -> {
                    List<CTPhanBo> details = ctPhanBoRepository.findByDotPhanBo_MaDotPhanBo(dot.getMaDotPhanBo());
                    return mapToDistributionResponse(dot, details);
                })
                .collect(Collectors.toList());
    }

    /**
     * 2.2 Hiệu trưởng phê duyệt (DADUYET) hoặc từ chối đợt phân bổ
     */
    @Transactional
    public PrincipalDistributionResponse decideDistribution(Long maDotPhanBo, Long hieuTruongId, PrincipalDecisionRequest request) {
        DotPhanBo dotPhanBo = dotPhanBoRepository.findById(maDotPhanBo)
                .orElseThrow(() -> new AppException(ErrorCode.DOT_PHAN_BO_NOT_FOUND));

        NguoiDung hieuTruong = nguoiDungRepository.findById(hieuTruongId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String decision = request.getTrangthai() != null ? request.getTrangthai().trim() : "";

        if (decision.equalsIgnoreCase("DaDuyet") || decision.equalsIgnoreCase("DADUYET")) {
            dotPhanBo.setTrangThai(TrangThaiDotPhanBo.DADUYET);
            log.info("Hiệu trưởng #{} đã PHÊ DUYỆT đợt phân bổ kinh phí #{}", hieuTruongId, maDotPhanBo);
        } else if (decision.equalsIgnoreCase("TuChoi") || decision.equalsIgnoreCase("TUCHOI") || decision.equalsIgnoreCase("TU_CHOI")) {
            log.info("Hiệu trưởng #{} đã TỪ CHỐI đợt phân bổ kinh phí #{}, lý do: {}",
                    hieuTruongId, maDotPhanBo, request.getLydo());
        } else {
            throw new AppException(ErrorCode.INVALID_KEY, "Trạng thái quyết định không hợp lệ! Chỉ chấp nhận 'DADUYET' hoặc 'TUCHOI'.");
        }

        dotPhanBo.setHieuTruong(hieuTruong);
        DotPhanBo saved = dotPhanBoRepository.save(dotPhanBo);

        List<CTPhanBo> details = ctPhanBoRepository.findByDotPhanBo_MaDotPhanBo(saved.getMaDotPhanBo());
        return mapToDistributionResponse(saved, details);
    }

    private PrincipalCampaignResponse mapToCampaignResponse(TTTaiTro c) {
        NguoiDung canBo = c.getCanBo();
        NguoiDung ht = c.getHieuTruong();

        return PrincipalCampaignResponse.builder()
                .maBaiTaiTro(c.getMaBaiTaiTro())
                .tieuDe(c.getTieuDe())
                .noiDung(c.getNoiDung())
                .anhBia(c.getAnhBia())
                .mucTieu(c.getMucTieu())
                .tongTienDaNhan(c.getTongTienDaNhan())
                .trangThai(c.getTrangThai())
                .maCanBo(canBo != null ? canBo.getMaNguoiDung() : null)
                .tenCanBo(canBo != null ? canBo.getHoTen() : null)
                .maHieuTruong(ht != null ? ht.getMaNguoiDung() : null)
                .tenHieuTruong(ht != null ? ht.getHoTen() : null)
                .ngayBatDau(c.getNgayBatDau())
                .ngayKetThuc(c.getNgayKetThuc())
                .build();
    }

    private PrincipalDistributionResponse mapToDistributionResponse(DotPhanBo dot, List<CTPhanBo> details) {
        TTTaiTro bai = dot.getBaiTaiTro();
        NguoiDung canBo = dot.getCanBo();
        NguoiDung ht = dot.getHieuTruong();

        List<PrincipalDistributionDetailResponse> detailList = null;
        if (details != null) {
            detailList = details.stream().map(ct -> {
                HocSinh hs = ct.getHocSinh();
                return PrincipalDistributionDetailResponse.builder()
                        .maChiTietPhanBo(ct.getMaChiTietPhanBo())
                        .maHocSinh(hs != null ? hs.getMaHocSinh() : null)
                        .tenHocSinh(hs != null ? hs.getHoTen() : null)
                        .lop(hs != null ? hs.getLop() : null)
                        .soTien(ct.getSoTien())
                        .nguoiNhan(ct.getNguoiNhan())
                        .ngayNhan(ct.getNgayNhan())
                        .ghiChu(ct.getGhiChu())
                        .build();
            }).collect(Collectors.toList());
        }

        return PrincipalDistributionResponse.builder()
                .maDotPhanBo(dot.getMaDotPhanBo())
                .maBaiTaiTro(bai != null ? bai.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(bai != null ? bai.getTieuDe() : null)
                .tenDot(dot.getTenDot())
                .tongTien(dot.getTongTien())
                .ngayTrao(dot.getNgayTrao())
                .trangThai(dot.getTrangThai())
                .maCanBo(canBo != null ? canBo.getMaNguoiDung() : null)
                .tenCanBo(canBo != null ? canBo.getHoTen() : null)
                .maHieuTruong(ht != null ? ht.getMaNguoiDung() : null)
                .tenHieuTruong(ht != null ? ht.getHoTen() : null)
                .chiTietPhanBo(detailList)
                .build();
    }
}
