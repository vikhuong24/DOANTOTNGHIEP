package com.ndc.gayquy.service.fundraiser;

import com.ndc.gayquy.common.enums.TrangThaiDeXuat;
import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.fundraiser.*;
import com.ndc.gayquy.entity.DeXuatTaiTro;
import com.ndc.gayquy.entity.NguoiDung;
import com.ndc.gayquy.entity.TaiTro;
import com.ndc.gayquy.entity.TTTaiTro;
import com.ndc.gayquy.repository.DeXuatTaiTroRepository;
import com.ndc.gayquy.repository.NguoiDungRepository;
import com.ndc.gayquy.repository.TaiTroRepository;
import com.ndc.gayquy.repository.TTTaiTroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service("fundraiserApprovalService")
@RequiredArgsConstructor
public class ApprovalService {

    private final DeXuatTaiTroRepository deXuatTaiTroRepository;
    private final TaiTroRepository taiTroRepository;
    private final TTTaiTroRepository ttTaiTroRepository;
    private final NguoiDungRepository nguoiDungRepository;

    /**
     * 1.1 Lấy danh sách đề xuất tài trợ chờ duyệt
     */
    @Transactional(readOnly = true)
    public List<PendingProposalResponse> getPendingProposals() {
        List<TrangThaiDeXuat> pendingStatuses = List.of(TrangThaiDeXuat.CHODUYET);
        List<DeXuatTaiTro> list = deXuatTaiTroRepository.findByTrangThaiInOrderByNgayGuiDesc(pendingStatuses);

        return list.stream()
                .map(this::mapToProposalResponse)
                .collect(Collectors.toList());
    }

    /**
     * 1.2 Duyệt / Từ chối ĐỀ XUẤT TÀI TRỢ (Bảng DEXUATTAITRO)
     * Method: PUT /api/fundraiser/approvals/proposals/{id}
     * Body: { "trangthai": "DADUYET", "lydo": "..." }
     */
    @Transactional
    public PendingProposalResponse processProposalApproval(Long maDeXuat, Long canBoId, ApprovalDecisionRequest request) {
        DeXuatTaiTro deXuat = deXuatTaiTroRepository.findById(maDeXuat)
                .orElseThrow(() -> new AppException(ErrorCode.DE_XUAT_NOT_FOUND));

        NguoiDung canBo = nguoiDungRepository.findById(canBoId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String trangThaiStr = request.getTrangthai() != null ? request.getTrangthai().trim() : "";

        if (trangThaiStr.equalsIgnoreCase("DaDuyet") || trangThaiStr.equalsIgnoreCase("DADUYET")) {
            deXuat.setTrangThai(TrangThaiDeXuat.DADUYET);
            deXuat.setLyDoTuChoi(null);
            log.info("Cán bộ #{} đã PHÊ DUYỆT đề xuất tài trợ #{}", canBoId, maDeXuat);
        } else if (trangThaiStr.equalsIgnoreCase("TuChoi") || trangThaiStr.equalsIgnoreCase("TUCHOI") || trangThaiStr.equalsIgnoreCase("TU_CHOI")) {
            deXuat.setTrangThai(TrangThaiDeXuat.TUCHOI);
            String lyDo = request.getLydo() != null ? request.getLydo().trim() : null;
            deXuat.setLyDoTuChoi(lyDo);
            log.info("Cán bộ #{} đã TỪ CHỐI đề xuất tài trợ #{}, lý do: {}", canBoId, maDeXuat, lyDo);
        } else {
            throw new AppException(ErrorCode.INVALID_KEY, "Trạng thái quyết định không hợp lệ! Chỉ chấp nhận 'DADUYET' hoặc 'TUCHOI'.");
        }

        deXuat.setCanBo(canBo);
        deXuat.setNgayXuLy(LocalDateTime.now());

        DeXuatTaiTro saved = deXuatTaiTroRepository.save(deXuat);
        return mapToProposalResponse(saved);
    }

    /**
     * 2.1 Lấy danh sách đăng ký ủng hộ chờ duyệt / chờ xác nhận
     */
    @Transactional(readOnly = true)
    public List<PendingDonationResponse> getPendingDonations() {
        List<TrangThaiTaiTro> pendingStatuses = List.of(
                TrangThaiTaiTro.CHODUYET
        );
        List<TaiTro> list = taiTroRepository.findByTrangThaiInOrderByNgayGuiDesc(pendingStatuses);

        return list.stream()
                .map(this::mapToDonationResponse)
                .collect(Collectors.toList());
    }

    /**
     * 2.2 Duyệt / Từ chối ĐĂNG KÝ TÀI TRỢ (Bảng TAITRO)
     * Method: PUT /api/fundraiser/approvals/donations/{id}
     * Body: { "trangthai": "DADUYET", "lydo": "..." }
     */
    @Transactional
    public PendingDonationResponse processDonationApproval(Long maTaiTro, Long canBoId, ApprovalDecisionRequest request) {
        TaiTro taiTro = taiTroRepository.findById(maTaiTro)
                .orElseThrow(() -> new AppException(ErrorCode.TAI_TRO_NOT_FOUND));

        NguoiDung canBo = nguoiDungRepository.findById(canBoId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String trangThaiStr = request.getTrangthai() != null ? request.getTrangthai().trim() : "";

        if (trangThaiStr.equalsIgnoreCase("DaDuyet") || trangThaiStr.equalsIgnoreCase("DADUYET")) {
            taiTro.setTrangThai(TrangThaiTaiTro.DADUYET);
            if (request.getLydo() != null && !request.getLydo().isBlank()) {
                String ghiChuMoi = (taiTro.getGhiChu() != null ? taiTro.getGhiChu() + " | " : "") + request.getLydo().trim();
                taiTro.setGhiChu(ghiChuMoi);
            }
            log.info("Cán bộ #{} đã PHÊ DUYỆT đăng ký tài trợ #{} (chuyển sang DADUYET)", canBoId, maTaiTro);
        } else if (trangThaiStr.equalsIgnoreCase("TuChoi") || trangThaiStr.equalsIgnoreCase("TUCHOI") || trangThaiStr.equalsIgnoreCase("TU_CHOI")) {
            if (request.getLydo() != null && !request.getLydo().isBlank()) {
                String ghiChuMoi = (taiTro.getGhiChu() != null ? taiTro.getGhiChu() + " | Lý do từ chối: " : "Lý do từ chối: ") + request.getLydo().trim();
                taiTro.setGhiChu(ghiChuMoi);
            }
            log.info("Cán bộ #{} đã TỪ CHỐI đăng ký tài trợ #{}, lý do: {}", canBoId, maTaiTro, request.getLydo());
        } else {
            throw new AppException(ErrorCode.INVALID_KEY, "Trạng thái quyết định không hợp lệ! Chỉ chấp nhận 'DADUYET' hoặc 'TUCHOI'.");
        }

        taiTro.setCanBo(canBo);

        TaiTro saved = taiTroRepository.save(taiTro);
        return mapToDonationResponse(saved);
    }

    /**
     * 3. API Xác nhận đã nhận tiền (giữ nguyên như cũ):
     * Cập nhật trangthai TAITRO = 'DANHAN', cộng dồn soitentt vào cột `tongtiendanhan` của bảng TT_TAITRO.
     */
    @Transactional
    public ConfirmDonationResponse confirmDonation(Long maTaiTro, Long canBoId, ConfirmDonationRequest request) {
        log.info("Bắt đầu xác nhận nhận tiền tài trợ #{} bởi cán bộ #{}", maTaiTro, canBoId);

        TaiTro taiTro = taiTroRepository.findById(maTaiTro)
                .orElseThrow(() -> new AppException(ErrorCode.TAI_TRO_NOT_FOUND));

        // Kiểm tra tránh xác nhận lặp lại
        if (taiTro.getTrangThai() == TrangThaiTaiTro.DANHAN) {
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION, "Khoản đóng góp này đã được xác nhận nhận tiền trước đó!");
        }

        NguoiDung canBo = nguoiDungRepository.findById(canBoId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Số tiền thực nhận: nếu request có thì lấy request, nếu không thì lấy số tiền đăng ký
        BigDecimal soTienTt = (request != null && request.getSoTienTt() != null)
                ? request.getSoTienTt()
                : taiTro.getSoTienDk();

        if (soTienTt == null || soTienTt.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_AMOUNT, "Số tiền thực nhận không hợp lệ, phải lớn hơn 0!");
        }

        // 1. Cập nhật bản ghi TAITRO
        taiTro.setTrangThai(TrangThaiTaiTro.DANHAN);
        taiTro.setSoTienTt(soTienTt);
        taiTro.setCanBo(canBo);
        taiTro.setNgayNhan(LocalDateTime.now());
        if (request != null && request.getGhiChu() != null && !request.getGhiChu().isBlank()) {
            String ghiChuMoi = (taiTro.getGhiChu() != null ? taiTro.getGhiChu() + " | " : "") + request.getGhiChu().trim();
            taiTro.setGhiChu(ghiChuMoi);
        }
        taiTroRepository.save(taiTro);

        // 2. CỰC KỲ QUAN TRỌNG: Gọi @Modifying @Query để cộng dồn soitentt vào cột tongtiendanhan của TT_TAITRO
        Long maBaiTaiTro = taiTro.getBaiTaiTro().getMaBaiTaiTro();
        int affectedRows = ttTaiTroRepository.congDonTongTienDaNhan(maBaiTaiTro, soTienTt);
        if (affectedRows == 0) {
            throw new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND, "Không tìm thấy bài tài trợ để cộng dồn tiền!");
        }

        log.info("Cán bộ #{} đã xác nhận nhận tiền cho tài trợ #{}, cộng dồn {} VNĐ vào bài tài trợ #{}",
                canBoId, maTaiTro, soTienTt, maBaiTaiTro);

        // Lấy lại thông tin bài tài trợ đã được cập nhật
        TTTaiTro baiTaiTro = ttTaiTroRepository.findById(maBaiTaiTro).orElse(null);
        BigDecimal tongTienMoi = (baiTaiTro != null) ? baiTaiTro.getTongTienDaNhan() : BigDecimal.ZERO;

        return ConfirmDonationResponse.builder()
                .maTaiTro(taiTro.getMaTaiTro())
                .maBaiTaiTro(maBaiTaiTro)
                .tieuDeBaiTaiTro(baiTaiTro != null ? baiTaiTro.getTieuDe() : null)
                .soTienTt(soTienTt)
                .tongTienDaNhanMoi(tongTienMoi)
                .trangThai(taiTro.getTrangThai())
                .maCanBo(canBo.getMaNguoiDung())
                .tenCanBo(canBo.getHoTen())
                .ngayNhan(taiTro.getNgayNhan())
                .ghiChu(taiTro.getGhiChu())
                .build();
    }

    private PendingProposalResponse mapToProposalResponse(DeXuatTaiTro d) {
        NguoiDung u = d.getNguoiDung();
        TTTaiTro b = d.getBaiTaiTro();
        return PendingProposalResponse.builder()
                .maDeXuat(d.getMaDeXuat())
                .maNguoiDung(u != null ? u.getMaNguoiDung() : null)
                .tenNguoiDung(u != null ? u.getHoTen() : null)
                .sdtNguoiDung(u != null ? u.getSdt() : null)
                .emailNguoiDung(u != null ? u.getEmail() : null)
                .maBaiTaiTro(b != null ? b.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(b != null ? b.getTieuDe() : null)
                .tieuDe(d.getTieuDe())
                .soTienDx(d.getSoTienDx())
                .mucDichSd(d.getMucDichSd())
                .trangThai(d.getTrangThai())
                .ngayGui(d.getNgayGui())
                .ngayXuLy(d.getNgayXuLy())
                .lyDoTuChoi(d.getLyDoTuChoi())
                .build();
    }

    private PendingDonationResponse mapToDonationResponse(TaiTro t) {
        NguoiDung u = t.getNguoiDung();
        TTTaiTro b = t.getBaiTaiTro();
        return PendingDonationResponse.builder()
                .maTaiTro(t.getMaTaiTro())
                .maNguoiDung(u != null ? u.getMaNguoiDung() : null)
                .tenNguoiDung(u != null ? u.getHoTen() : null)
                .sdtNguoiDung(u != null ? u.getSdt() : null)
                .emailNguoiDung(u != null ? u.getEmail() : null)
                .maBaiTaiTro(b != null ? b.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(b != null ? b.getTieuDe() : null)
                .tenHienThi(t.getTenHienThi())
                .soTienDk(t.getSoTienDk())
                .soTienTt(t.getSoTienTt())
                .anhGiaoDich(t.getAnhGiaoDich())
                .trangThai(t.getTrangThai())
                .ghiChu(t.getGhiChu())
                .ngayGui(t.getNgayGui())
                .build();
    }
}
