package com.ndc.gayquy.service.principal;

import com.ndc.gayquy.common.enums.TrangThaiPhanHoi;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.principal.PrincipalFeedbackResponse;
import com.ndc.gayquy.entity.*;
import com.ndc.gayquy.repository.PhanHoiRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service("principalFeedbackService")
@RequiredArgsConstructor
public class FeedbackService {

    private final PhanHoiRepository phanHoiRepository;

    /**
     * Lấy toàn bộ phản hồi kèm câu trả lời của cán bộ (Read-only dành cho Hiệu trưởng)
     */
    @Transactional(readOnly = true)
    public List<PrincipalFeedbackResponse> getAllFeedbacks(TrangThaiPhanHoi trangThai) {
        log.info("Hiệu trưởng xem danh sách toàn bộ phản hồi (trạng thái: {})", trangThai);
        List<PhanHoi> list;
        if (trangThai != null) {
            list = phanHoiRepository.findByTrangThai(trangThai);
        } else {
            list = phanHoiRepository.findAllByOrderByNgayGuiDesc();
        }

        return list.stream()
                .map(this::mapToFeedbackResponse)
                .collect(Collectors.toList());
    }

    /**
     * Xem chi tiết một phản hồi
     */
    @Transactional(readOnly = true)
    public PrincipalFeedbackResponse getFeedbackDetail(Long maPhanHoi) {
        PhanHoi p = phanHoiRepository.findById(maPhanHoi)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY, "Không tìm thấy phản hồi với mã: " + maPhanHoi));

        return mapToFeedbackResponse(p);
    }

    private PrincipalFeedbackResponse mapToFeedbackResponse(PhanHoi p) {
        NguoiDung sender = p.getNguoiDung();
        TTTaiTro bai = p.getBaiTaiTro();
        DotPhanBo dot = p.getDotPhanBo();
        NguoiDung canBo = p.getCanBo();

        String vaiTroSender = null;
        if (sender != null && sender.getVaiTro() != null) {
            vaiTroSender = sender.getVaiTro().getTenVaiTro().name();
        }

        return PrincipalFeedbackResponse.builder()
                .maPhanHoi(p.getMaPhanHoi())
                .maNguoiGui(sender != null ? sender.getMaNguoiDung() : null)
                .tenNguoiGui(sender != null ? sender.getHoTen() : null)
                .emailNguoiGui(sender != null ? sender.getEmail() : null)
                .sdtNguoiGui(sender != null ? sender.getSdt() : null)
                .vaiTroNguoiGui(vaiTroSender)
                .maBaiTaiTro(bai != null ? bai.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(bai != null ? bai.getTieuDe() : null)
                .maDotPhanBo(dot != null ? dot.getMaDotPhanBo() : null)
                .tenDotPhanBo(dot != null ? dot.getTenDot() : null)
                .tieuDe(p.getTieuDe())
                .noiDung(p.getNoiDung())
                .noiDungTraLoi(p.getNoiDungTraLoi())
                .maCanBo(canBo != null ? canBo.getMaNguoiDung() : null)
                .tenCanBo(canBo != null ? canBo.getHoTen() : null)
                .trangThai(p.getTrangThai())
                .ngayGui(p.getNgayGui())
                .ngayTraLoi(p.getNgayTraLoi())
                .build();
    }
}
