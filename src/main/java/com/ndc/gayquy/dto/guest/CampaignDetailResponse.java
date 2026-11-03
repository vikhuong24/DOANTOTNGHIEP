package com.ndc.gayquy.dto.guest;

import com.ndc.gayquy.common.enums.TrangThaiBaiTaiTro;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignDetailResponse {

    private Long maBaiTaiTro;
    private String tieuDe;
    private String noiDung;
    private String anhBia;
    private BigDecimal mucTieu;
    private BigDecimal tongTienDaNhan;
    private Double phanTramHoanThanh;
    private TrangThaiBaiTaiTro trangThai;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private Long maCanBo;
    private String tenCanBo;
    private String tenHieuTruongDuyet;
    private List<DonationHistoryItemResponse> danhSachNhaHaoTam;
}
