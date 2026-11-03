package com.ndc.gayquy.dto.parent;

import com.ndc.gayquy.common.enums.GioiTinh;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Thông tin học sinh con của phụ huynh")
public class StudentResponse {

    @Schema(description = "Mã học sinh", example = "1")
    private Long maHocSinh;

    @Schema(description = "Họ và tên học sinh", example = "Nguyễn Hoàng Đức")
    private String hoTen;

    @Schema(description = "Ngày tháng năm sinh", example = "2015-05-12")
    private LocalDate ngaySinh;

    @Schema(description = "Giới tính", example = "NAM")
    private GioiTinh gioiTinh;

    @Schema(description = "Lớp học hiện tại", example = "Lớp 3A-KT")
    private String lop;

    @Schema(description = "Loại hình hỗ trợ / Khuyết tật chuyên biệt", example = "Khiếm thị hoàn toàn")
    private String loaiHoTro;

    @Schema(description = "Mô tả / Hoàn cảnh học sinh", example = "Học sinh có tinh thần vượt khó, đam mê học vi tính bằng phần mềm chuyên dụng")
    private String moTa;
}
