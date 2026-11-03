package com.ndc.gayquy.dto.guest;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long maNguoiDung;
    private String hoTen;
    private String email;
    private String tenDangNhap;
    private String vaiTro;
}
