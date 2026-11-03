package com.ndc.gayquy.dto.guest;

import com.ndc.gayquy.common.enums.TrangThaiBaiDang;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignSummaryResponse {

    private Long maBaiTaiTro;
    private String tieuDe;
    private String anhBia;
    private BigDecimal mucTieu;
    private BigDecimal tongTienDaNhan;
    private Double phanTramHoanThanh;
    private TrangThaiBaiDang trangThai;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private String tenCanBoPhuTrach;
}
