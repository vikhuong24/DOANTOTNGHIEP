package com.ndc.gayquy.dto.parent;

import com.ndc.gayquy.common.enums.TrangThaiPhanHoi;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Thông tin phản hồi và câu trả lời dành cho phụ huynh")
public class ParentFeedbackResponse {

    @Schema(description = "Mã phản hồi", example = "2")
    private Long maPhanHoi;

    @Schema(description = "Tiêu đề phản hồi", example = "Thời gian nhận học bổng đợt 2 của em Mai Anh")
    private String tieuDe;

    @Schema(description = "Nội dung phản hồi của phụ huynh", example = "Cho tôi hỏi đợt 2 khi nào trao và địa điểm tổ chức ở đâu?")
    private String noiDung;

    @Schema(description = "Mã bài tài trợ liên quan", example = "2")
    private Long maBaiTaiTro;

    @Schema(description = "Tiêu đề bài tài trợ liên quan", example = "Quỹ học bổng Ánh Sáng Tương Lai năm học 2026")
    private String tieuDeBaiTaiTro;

    @Schema(description = "Mã đợt phân bổ liên quan", example = "1")
    private Long maDotPhanBo;

    @Schema(description = "Tên đợt phân bổ liên quan", example = "Đợt 1 - Trao 25 suất học bổng học kỳ 1 năm học 2025-2026")
    private String tenDotPhanBo;

    @Schema(description = "Nội dung câu trả lời từ nhà trường / cán bộ", example = "Chào chị Mai, đợt 2 dự kiến tổ chức tại Hội trường A lúc 09h00 sáng ngày 08/03/2026 ạ.")
    private String noiDungTraLoi;

    @Schema(description = "Tên cán bộ trả lời phản hồi", example = "Cô Lê Phương Thảo (Cán Bộ)")
    private String tenCanBoTraLoi;

    @Schema(description = "Trạng thái xử lý phản hồi", example = "DA_TRA_LOI")
    private TrangThaiPhanHoi trangThai;

    @Schema(description = "Thời gian gửi phản hồi", example = "2026-02-20T10:00:00")
    private LocalDateTime ngayGui;

    @Schema(description = "Thời gian cán bộ trả lời phản hồi", example = "2026-02-20T16:00:00")
    private LocalDateTime ngayTraLoi;
}
