package com.ndc.gayquy.dto.fundraiser;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu trả lời phản hồi của người dùng")
public class ReplyFeedbackRequest {

    @Schema(description = "Nội dung trả lời từ cán bộ nhà trường", example = "Dạ kính chào quý vị, nhà trường đã rà soát lại thông tin và xác nhận số tiền học bổng trao tặng chính xác theo biên bản. Cảm ơn quý vị đã phản hồi.")
    @NotBlank(message = "Nội dung trả lời không được để trống")
    @Size(min = 5, max = 2000, message = "Nội dung trả lời phải từ 5 đến 2,000 ký tự")
    private String noiDungTraLoi;
}
