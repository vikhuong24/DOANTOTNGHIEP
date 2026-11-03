package com.ndc.gayquy.security;

import com.ndc.gayquy.entity.NguoiDung;
import com.ndc.gayquy.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final NguoiDungRepository nguoiDungRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        NguoiDung nguoiDung;
        if (identifier != null && identifier.contains("@")) {
            // Đăng nhập bằng Email (Dành cho Nhà hảo tâm - Donor)
            String email = identifier.trim().toLowerCase();
            nguoiDung = nguoiDungRepository.findByEmail(email)
                    .or(() -> nguoiDungRepository.findByTenDangNhap(email))
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản với email: " + identifier));
        } else {
            // Đăng nhập bằng Tên đăng nhập (Dành cho Phụ huynh, Cán bộ, Hiệu trưởng, Admin)
            nguoiDung = nguoiDungRepository.findByTenDangNhap(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản với tên đăng nhập: " + identifier));
        }

        return new CustomUserDetails(nguoiDung);
    }
}
