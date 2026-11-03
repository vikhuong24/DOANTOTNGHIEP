package com.ndc.gayquy.dto.parent;

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
@Schema(description = "Yêu cầu gửi phản hồi sai lệch của phụ huynh")
public class ParentFeedbackRequest {

    @Schema(description = "Mã bài tài trợ liên quan (nếu có)", example = "2")
    @Positive(message = "Mã bài tài trợ phải là số nguyên dương")
    private Long maBaiTaiTro;

    @Schema(description = "Mã đợt phân bổ liên quan (nếu có)", example = "1")
    @Positive(message = "Mã đợt phân bổ phải là số nguyên dương")
    private Long maDotPhanBo;

    @Schema(description = "Tiêu đề phản hồi sai lệch", example = "Phản hồi về sai lệch số tiền nhận thực tế đợt 1")
    @NotBlank(message = "Tiêu đề phản hồi không được để trống")
    @Size(min = 5, max = 255, message = "Tiêu đề phản hồi phải từ 5 đến 255 ký tự")
    private String tieuDe;

    @Schema(description = "Nội dung phản hồi chi tiết về sự sai lệch", example = "Gia đình tôi ký nhận số tiền 1.500.000đ nhưng trên danh sách công khai ghi 2.000.000đ, kính mong nhà trường rà soát đối chiếu lại.")
    @NotBlank(message = "Nội dung phản hồi không được để trống")
    @Size(min = 10, max = 2000, message = "Nội dung phản hồi phải từ 10 đến 2,000 ký tự")
    private String noiDung;
}
