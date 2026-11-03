package com.ndc.gayquy.dto.principal;

import com.ndc.gayquy.common.enums.TrangThaiBaiDang;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Thông tin bài đăng gây quỹ dành cho Hiệu trưởng xét duyệt")
public class PrincipalCampaignResponse {

    @Schema(description = "Mã bài tài trợ", example = "1")
    private Long maBaiTaiTro;

    @Schema(description = "Tiêu đề bài đăng", example = "Trang bị phòng vi tính chuyên biệt cho học sinh khiếm thị")
    private String tieuDe;

    @Schema(description = "Nội dung bài viết", example = "Dự án nhằm mua sắm 20 bộ máy vi tính...")
    private String noiDung;

    @Schema(description = "Đường dẫn ảnh bìa", example = "/uploads/banners/may-tinh-khiem-thi.jpg")
    private String anhBia;

    @Schema(description = "Mục tiêu kêu gọi (VNĐ)", example = "150000000.00")
    private BigDecimal mucTieu;

    @Schema(description = "Tổng tiền đã nhận thực tế (VNĐ)", example = "85000000.00")
    private BigDecimal tongTienDaNhan;

    @Schema(description = "Trạng thái bài đăng", example = "CHODUYET")
    private TrangThaiBaiDang trangThai;

    @Schema(description = "Mã cán bộ lập bài đăng", example = "3")
    private Long maCanBo;

    @Schema(description = "Tên cán bộ lập bài đăng", example = "Cô Lê Phương Thảo (Cán Bộ)")
    private String tenCanBo;

    @Schema(description = "Mã hiệu trưởng phê duyệt", example = "2")
    private Long maHieuTruong;

    @Schema(description = "Tên hiệu trưởng phê duyệt", example = "Thầy Nguyễn Văn Nam (Hiệu Trưởng)")
    private String tenHieuTruong;

    @Schema(description = "Thời gian bắt đầu", example = "2026-01-10T08:00:00")
    private LocalDateTime ngayBatDau;

    @Schema(description = "Thời gian kết thúc", example = "2026-05-30T23:59:59")
    private LocalDateTime ngayKetThuc;
}
