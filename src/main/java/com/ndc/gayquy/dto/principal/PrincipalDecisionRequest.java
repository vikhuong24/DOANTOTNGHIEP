package com.ndc.gayquy.dto.principal;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu phê duyệt hoặc từ chối của Hiệu trưởng")
public class PrincipalDecisionRequest {

    @Schema(description = "Trạng thái quyết định (DaDuyet hoặc TuChoi)", example = "DaDuyet")
    @NotBlank(message = "Trạng thái không được để trống")
    @JsonAlias({"trangThai"})
    private String trangthai;

    @Schema(description = "Lý do từ chối (nếu từ chối)", example = "Cần điều chỉnh lại kế hoạch phân bổ kinh phí chi tiết")
    @JsonAlias({"lyDo", "lyDoTuChoi"})
    private String lydo;
}
