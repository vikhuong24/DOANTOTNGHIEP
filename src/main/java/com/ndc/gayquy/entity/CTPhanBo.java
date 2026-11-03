package com.ndc.gayquy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ct_phanbo")
public class CTPhanBo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "machitietphanbo")
    private Long maChiTietPhanBo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "madotphanbo", nullable = false)
    private DotPhanBo dotPhanBo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mahocsinh", nullable = false)
    private HocSinh hocSinh;

    @Column(name = "sotien", nullable = false, precision = 15, scale = 2)
    private BigDecimal soTien;

    @Column(name = "nguoinhan", length = 100)
    private String nguoiNhan;

    @Column(name = "ngaynhan")
    private LocalDateTime ngayNhan;

    @Column(name = "ghichu", columnDefinition = "TEXT")
    private String ghiChu;

    @PrePersist
    public void prePersist() {
        if (this.soTien == null) {
            this.soTien = BigDecimal.ZERO;
        }
    }
}
