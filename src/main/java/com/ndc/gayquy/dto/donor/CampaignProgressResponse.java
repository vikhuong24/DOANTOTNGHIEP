package com.ndc.gayquy.dto.donor;

import com.ndc.gayquy.common.enums.TrangThaiBaiTaiTro;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignProgressResponse {

    private Long maBaiTaiTro;
    private String tieuDe;
    private String anhBia;
    private BigDecimal mucTieu;
    private BigDecimal tongTienDaNhan;
    private Double phanTramHoanThanh;
    private TrangThaiBaiTaiTro trangThai;
    private BigDecimal tongTienToiDaDongGop;
    private List<MinhChungItemResponse> danhSachMinhChung;
}
