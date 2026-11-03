package com.ndc.gayquy.dto.donor;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu gửi phản hồi / ý kiến đóng góp")
public class FeedbackRequest {

    @Schema(description = "Mã bài tài trợ liên quan (nếu có)", example = "1")
    @Positive(message = "Mã bài tài trợ phải là số nguyên dương")
    private Long maBaiTaiTro;

    @Schema(description = "Mã đợt phân bổ liên quan (nếu có)", example = "1")
    @Positive(message = "Mã đợt phân bổ phải là số nguyên dương")
    private Long maDotPhanBo;

    @Schema(description = "Tiêu đề phản hồi", example = "Hỏi về tiến độ tiếp nhận bàn ghế đợt 1")
    @NotBlank(message = "Tiêu đề phản hồi không được để trống")
    @Size(min = 5, max = 255, message = "Tiêu đề phản hồi phải từ 5 đến 255 ký tự")
    private String tieuDe;

    @Schema(description = "Nội dung phản hồi chi tiết", example = "Tôi muốn tìm hiểu thời gian bàn giao thực tế của đợt phân bổ số 1 để cùng tham gia lễ trao quà.")
    @NotBlank(message = "Nội dung phản hồi không được để trống")
    @Size(min = 10, max = 2000, message = "Nội dung phản hồi phải từ 10 đến 2,000 ký tự")
    private String noiDung;
}
