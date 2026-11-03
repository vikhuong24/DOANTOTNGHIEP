package com.ndc.gayquy.dto.fundraiser;

import com.ndc.gayquy.common.enums.TrangThaiDeXuat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Thông tin đề xuất tài trợ chờ duyệt")
public class PendingProposalResponse {

    @Schema(description = "Mã đề xuất", example = "2")
    private Long maDeXuat;

    @Schema(description = "Mã người gửi đề xuất", example = "5")
    private Long maNguoiDung;

    @Schema(description = "Họ tên người gửi đề xuất", example = "Bà Hoàng Thị Mai (Phụ Huynh)")
    private String tenNguoiDung;

    @Schema(description = "Số điện thoại người gửi", example = "0909999000")
    private String sdtNguoiDung;

    @Schema(description = "Email người gửi", example = "hoangmai.ph@gmail.com")
    private String emailNguoiDung;

    @Schema(description = "Mã bài tài trợ liên quan", example = "2")
    private Long maBaiTaiTro;

    @Schema(description = "Tiêu đề bài tài trợ", example = "Quỹ học bổng Ánh Sáng Tương Lai năm học 2026")
    private String tieuDeBaiTaiTro;

    @Schema(description = "Tiêu đề đề xuất", example = "Đề xuất xin hỗ trợ kinh phí phẫu thuật mắt cho em Mai Anh")
    private String tieuDe;

    @Schema(description = "Số tiền đề xuất (VNĐ)", example = "10000000.00")
    private BigDecimal soTienDx;

    @Schema(description = "Mục đích sử dụng kinh phí", example = "Bác sĩ chỉ định phẫu thuật can thiệp giảm thoái hóa thị lực")
    private String mucDichSd;

    @Schema(description = "Trạng thái đề xuất", example = "CHO_DUYET")
    private TrangThaiDeXuat trangThai;

    @Schema(description = "Thời gian gửi đề xuất", example = "2026-02-15T09:20:00")
    private LocalDateTime ngayGui;

    @Schema(description = "Thời gian xử lý", example = "2026-02-15T15:00:00")
    private LocalDateTime ngayXuLy;

    @Schema(description = "Lý do từ chối (nếu có)", example = "Chưa đủ điều kiện xét duyệt")
    private String lyDoTuChoi;
}
