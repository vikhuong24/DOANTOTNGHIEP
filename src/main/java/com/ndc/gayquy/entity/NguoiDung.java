package com.ndc.gayquy.entity;

import com.ndc.gayquy.common.enums.TrangThaiNguoiDung;
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
@Table(name = "nguoidung")
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "manguoidung")
    private Long maNguoiDung;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mavaitro", nullable = false)
    private VaiTro vaiTro;

    @Column(name = "tendangnhap", unique = true, length = 50)
    private String tenDangNhap;

    @Column(name = "matkhau", nullable = false)
    private String matKhau;

    @Column(name = "hoten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "sdt", length = 15)
    private String sdt;

    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Column(name = "diachi")
    private String diaChi;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "trangthai", nullable = false, length = 30)
    private TrangThaiNguoiDung trangThai;

    @Column(name = "ngaytao")
    private LocalDateTime ngayTao;

    @Column(name = "ngaycapnhat")
    private LocalDateTime ngayCapNhat;

    @PrePersist
    public void prePersist() {
        if (this.ngayTao == null) {
            this.ngayTao = LocalDateTime.now();
        }
        if (this.trangThai == null) {
            this.trangThai = TrangThaiNguoiDung.HOAT_DONG;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.ngayCapNhat = LocalDateTime.now();
    }
}
