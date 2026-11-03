package com.ndc.gayquy.dto.guest;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationHistoryItemResponse {

    private Long maTaiTro;
    private String tenHienThi;
    private BigDecimal soTienTt;
    private LocalDateTime ngayNhan;
    private String ghiChu;
}
