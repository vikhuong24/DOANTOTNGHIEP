package com.ndc.gayquy.dto.guest;

import com.ndc.gayquy.common.enums.GioiTinh;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSummaryResponse {

    private Long maHocSinh;
    private String hoTen;
    private GioiTinh gioiTinh;
    private String lop;
    private String loaiHoTro;
    private String moTa;
}
