package com.ndc.gayquy.dto.fundraiser;

import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Thông tin lượt đăng ký tài trợ chờ duyệt")
public class PendingDonationResponse {

    @Schema(description = "Mã đóng góp tài trợ", example = "5")
    private Long maTaiTro;

    @Schema(description = "Mã nhà hảo tâm", example = "4")
    private Long maNguoiDung;

    @Schema(description = "Họ tên nhà hảo tâm", example = "Ông Trần Minh Tâm")
    private String tenNguoiDung;

    @Schema(description = "Số điện thoại", example = "0907777888")
    private String sdtNguoiDung;

    @Schema(description = "Email", example = "minhtam.tran@gmail.com")
    private String emailNguoiDung;

    @Schema(description = "Mã bài tài trợ", example = "4")
    private Long maBaiTaiTro;

    @Schema(description = "Tiêu đề bài tài trợ", example = "Sách giáo khoa chữ nổi Braille và gậy định hướng đón năm học mới")
    private String tieuDeBaiTaiTro;

    @Schema(description = "Tên hiển thị vinh danh", example = "Công ty TNHH Phát Triển Công Nghệ X")
    private String tenHienThi;

    @Schema(description = "Số tiền đăng ký đóng góp (VNĐ)", example = "15000000.00")
    private BigDecimal soTienDk;

    @Schema(description = "Số tiền thực tế", example = "15000000.00")
    private BigDecimal soTienTt;

    @Schema(description = "Ảnh biên lai chuyển khoản / ủy nhiệm chi", example = "/uploads/receipts/bill_05.jpg")
    private String anhGiaoDich;

    @Schema(description = "Trạng thái đóng góp", example = "CHODUYET")
    private TrangThaiTaiTro trangThai;

    @Schema(description = "Ghi chú của người đóng góp", example = "Ủng hộ sách cho các cháu")
    private String ghiChu;

    @Schema(description = "Thời gian đăng ký", example = "2026-03-01T08:30:00")
    private LocalDateTime ngayGui;
}
