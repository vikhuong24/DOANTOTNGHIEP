package com.ndc.gayquy.dto.response;

import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiTroResponse {

    private Long maTaiTro;
    private Long maBaiTaiTro;
    private String tieuDeBaiTaiTro;
    private Long maNguoiDung;
    private String tenNguoiDung;
    private String tenHienThi;
    private BigDecimal soTienDk;
    private BigDecimal soTienTt;
    private String anhGiaoDich;
    private TrangThaiTaiTro trangThai;
    private Long maCanBoXacNhan;
    private String tenCanBoXacNhan;
    private String ghiChu;
    private LocalDateTime ngayGui;
    private LocalDateTime ngayNhan;
}
