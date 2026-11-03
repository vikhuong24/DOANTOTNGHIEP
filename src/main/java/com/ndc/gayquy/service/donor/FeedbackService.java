package com.ndc.gayquy.service.donor;

import com.ndc.gayquy.common.enums.TrangThaiPhanHoi;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.donor.FeedbackRequest;
import com.ndc.gayquy.dto.donor.FeedbackResponse;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final PhanHoiRepository phanHoiRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final TTTaiTroRepository ttTaiTroRepository;
    private final DotPhanBoRepository dotPhanBoRepository;

    /**
     * Gửi phản hồi / góp ý / thắc mắc của Nhà hảo tâm
     */
    @Transactional
    public FeedbackResponse sendFeedback(Long userId, FeedbackRequest request) {
        NguoiDung donor = nguoiDungRepository.findById(userId)
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
                .nguoiDung(donor)
                .baiTaiTro(campaign)
                .dotPhanBo(dotPhanBo)
                .tieuDe(request.getTieuDe().trim())
                .noiDung(request.getNoiDung().trim())
                .trangThai(TrangThaiPhanHoi.CHO_XU_LY)
                .ngayGui(LocalDateTime.now())
                .build();

        PhanHoi saved = phanHoiRepository.save(phanHoi);
        log.info("Nhà hảo tâm #{} đã gửi phản hồi #{}", userId, saved.getMaPhanHoi());

        return FeedbackResponse.builder()
                .maPhanHoi(saved.getMaPhanHoi())
                .maBaiTaiTro(campaign != null ? campaign.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(campaign != null ? campaign.getTieuDe() : null)
                .maDotPhanBo(dotPhanBo != null ? dotPhanBo.getMaDotPhanBo() : null)
                .tieuDe(saved.getTieuDe())
                .noiDung(saved.getNoiDung())
                .trangThai(saved.getTrangThai())
                .ngayGui(saved.getNgayGui())
                .build();
    }
}
