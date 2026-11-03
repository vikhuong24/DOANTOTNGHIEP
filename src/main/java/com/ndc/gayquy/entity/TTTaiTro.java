package com.ndc.gayquy.entity;

import com.ndc.gayquy.common.enums.TrangThaiBaiTaiTro;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tt_taitro")
public class TTTaiTro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mabaitaitro")
    private Long maBaiTaiTro;

    @Column(name = "tieude", nullable = false)
    private String tieuDe;

    @Column(name = "noidung", nullable = false, columnDefinition = "LONGTEXT")
    private String noiDung;

    @Column(name = "anhbia")
    private String anhBia;

    @Column(name = "muctieu", nullable = false, precision = 15, scale = 2)
    private BigDecimal mucTieu;

    @Column(name = "tongtiendanhan", nullable = false, precision = 15, scale = 2)
    private BigDecimal tongTienDaNhan;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "trangthai", length = 30)
    private TrangThaiBaiTaiTro trangThai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "macanbo", nullable = false)
    private NguoiDung canBo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mahieutruong")
    private NguoiDung hieuTruong;

    @Column(name = "ngaybatdau")
    private LocalDateTime ngayBatDau;

    @Column(name = "ngaykethuc")
    private LocalDateTime ngayKetThuc;

    @PrePersist
    public void prePersist() {
        if (this.tongTienDaNhan == null) {
            this.tongTienDaNhan = BigDecimal.ZERO;
        }
        if (this.mucTieu == null) {
            this.mucTieu = BigDecimal.ZERO;
        }
        if (this.trangThai == null) {
            this.trangThai = TrangThaiBaiTaiTro.DANG_KHOI_TAO;
        }
    }
}
