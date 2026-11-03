package com.ndc.gayquy.service.fundraiser;

import com.ndc.gayquy.common.enums.TrangThaiBaiDang;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.fundraiser.CampaignDetailResponse;
import com.ndc.gayquy.dto.fundraiser.CreateCampaignRequest;
import com.ndc.gayquy.dto.fundraiser.UpdateCampaignRequest;
import com.ndc.gayquy.entity.NguoiDung;
import com.ndc.gayquy.entity.TTTaiTro;
import com.ndc.gayquy.repository.NguoiDungRepository;
import com.ndc.gayquy.repository.TTTaiTroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service("fundraiserCampaignService")
@RequiredArgsConstructor
public class CampaignService {

    private final TTTaiTroRepository ttTaiTroRepository;
    private final NguoiDungRepository nguoiDungRepository;

    /**
     * 1.1 Tạo bài đăng gây quỹ mới
     */
    @Transactional
    public CampaignDetailResponse createCampaign(Long canBoId, CreateCampaignRequest request) {
        NguoiDung canBo = nguoiDungRepository.findById(canBoId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        TrangThaiBaiDang initialStatus = request.getTrangThai() != null
                ? request.getTrangThai()
                : TrangThaiBaiDang.CHODUYET;

        TTTaiTro campaign = TTTaiTro.builder()
                .tieuDe(request.getTieuDe().trim())
                .noiDung(request.getNoiDung().trim())
                .anhBia(request.getAnhBia() != null ? request.getAnhBia().trim() : null)
                .mucTieu(request.getMucTieu())
                .tongTienDaNhan(BigDecimal.ZERO)
                .trangThai(initialStatus)
                .canBo(canBo)
                .ngayBatDau(request.getNgayBatDau())
                .ngayKetThuc(request.getNgayKetThuc())
                .build();

        TTTaiTro saved = ttTaiTroRepository.save(campaign);
        log.info("Cán bộ #{} đã tạo bài đăng gây quỹ mới #{}", canBoId, saved.getMaBaiTaiTro());

        return mapToDetailResponse(saved);
    }

    /**
     * 1.2 Chỉnh sửa bài đăng gây quỹ
     */
    @Transactional
    public CampaignDetailResponse updateCampaign(Long maBaiTaiTro, Long canBoId, UpdateCampaignRequest request) {
        TTTaiTro campaign = ttTaiTroRepository.findById(maBaiTaiTro)
                .orElseThrow(() -> new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND));

        if (campaign.getCanBo() != null && !campaign.getCanBo().getMaNguoiDung().equals(canBoId)) {
            log.warn("Cán bộ #{} cố gắng chỉnh sửa bài đăng #{} của cán bộ khác", canBoId, maBaiTaiTro);
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn chỉ có thể chỉnh sửa bài đăng do chính mình tạo!");
        }

        if (request.getTieuDe() != null && !request.getTieuDe().isBlank()) {
            campaign.setTieuDe(request.getTieuDe().trim());
        }
        if (request.getNoiDung() != null && !request.getNoiDung().isBlank()) {
            campaign.setNoiDung(request.getNoiDung().trim());
        }
        if (request.getAnhBia() != null) {
            campaign.setAnhBia(request.getAnhBia().trim());
        }
        if (request.getMucTieu() != null && request.getMucTieu().compareTo(BigDecimal.ZERO) > 0) {
            campaign.setMucTieu(request.getMucTieu());
        }
        if (request.getTrangThai() != null) {
            campaign.setTrangThai(request.getTrangThai());
        }
        if (request.getNgayBatDau() != null) {
            campaign.setNgayBatDau(request.getNgayBatDau());
        }
        if (request.getNgayKetThuc() != null) {
            campaign.setNgayKetThuc(request.getNgayKetThuc());
        }

        TTTaiTro saved = ttTaiTroRepository.save(campaign);
        log.info("Cán bộ #{} đã cập nhật bài đăng gây quỹ #{}", canBoId, maBaiTaiTro);

        return mapToDetailResponse(saved);
    }

    /**
     * 1.3 Lấy danh sách bài đăng do cán bộ này tạo
     */
    @Transactional(readOnly = true)
    public List<CampaignDetailResponse> getMyCampaigns(Long canBoId) {
        List<TTTaiTro> list = ttTaiTroRepository.findByCanBo_MaNguoiDungOrderByMaBaiTaiTroDesc(canBoId);
        return list.stream()
                .map(this::mapToDetailResponse)
                .collect(Collectors.toList());
    }

    /**
     * 1.4 Lấy chi tiết bài đăng
     */
    @Transactional(readOnly = true)
    public CampaignDetailResponse getCampaignDetail(Long maBaiTaiTro, Long canBoId) {
        TTTaiTro campaign = ttTaiTroRepository.findById(maBaiTaiTro)
                .orElseThrow(() -> new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND));

        return mapToDetailResponse(campaign);
    }

    private CampaignDetailResponse mapToDetailResponse(TTTaiTro c) {
        return CampaignDetailResponse.builder()
                .maBaiTaiTro(c.getMaBaiTaiTro())
                .tieuDe(c.getTieuDe())
                .noiDung(c.getNoiDung())
                .anhBia(c.getAnhBia())
                .mucTieu(c.getMucTieu())
                .tongTienDaNhan(c.getTongTienDaNhan())
                .trangThai(c.getTrangThai())
                .maCanBo(c.getCanBo() != null ? c.getCanBo().getMaNguoiDung() : null)
                .tenCanBo(c.getCanBo() != null ? c.getCanBo().getHoTen() : null)
                .ngayBatDau(c.getNgayBatDau())
                .ngayKetThuc(c.getNgayKetThuc())
                .build();
    }
}
