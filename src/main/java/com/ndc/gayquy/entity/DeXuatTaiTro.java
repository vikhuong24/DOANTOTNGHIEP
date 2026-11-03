package com.ndc.gayquy.entity;

import com.ndc.gayquy.common.enums.TrangThaiDeXuat;
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
@Table(name = "dexuattaitro")
public class DeXuatTaiTro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "madexuat")
    private Long maDeXuat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manguoidung", nullable = false)
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mabaitaitro")
    private TTTaiTro baiTaiTro;

    @Column(name = "tieude", nullable = false)
    private String tieuDe;

    @Column(name = "soitendx", nullable = false, precision = 15, scale = 2)
    private BigDecimal soTienDx;

    @Column(name = "mucdichsd", columnDefinition = "TEXT")
    private String mucDichSd;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "trangthai", length = 30)
    private TrangThaiDeXuat trangThai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "macanbo")
    private NguoiDung canBo;

    @Column(name = "ngayxuly")
    private LocalDateTime ngayXuLy;

    @Column(name = "lydotuchoi", columnDefinition = "TEXT")
    private String lyDoTuChoi;

    @Column(name = "ngaygui")
    private LocalDateTime ngayGui;

    @PrePersist
    public void prePersist() {
        if (this.ngayGui == null) {
            this.ngayGui = LocalDateTime.now();
        }
        if (this.trangThai == null) {
            this.trangThai = TrangThaiDeXuat.CHODUYET;
        }
        if (this.soTienDx == null) {
            this.soTienDx = BigDecimal.ZERO;
        }
    }
}
