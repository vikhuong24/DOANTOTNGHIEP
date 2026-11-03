package com.ndc.gayquy.dto.donor;

import com.ndc.gayquy.common.enums.TrangThaiDeXuat;
import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationHistoryResponse {

    private BigDecimal tongTienDongGopThanhCong;
    private List<TaiTroHistoryItem> danhSachDongGop;
    private List<DeXuatHistoryItem> danhSachDeXuat;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaiTroHistoryItem {
        private Long maTaiTro;
        private Long maBaiTaiTro;
        private String tieuDeBaiTaiTro;
        private String tenHienThi;
        private BigDecimal soTienDk;
        private BigDecimal soTienTt;
        private String anhGiaoDich;
        private TrangThaiTaiTro trangThai;
        private String ghiChu;
        private LocalDateTime ngayGui;
        private LocalDateTime ngayNhan;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeXuatHistoryItem {
        private Long maDeXuat;
        private Long maBaiTaiTro;
        private String tieuDeBaiTaiTro;
        private String tieuDe;
        private BigDecimal soTienDx;
        private String mucDichSd;
        private TrangThaiDeXuat trangThai;
        private String lyDoTuChoi;
        private LocalDateTime ngayGui;
        private LocalDateTime ngayXuLy;
    }
}
