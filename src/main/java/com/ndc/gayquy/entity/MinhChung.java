package com.ndc.gayquy.entity;

import com.ndc.gayquy.common.enums.LoaiTaiLieuMinhChung;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "minhchung")
public class MinhChung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maminhchung")
    private Long maMinhChung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mabaitaitro")
    private TTTaiTro baiTaiTro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "madotphanbo")
    private DotPhanBo dotPhanBo;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "loaitailieu", length = 50)
    private LoaiTaiLieuMinhChung loaiTaiLieu;

    @Column(name = "duongdantep", nullable = false)
    private String duongDanTep;

    @Column(name = "mota", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "ngaytailen")
    private LocalDateTime ngayTaiLen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manguoidung", nullable = false)
    private NguoiDung nguoiDung;

    @PrePersist
    public void prePersist() {
        if (this.ngayTaiLen == null) {
            this.ngayTaiLen = LocalDateTime.now();
        }
    }
}
