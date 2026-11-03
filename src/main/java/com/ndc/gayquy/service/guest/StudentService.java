package com.ndc.gayquy.service.guest;

import com.ndc.gayquy.dto.guest.PageCustomResponse;
import com.ndc.gayquy.dto.guest.StudentSummaryResponse;
import com.ndc.gayquy.entity.HocSinh;
import com.ndc.gayquy.repository.HocSinhRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final HocSinhRepository hocSinhRepository;

    /**
     * Lấy danh sách học sinh cần hỗ trợ (ẩn thông tin nhạy cảm như phụ huynh, liên lạc, địa chỉ)
     */
    @Transactional(readOnly = true)
    public PageCustomResponse<StudentSummaryResponse> layDanhSachHocSinh(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("maHocSinh").ascending());
        Page<HocSinh> pageResult = hocSinhRepository.findAll(pageable);

        Page<StudentSummaryResponse> mappedPage = pageResult.map(h -> StudentSummaryResponse.builder()
                .maHocSinh(h.getMaHocSinh())
                .hoTen(anDanhHoTen(h.getHoTen()))
                .gioiTinh(h.getGioiTinh())
                .lop(h.getLop())
                .loaiHoTro(h.getLoaiHoTro())
                .moTa(h.getMoTa())
                .build());

        return PageCustomResponse.from(mappedPage);
    }

    /**
     * Hàm làm mờ / bảo vệ tên học sinh (VD: "Nguyễn Hoàng Đức" -> "Nguyễn H. Đ.")
     */
    private String anDanhHoTen(String hoTen) {
        if (hoTen == null || hoTen.isBlank()) return "Học sinh";
        String[] parts = hoTen.trim().split("\\s+");
        if (parts.length <= 1) return hoTen;

        StringBuilder sb = new StringBuilder();
        sb.append(parts[0]); // Giữ họ
        for (int i = 1; i < parts.length; i++) {
            sb.append(" ").append(parts[i].charAt(0)).append(".");
        }
        return sb.toString();
    }
}
