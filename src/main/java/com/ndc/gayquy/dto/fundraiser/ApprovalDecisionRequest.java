package com.ndc.gayquy.dto.fundraiser;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu phê duyệt hoặc từ chối đề xuất / đăng ký tài trợ")
public class ApprovalDecisionRequest {

    @Schema(description = "Trạng thái quyết định (DaDuyet hoặc TuChoi)", example = "DaDuyet")
    @NotBlank(message = "Trạng thái quyết định không được để trống")
    @JsonAlias({"trangThai"})
    private String trangthai;

    @Schema(description = "Lý do từ chối (nếu từ chối)", example = "Hiện nhà trường đã có kế hoạch nguồn tài trợ khác.")
    @JsonAlias({"lyDo", "lyDoTuChoi"})
    private String lydo;
}
