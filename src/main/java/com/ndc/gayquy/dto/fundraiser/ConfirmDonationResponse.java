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
@Schema(description = "Kết quả xác nhận đóng góp tài trợ")
public class ConfirmDonationResponse {

    @Schema(description = "Mã đóng góp tài trợ", example = "5")
    private Long maTaiTro;

    @Schema(description = "Mã bài tài trợ", example = "4")
    private Long maBaiTaiTro;

    @Schema(description = "Tiêu đề bài tài trợ", example = "Sách giáo khoa chữ nổi Braille và gậy định hướng đón năm học mới")
    private String tieuDeBaiTaiTro;

    @Schema(description = "Số tiền thực nhận (VNĐ)", example = "15000000.00")
    private BigDecimal soTienTt;

    @Schema(description = "Tổng tiền đã nhận mới của bài tài trợ sau khi cộng dồn (VNĐ)", example = "30000000.00")
    private BigDecimal tongTienDaNhanMoi;

    @Schema(description = "Trạng thái mới của đóng góp", example = "DaNhan")
    private TrangThaiTaiTro trangThai;

    @Schema(description = "Mã cán bộ xác nhận", example = "3")
    private Long maCanBo;

    @Schema(description = "Tên cán bộ xác nhận", example = "Cô Lê Phương Thảo (Cán Bộ)")
    private String tenCanBo;

    @Schema(description = "Thời gian xác nhận nhận tiền", example = "2026-03-01T10:00:00")
    private LocalDateTime ngayNhan;

    @Schema(description = "Ghi chú đối soát", example = "Đã khớp lệnh với sao kê ngân hàng")
    private String ghiChu;
}
