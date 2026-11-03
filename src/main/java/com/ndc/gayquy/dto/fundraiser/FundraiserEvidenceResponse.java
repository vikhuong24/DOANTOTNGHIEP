package com.ndc.gayquy.dto.fundraiser;

import com.ndc.gayquy.common.enums.LoaiTaiLieu;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Thông tin tài liệu minh chứng")
public class FundraiserEvidenceResponse {

    @Schema(description = "Mã tài liệu minh chứng", example = "1")
    private Long maMinhChung;

    @Schema(description = "Mã bài tài trợ liên quan", example = "2")
    private Long maBaiTaiTro;

    @Schema(description = "Tiêu đề bài tài trợ", example = "Quỹ học bổng Ánh Sáng Tương Lai năm học 2026")
    private String tieuDeBaiTaiTro;

    @Schema(description = "Mã đợt phân bổ liên quan", example = "1")
    private Long maDotPhanBo;

    @Schema(description = "Tên đợt phân bổ", example = "Đợt 1 - Trao 25 suất học bổng học kỳ 1 năm học 2025-2026")
    private String tenDotPhanBo;

    @Schema(description = "Loại tài liệu minh chứng", example = "HOADON")
    private LoaiTaiLieu loaiTaiLieu;

    @Schema(description = "Đường dẫn tải / xem tệp minh chứng", example = "/uploads/proofs/bien_ban_trao_hoc_bong_dot1.pdf")
    private String duongDanTep;

    @Schema(description = "Mô tả minh chứng", example = "Biên bản có chữ ký của Hiệu trưởng, Cán bộ và Đại diện phụ huynh")
    private String moTa;

    @Schema(description = "Thời gian tải lên", example = "2026-02-10T11:30:00")
    private LocalDateTime ngayTaiLen;

    @Schema(description = "Mã người đăng tải", example = "3")
    private Long maNguoiDung;

    @Schema(description = "Tên người đăng tải", example = "Cô Lê Phương Thảo (Cán Bộ)")
    private String tenNguoiDung;
}
