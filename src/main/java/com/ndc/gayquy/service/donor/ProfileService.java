package com.ndc.gayquy.service.donor;

import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.donor.ProfileResponse;
import com.ndc.gayquy.dto.donor.UpdateProfileRequest;
import com.ndc.gayquy.entity.NguoiDung;
import com.ndc.gayquy.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final NguoiDungRepository nguoiDungRepository;

    private static final String PHONE_REGEX = "^0\\d{9}$";
    private static final String EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$";

    /**
     * Xem thông tin cá nhân của Nhà hảo tâm hiện tại
     */
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        NguoiDung user = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return ProfileResponse.builder()
                .maNguoiDung(user.getMaNguoiDung())
                .hoTen(user.getHoTen())
                .email(user.getEmail())
                .sdt(user.getSdt())
                .diaChi(user.getDiaChi())
                .ngayTao(user.getNgayTao())
                .build();
    }

    /**
     * Cập nhật thông tin cá nhân (hoten, email, sdt, diachi).
     * QUY TẮC:
     * - Chỉ cập nhật trường có giá trị mới hợp lệ (khác null, không rỗng, không phải chuỗi placeholder "string").
     * - Số điện thoại bắt buộc phải bắt đầu bằng số 0 và bao gồm đúng 10 chữ số.
     * - Email phải đúng định dạng chuẩn.
     * - Những trường không sửa thì giữ nguyên giá trị cũ trong DB.
     */
    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        NguoiDung user = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // 1. Cập nhật họ tên nếu có
        if (hasValidNewValue(request.getHoTen())) {
            user.setHoTen(request.getHoTen().trim());
        }

        // 2. Cập nhật email nếu có (kiểm tra định dạng & trùng lặp)
        if (hasValidNewValue(request.getEmail())) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.matches(EMAIL_REGEX)) {
                throw new AppException(ErrorCode.INVALID_KEY, "Email không đúng định dạng!");
            }
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && nguoiDungRepository.existsByEmail(newEmail)) {
                throw new AppException(ErrorCode.USER_EXISTED, "Email này đã được sử dụng bởi tài khoản khác!");
            }
            user.setEmail(newEmail);
            // Cập nhật cả tendangnhap nếu ban đầu tendangnhap lấy theo email cũ
            if (user.getTenDangNhap() == null || user.getTenDangNhap().contains("@")) {
                user.setTenDangNhap(newEmail);
            }
        }

        // 3. Cập nhật số điện thoại nếu có (kiểm tra bắt đầu bằng 0, đúng 10 chữ số)
        if (hasValidNewValue(request.getSdt())) {
            String newPhone = request.getSdt().trim();
            if (!newPhone.matches(PHONE_REGEX)) {
                throw new AppException(ErrorCode.INVALID_KEY,
                        "Số điện thoại không hợp lệ! Bắt buộc phải bắt đầu bằng số 0 và có đúng 10 chữ số.");
            }
            user.setSdt(newPhone);
        }

        // 4. Cập nhật địa chỉ nếu có
        if (hasValidNewValue(request.getDiaChi())) {
            user.setDiaChi(request.getDiaChi().trim());
        }

        NguoiDung updated = nguoiDungRepository.save(user);
        log.info("Nhà hảo tâm #{} đã cập nhật thông tin cá nhân", userId);

        return ProfileResponse.builder()
                .maNguoiDung(updated.getMaNguoiDung())
                .hoTen(updated.getHoTen())
                .email(updated.getEmail())
                .sdt(updated.getSdt())
                .diaChi(updated.getDiaChi())
                .ngayTao(updated.getNgayTao())
                .build();
    }

    private boolean hasValidNewValue(String value) {
        return value != null && !value.trim().isEmpty() && !value.trim().equalsIgnoreCase("string");
    }
}
