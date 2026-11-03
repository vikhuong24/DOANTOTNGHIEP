package com.ndc.gayquy.entity;

import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
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
@Table(name = "taitro")
public class TaiTro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maitaitro")
    private Long maTaiTro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manguoidung")
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mabaitaitro", nullable = false)
    private TTTaiTro baiTaiTro;

    @Column(name = "tenhienthi", length = 100)
    private String tenHienThi;

    @Column(name = "soitendk", nullable = false, precision = 15, scale = 2)
    private BigDecimal soTienDk;

    @Column(name = "soitentt", precision = 15, scale = 2)
    private BigDecimal soTienTt;

    @Column(name = "anhgiaodich")
    private String anhGiaoDich;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "trangthai", length = 30)
    private TrangThaiTaiTro trangThai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "macanbo")
    private NguoiDung canBo;

    @Column(name = "ghichu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "ngaygui")
    private LocalDateTime ngayGui;

    @Column(name = "ngaynhan")
    private LocalDateTime ngayNhan;

    @PrePersist
    public void prePersist() {
        if (this.ngayGui == null) {
            this.ngayGui = LocalDateTime.now();
        }
        if (this.trangThai == null) {
            this.trangThai = TrangThaiTaiTro.CHODUYET;
        }
        if (this.soTienDk == null) {
            this.soTienDk = BigDecimal.ZERO;
        }
        if (this.soTienTt == null) {
            this.soTienTt = BigDecimal.ZERO;
        }
    }
}
