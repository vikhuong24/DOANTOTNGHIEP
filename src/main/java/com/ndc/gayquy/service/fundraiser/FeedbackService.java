package com.ndc.gayquy.service.fundraiser;

import com.ndc.gayquy.common.enums.TrangThaiPhanHoi;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.fundraiser.FundraiserFeedbackResponse;
import com.ndc.gayquy.dto.fundraiser.ReplyFeedbackRequest;
import com.ndc.gayquy.entity.DotPhanBo;
import com.ndc.gayquy.entity.NguoiDung;
import com.ndc.gayquy.entity.PhanHoi;
import com.ndc.gayquy.entity.TTTaiTro;
import com.ndc.gayquy.repository.NguoiDungRepository;
import com.ndc.gayquy.repository.PhanHoiRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service("fundraiserFeedbackService")
@RequiredArgsConstructor
public class FeedbackService {

    private final PhanHoiRepository phanHoiRepository;
    private final NguoiDungRepository nguoiDungRepository;

    /**
     * 6.1 Trả lời phản hồi: Cập nhật noidungtraloi, trangthai='DaXuLy'
     */
    @Transactional
    public FundraiserFeedbackResponse replyFeedback(Long maPhanHoi, Long canBoId, ReplyFeedbackRequest request) {
        log.info("Cán bộ #{} trả lời phản hồi #{}", canBoId, maPhanHoi);

        PhanHoi phanHoi = phanHoiRepository.findById(maPhanHoi)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY, "Không tìm thấy phản hồi với mã: " + maPhanHoi));

        NguoiDung canBo = nguoiDungRepository.findById(canBoId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        phanHoi.setNoiDungTraLoi(request.getNoiDungTraLoi().trim());
        phanHoi.setCanBo(canBo);
        phanHoi.setTrangThai(TrangThaiPhanHoi.DaXuLy);
        phanHoi.setNgayTraLoi(LocalDateTime.now());

        PhanHoi saved = phanHoiRepository.save(phanHoi);
        log.info("Đã cập nhật câu trả lời cho phản hồi #{}, trạng thái chuyển sang DaXuLy", maPhanHoi);

        return mapToFeedbackResponse(saved);
    }

    /**
     * 6.2 Lấy danh sách phản hồi (có thể lọc theo trạng thái)
     */
    @Transactional(readOnly = true)
    public List<FundraiserFeedbackResponse> getFeedbacks(TrangThaiPhanHoi trangThai) {
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
     * 6.3 Xem chi tiết một phản hồi
     */
    @Transactional(readOnly = true)
    public FundraiserFeedbackResponse getFeedbackDetail(Long maPhanHoi) {
        PhanHoi phanHoi = phanHoiRepository.findById(maPhanHoi)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY, "Không tìm thấy phản hồi với mã: " + maPhanHoi));

        return mapToFeedbackResponse(phanHoi);
    }

    private FundraiserFeedbackResponse mapToFeedbackResponse(PhanHoi p) {
        NguoiDung sender = p.getNguoiDung();
        TTTaiTro bai = p.getBaiTaiTro();
        DotPhanBo dot = p.getDotPhanBo();
        NguoiDung canBo = p.getCanBo();

        return FundraiserFeedbackResponse.builder()
                .maPhanHoi(p.getMaPhanHoi())
                .maNguoiGui(sender != null ? sender.getMaNguoiDung() : null)
                .tenNguoiGui(sender != null ? sender.getHoTen() : null)
                .emailNguoiGui(sender != null ? sender.getEmail() : null)
                .sdtNguoiGui(sender != null ? sender.getSdt() : null)
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
                .ngayTrao(p.getNgayTraLoi())
                .build();
    }
}
