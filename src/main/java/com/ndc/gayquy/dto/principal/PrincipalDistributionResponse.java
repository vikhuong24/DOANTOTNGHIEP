package com.ndc.gayquy.dto.principal;

import com.ndc.gayquy.common.enums.TrangThaiDotPhanBo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Thông tin đợt phân bổ kinh phí dành cho Hiệu trưởng xét duyệt")
public class PrincipalDistributionResponse {

    @Schema(description = "Mã đợt phân bổ", example = "1")
    private Long maDotPhanBo;

    @Schema(description = "Mã bài tài trợ liên quan", example = "2")
    private Long maBaiTaiTro;

    @Schema(description = "Tiêu đề bài tài trợ", example = "Quỹ học bổng Ánh Sáng Tương Lai năm học 2026")
    private String tieuDeBaiTaiTro;

    @Schema(description = "Tên đợt phân bổ", example = "Đợt 1 - Trao 25 suất học bổng học kỳ 1 năm học 2025-2026")
    private String tenDot;

    @Schema(description = "Tổng tiền đợt phân bổ (VNĐ)", example = "50000000.00")
    private BigDecimal tongTien;

    @Schema(description = "Thời gian tổ chức trao", example = "2026-02-10T09:00:00")
    private LocalDateTime ngayTrao;

    @Schema(description = "Trạng thái đợt phân bổ", example = "ChoDuyet")
    private TrangThaiDotPhanBo trangThai;

    @Schema(description = "Mã cán bộ lập kế hoạch", example = "3")
    private Long maCanBo;

    @Schema(description = "Tên cán bộ lập kế hoạch", example = "Cô Lê Phương Thảo (Cán Bộ)")
    private String tenCanBo;

    @Schema(description = "Mã hiệu trưởng phê duyệt", example = "2")
    private Long maHieuTruong;

    @Schema(description = "Tên hiệu trưởng phê duyệt", example = "Thầy Nguyễn Văn Nam (Hiệu Trưởng)")
    private String tenHieuTruong;

    @Schema(description = "Danh sách chi tiết phân bổ cho từng học sinh")
    private List<PrincipalDistributionDetailResponse> chiTietPhanBo;
}
