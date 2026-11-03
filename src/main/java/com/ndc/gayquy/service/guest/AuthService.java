package com.ndc.gayquy.service.guest;

import com.ndc.gayquy.common.enums.TenVaiTro;
import com.ndc.gayquy.common.enums.TrangThaiNguoiDung;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.guest.AuthResponse;
import com.ndc.gayquy.dto.guest.LoginRequest;
import com.ndc.gayquy.dto.guest.RegisterRequest;
import com.ndc.gayquy.entity.NguoiDung;
import com.ndc.gayquy.entity.VaiTro;
import com.ndc.gayquy.repository.NguoiDungRepository;
import com.ndc.gayquy.repository.VaiTroRepository;
import com.ndc.gayquy.security.CustomUserDetails;
import com.ndc.gayquy.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * POST /api/guest/register
     * - Input: hoten, email, sdt, matkhau.
     * - Xử lý: Mặc định gán maVaiTro = 'NHATAITRO' (hoặc 'NHT'). tendangnhap = null. Mã hóa pass BCrypt.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String sdt = request.getSdt().trim();

        if (!sdt.matches("^0\\d{9}$")) {
            throw new AppException(ErrorCode.INVALID_KEY, "Số điện thoại không hợp lệ! Bắt buộc phải bắt đầu bằng số 0 và có đúng 10 chữ số.");
        }

        if (nguoiDungRepository.existsByEmail(email) || nguoiDungRepository.existsByTenDangNhap(email)) {
            throw new AppException(ErrorCode.USER_EXISTED, "Email này đã được đăng ký trong hệ thống!");
        }

        // Tìm vai trò Nhà hảo tâm (NHATAITRO hoặc NHT)
        VaiTro vaiTroNHT = vaiTroRepository.findByTenVaiTro(TenVaiTro.NHATAITRO)
                .or(() -> vaiTroRepository.findByTenVaiTro(TenVaiTro.NHT))
                .orElseGet(() -> vaiTroRepository.save(VaiTro.builder()
                        .tenVaiTro(TenVaiTro.NHATAITRO)
                        .moTa("Nhà hảo tâm, tổ chức đóng góp từ thiện")
                        .build()));

        NguoiDung nguoiDung = NguoiDung.builder()
                .hoTen(request.getHoTen().trim())
                .email(email)
                .sdt(request.getSdt().trim())
                .matKhau(passwordEncoder.encode(request.getMatKhau()))
                .tenDangNhap(email) // Lấy email mà người dùng đăng ký điền vào cột tendangnhap
                .vaiTro(vaiTroNHT)
                .trangThai(TrangThaiNguoiDung.HOAT_DONG)
                .build();

        NguoiDung savedUser = nguoiDungRepository.save(nguoiDung);
        log.info("Đã đăng ký tài khoản Nhà hảo tâm thành công: email={}, tendangnhap={}", email, email);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtTokenProvider.generateTokenFromUserDetails(userDetails);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .maNguoiDung(savedUser.getMaNguoiDung())
                .hoTen(savedUser.getHoTen())
                .email(savedUser.getEmail())
                .tenDangNhap(savedUser.getTenDangNhap())
                .vaiTro(savedUser.getVaiTro().getTenVaiTro().name())
                .build();
    }

    /**
     * Đăng nhập thông minh:
     * - Nếu chuỗi truyền vào chứa '@' -> Đăng nhập bằng Email (Donor).
     * - Ngược lại -> Đăng nhập bằng tendangnhap (PH, CB, HT, Admin).
     */
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, request.getMatKhau())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtTokenProvider.generateToken(authentication);

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            NguoiDung user = userDetails.getNguoiDung();

            return AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .maNguoiDung(user.getMaNguoiDung())
                    .hoTen(user.getHoTen())
                    .email(user.getEmail())
                    .tenDangNhap(user.getTenDangNhap())
                    .vaiTro(user.getVaiTro() != null ? user.getVaiTro().getTenVaiTro().name() : "")
                    .build();
        } catch (BadCredentialsException ex) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
    }
}
