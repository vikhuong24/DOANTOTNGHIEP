package com.ndc.gayquy.dto.donor;

import com.ndc.gayquy.common.enums.LoaiTaiLieu;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MinhChungItemResponse {

    private Long maMinhChung;
    private LoaiTaiLieu loaiTaiLieu;
    private String duongDanTep;
    private String moTa;
    private LocalDateTime ngayTaiLen;
}
