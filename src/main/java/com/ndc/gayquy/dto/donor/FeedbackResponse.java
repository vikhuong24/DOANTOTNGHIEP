package com.ndc.gayquy.dto.donor;

import com.ndc.gayquy.common.enums.TrangThaiPhanHoi;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponse {

    private Long maPhanHoi;
    private Long maBaiTaiTro;
    private String tieuDeBaiTaiTro;
    private Long maDotPhanBo;
    private String tieuDe;
    private String noiDung;
    private String noiDungTraLoi;
    private String tenCanBoTraLoi;
    private TrangThaiPhanHoi trangThai;
    private LocalDateTime ngayGui;
    private LocalDateTime ngayTraLoi;
}
