package com.ndc.gayquy.dto.donor;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {

    private Long maNguoiDung;
    private String hoTen;
    private String email;
    private String sdt;
    private String diaChi;
    private LocalDateTime ngayTao;
}
