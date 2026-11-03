package com.ndc.gayquy.service.fundraiser;

import com.ndc.gayquy.common.enums.TrangThaiDotPhanBo;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.fundraiser.*;
import com.ndc.gayquy.entity.*;
import com.ndc.gayquy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service("fundraiserDistributionService")
@RequiredArgsConstructor
public class DistributionService {

    private final DotPhanBoRepository dotPhanBoRepository;
    private final CTPhanBoRepository ctPhanBoRepository;
    private final TTTaiTroRepository ttTaiTroRepository;
    private final HocSinhRepository hocSinhRepository;
    private final NguoiDungRepository nguoiDungRepository;

    /**
     * 4.1 Tạo đợt phân bổ (DOTPHANBO) và chi tiết (CT_PHANBO) với trangthai='ChoDuyet'
     */
    @Transactional
    public DistributionResponse createDistribution(Long canBoId, CreateDistributionRequest request) {
        log.info("Cán bộ #{} bắt đầu lập đợt phân bổ: {}", canBoId, request.getTenDot());

        NguoiDung canBo = nguoiDungRepository.findById(canBoId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        TTTaiTro baiTaiTro = ttTaiTroRepository.findById(request.getMaBaiTaiTro())
                .orElseThrow(() -> new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND));

        if (request.getChiTietPhanBo() == null || request.getChiTietPhanBo().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_KEY, "Danh sách học sinh nhận phân bổ không được để trống!");
        }

        // Tính tổng tiền phân bổ và xác thực danh sách học sinh
        BigDecimal tongTien = BigDecimal.ZERO;
        List<HocSinh> hocSinhList = new ArrayList<>();

        for (DistributionDetailItemRequest item : request.getChiTietPhanBo()) {
            HocSinh hs = hocSinhRepository.findById(item.getMaHocSinh())
                    .orElseThrow(() -> new AppException(ErrorCode.HOC_SINH_NOT_FOUND, "Không tìm thấy học sinh với mã: " + item.getMaHocSinh()));
            hocSinhList.add(hs);
            tongTien = tongTien.add(item.getSoTien());
        }

        // 1. Tạo đợt phân bổ với trangthai = ChoDuyet
        DotPhanBo dotPhanBo = DotPhanBo.builder()
                .baiTaiTro(baiTaiTro)
                .tenDot(request.getTenDot().trim())
                .tongTien(tongTien)
                .ngayTrao(request.getNgayTrao())
                .trangThai(TrangThaiDotPhanBo.ChoDuyet)
                .canBo(canBo)
                .hieuTruong(null)
                .build();

        DotPhanBo savedDot = dotPhanBoRepository.save(dotPhanBo);
        log.info("Đã tạo đợt phân bổ #{} thành công với trạng thái ChoDuyet, tổng tiền: {}",
                savedDot.getMaDotPhanBo(), tongTien);

        // 2. Tạo danh sách chi tiết phân bổ (CT_PHANBO)
        List<CTPhanBo> details = new ArrayList<>();
        for (int i = 0; i < request.getChiTietPhanBo().size(); i++) {
            DistributionDetailItemRequest item = request.getChiTietPhanBo().get(i);
            HocSinh hs = hocSinhList.get(i);

            CTPhanBo ct = CTPhanBo.builder()
                    .dotPhanBo(savedDot)
                    .hocSinh(hs)
                    .soTien(item.getSoTien())
                    .nguoiNhan(item.getNguoiNhan())
                    .ngayNhan(request.getNgayTrao())
                    .ghiChu(item.getGhiChu())
                    .build();
            details.add(ct);
        }

        List<CTPhanBo> savedDetails = ctPhanBoRepository.saveAll(details);
        log.info("Đã lưu {} bản ghi chi tiết phân bổ cho đợt #{}", savedDetails.size(), savedDot.getMaDotPhanBo());

        return mapToDistributionResponse(savedDot, savedDetails);
    }

    /**
     * 4.2 Lấy danh sách toàn bộ các đợt phân bổ
     */
    @Transactional(readOnly = true)
    public List<DistributionResponse> getAllDistributions() {
        List<DotPhanBo> list = dotPhanBoRepository.findAllByOrderByMaDotPhanBoDesc();
        return list.stream()
                .map(dot -> mapToDistributionResponse(dot, null))
                .collect(Collectors.toList());
    }

    /**
     * 4.3 Xem chi tiết một đợt phân bổ kèm danh sách học sinh nhận hỗ trợ
     */
    @Transactional(readOnly = true)
    public DistributionResponse getDistributionDetail(Long maDotPhanBo) {
        DotPhanBo dot = dotPhanBoRepository.findById(maDotPhanBo)
                .orElseThrow(() -> new AppException(ErrorCode.DOT_PHAN_BO_NOT_FOUND));

        List<CTPhanBo> details = ctPhanBoRepository.findByDotPhanBo_MaDotPhanBo(maDotPhanBo);
        return mapToDistributionResponse(dot, details);
    }

    private DistributionResponse mapToDistributionResponse(DotPhanBo dot, List<CTPhanBo> details) {
        TTTaiTro bai = dot.getBaiTaiTro();
        NguoiDung canBo = dot.getCanBo();
        NguoiDung hieuTruong = dot.getHieuTruong();

        List<DistributionDetailResponse> detailResponses = null;
        if (details != null) {
            detailResponses = details.stream().map(ct -> {
                HocSinh hs = ct.getHocSinh();
                return DistributionDetailResponse.builder()
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

        return DistributionResponse.builder()
                .maDotPhanBo(dot.getMaDotPhanBo())
                .maBaiTaiTro(bai != null ? bai.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(bai != null ? bai.getTieuDe() : null)
                .tenDot(dot.getTenDot())
                .tongTien(dot.getTongTien())
                .ngayTrao(dot.getNgayTrao())
                .trangThai(dot.getTrangThai())
                .maCanBo(canBo != null ? canBo.getMaNguoiDung() : null)
                .tenCanBo(canBo != null ? canBo.getHoTen() : null)
                .maHieuTruong(hieuTruong != null ? hieuTruong.getMaNguoiDung() : null)
                .tenHieuTruong(hieuTruong != null ? hieuTruong.getHoTen() : null)
                .chiTietPhanBo(detailResponses)
                .build();
    }
}
