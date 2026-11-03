package com.ndc.gayquy.dto.parent;

import com.ndc.gayquy.common.enums.TrangThaiDotPhanBo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Lịch sử nhận hỗ trợ của học sinh")
public class StudentSupportHistoryResponse {

    @Schema(description = "Mã chi tiết phân bổ", example = "1")
    private Long maChiTietPhanBo;

    @Schema(description = "Mã đợt phân bổ", example = "1")
    private Long maDotPhanBo;

    @Schema(description = "Tên đợt phân bổ", example = "Đợt 1 - Trao 25 suất học bổng học kỳ 1 năm học 2025-2026")
    private String tenDotPhanBo;

    @Schema(description = "Mã bài tài trợ liên quan", example = "2")
    private Long maBaiTaiTro;

    @Schema(description = "Tiêu đề bài tài trợ liên quan", example = "Quỹ học bổng Ánh Sáng Tương Lai năm học 2026")
    private String tieuDeBaiTaiTro;

    @Schema(description = "Số tiền học sinh nhận được", example = "2000000.00")
    private BigDecimal soTien;

    @Schema(description = "Họ tên người đại diện nhận thay", example = "Hoàng Thị Mai (Mẹ nhận thay)")
    private String nguoiNhan;

    @Schema(description = "Thời gian nhận tiền / quà", example = "2026-02-10T09:30:00")
    private LocalDateTime ngayNhan;

    @Schema(description = "Ghi chú phân bổ", example = "Học bổng vượt khó kỳ 1")
    private String ghiChu;

    @Schema(description = "Trạng thái đợt phân bổ", example = "DATRAO")
    private TrangThaiDotPhanBo trangThaiDotPhanBo;

    @Schema(description = "Ngày tổ chức trao", example = "2026-02-10T09:00:00")
    private LocalDateTime ngayTrao;
}
