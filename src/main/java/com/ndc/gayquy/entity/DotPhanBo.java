package com.ndc.gayquy.entity;

import com.ndc.gayquy.common.enums.TrangThaiDotPhanBo;
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
@Table(name = "dotphanbo")
public class DotPhanBo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "madotphanbo")
    private Long maDotPhanBo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mabaitaitro", nullable = false)
    private TTTaiTro baiTaiTro;

    @Column(name = "tendot", nullable = false)
    private String tenDot;

    @Column(name = "tongtien", nullable = false, precision = 15, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "ngaytrao")
    private LocalDateTime ngayTrao;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "trangthai", length = 30)
    private TrangThaiDotPhanBo trangThai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "macanbo", nullable = false)
    private NguoiDung canBo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mahieutruong")
    private NguoiDung hieuTruong;

    @PrePersist
    public void prePersist() {
        if (this.tongTien == null) {
            this.tongTien = BigDecimal.ZERO;
        }
        if (this.trangThai == null) {
            this.trangThai = TrangThaiDotPhanBo.LEN_KE_HOACH;
        }
    }
}
