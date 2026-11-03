package com.ndc.gayquy.security;

import com.ndc.gayquy.common.enums.TrangThaiNguoiDung;
import com.ndc.gayquy.entity.NguoiDung;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class CustomUserDetails implements UserDetails {

    private final NguoiDung nguoiDung;

    public CustomUserDetails(NguoiDung nguoiDung) {
        this.nguoiDung = nguoiDung;
    }

    public Long getMaNguoiDung() {
        return nguoiDung.getMaNguoiDung();
    }

    public String getEmail() {
        return nguoiDung.getEmail();
    }

    public String getTenDangNhap() {
        return nguoiDung.getTenDangNhap();
    }

    public String getHoTen() {
        return nguoiDung.getHoTen();
    }

    public String getVaiTro() {
        return nguoiDung.getVaiTro() != null ? nguoiDung.getVaiTro().getTenVaiTro().name() : "";
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (nguoiDung.getVaiTro() == null) {
            return Collections.emptyList();
        }
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + nguoiDung.getVaiTro().getTenVaiTro().name())
        );
    }

    @Override
    public String getPassword() {
        return nguoiDung.getMatKhau();
    }

    @Override
    public String getUsername() {
        // Nếu có email (Donor) thì ưu tiên email, ngược lại trả về tendangnhap
        if (nguoiDung.getEmail() != null && !nguoiDung.getEmail().isBlank()) {
            return nguoiDung.getEmail();
        }
        return nguoiDung.getTenDangNhap();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return nguoiDung.getTrangThai() != TrangThaiNguoiDung.KHOA;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return nguoiDung.getTrangThai() == TrangThaiNguoiDung.HOAT_DONG;
    }
}
