package com.ndc.gayquy.entity;

import com.ndc.gayquy.common.enums.TrangThaiPhanHoi;
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
@Table(name = "phanhoi")
public class PhanHoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maphanhoi")
    private Long maPhanHoi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manguoidung", nullable = false)
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mabaitaitro")
    private TTTaiTro baiTaiTro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "madotphanbo")
    private DotPhanBo dotPhanBo;

    @Column(name = "tieude", nullable = false)
    private String tieuDe;

    @Column(name = "noidung", nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "noidungtraloi", columnDefinition = "TEXT")
    private String noiDungTraLoi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "macanbo")
    private NguoiDung canBo;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "trangthai", length = 30)
    private TrangThaiPhanHoi trangThai;

    @Column(name = "ngaygui")
    private LocalDateTime ngayGui;

    @Column(name = "ngaytraloi")
    private LocalDateTime ngayTraLoi;

    @PrePersist
    public void prePersist() {
        if (this.ngayGui == null) {
            this.ngayGui = LocalDateTime.now();
        }
        if (this.trangThai == null) {
            this.trangThai = TrangThaiPhanHoi.CHOXULY;
        }
    }
}
