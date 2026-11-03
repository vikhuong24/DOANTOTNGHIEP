package com.ndc.gayquy.service.parent;

import com.ndc.gayquy.common.enums.TrangThaiPhanHoi;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.parent.ParentFeedbackRequest;
import com.ndc.gayquy.dto.parent.ParentFeedbackResponse;
import com.ndc.gayquy.entity.DotPhanBo;
import com.ndc.gayquy.entity.NguoiDung;
import com.ndc.gayquy.entity.PhanHoi;
import com.ndc.gayquy.entity.TTTaiTro;
import com.ndc.gayquy.repository.DotPhanBoRepository;
import com.ndc.gayquy.repository.NguoiDungRepository;
import com.ndc.gayquy.repository.PhanHoiRepository;
import com.ndc.gayquy.repository.TTTaiTroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service("parentFeedbackService")
@RequiredArgsConstructor
public class FeedbackService {

    private final PhanHoiRepository phanHoiRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final TTTaiTroRepository ttTaiTroRepository;
    private final DotPhanBoRepository dotPhanBoRepository;

    /**
     * 4. POST /api/parent/feedbacks
     * Gửi phản hồi sai lệch (thông tin số tiền nhận, quà tặng, hoàn cảnh, v.v.).
     */
    @Transactional
    public ParentFeedbackResponse createFeedback(Long parentId, ParentFeedbackRequest request) {
        NguoiDung parent = nguoiDungRepository.findById(parentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        TTTaiTro campaign = null;
        if (request.getMaBaiTaiTro() != null) {
            campaign = ttTaiTroRepository.findById(request.getMaBaiTaiTro())
                    .orElseThrow(() -> new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND));
        }

        DotPhanBo dotPhanBo = null;
        if (request.getMaDotPhanBo() != null) {
            dotPhanBo = dotPhanBoRepository.findById(request.getMaDotPhanBo())
                    .orElseThrow(() -> new AppException(ErrorCode.DOT_PHAN_BO_NOT_FOUND));
        }

        PhanHoi phanHoi = PhanHoi.builder()
                .nguoiDung(parent)
                .baiTaiTro(campaign)
                .dotPhanBo(dotPhanBo)
                .tieuDe(request.getTieuDe().trim())
                .noiDung(request.getNoiDung().trim())
                .trangThai(TrangThaiPhanHoi.CHO_XU_LY)
                .ngayGui(LocalDateTime.now())
                .build();

        PhanHoi saved = phanHoiRepository.save(phanHoi);
        log.info("Phụ huynh #{} đã gửi phản hồi sai lệch #{}", parentId, saved.getMaPhanHoi());

        return mapToFeedbackResponse(saved);
    }

    /**
     * 5. GET /api/parent/feedbacks
     * Xem lại danh sách phản hồi đã gửi và câu trả lời từ cán bộ nhà trường.
     */
    @Transactional(readOnly = true)
    public List<ParentFeedbackResponse> getMyFeedbacks(Long parentId) {
        log.info("Phụ huynh #{} xem danh sách phản hồi cá nhân", parentId);
        List<PhanHoi> feedbackList = phanHoiRepository.findByNguoiDung_MaNguoiDungOrderByNgayGuiDesc(parentId);

        return feedbackList.stream()
                .map(this::mapToFeedbackResponse)
                .collect(Collectors.toList());
    }

    private ParentFeedbackResponse mapToFeedbackResponse(PhanHoi p) {
        TTTaiTro campaign = p.getBaiTaiTro();
        DotPhanBo dot = p.getDotPhanBo();
        NguoiDung canBo = p.getCanBo();

        return ParentFeedbackResponse.builder()
                .maPhanHoi(p.getMaPhanHoi())
                .tieuDe(p.getTieuDe())
                .noiDung(p.getNoiDung())
                .maBaiTaiTro(campaign != null ? campaign.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(campaign != null ? campaign.getTieuDe() : null)
                .maDotPhanBo(dot != null ? dot.getMaDotPhanBo() : null)
                .tenDotPhanBo(dot != null ? dot.getTenDot() : null)
                .noiDungTraLoi(p.getNoiDungTraLoi())
                .tenCanBoTraLoi(canBo != null ? canBo.getHoTen() : null)
                .trangThai(p.getTrangThai())
                .ngayGui(p.getNgayGui())
                .ngayTraLoi(p.getNgayTraLoi())
                .build();
    }
}
