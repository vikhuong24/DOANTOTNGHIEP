package com.ndc.gayquy.entity;

import com.ndc.gayquy.common.enums.GioiTinh;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "hocsinh")
public class HocSinh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mahocsinh")
    private Long maHocSinh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maphuhuynh")
    private NguoiDung phuHuynh;

    @Column(name = "hoten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "ngaysinh")
    private LocalDate ngaySinh;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "gioitinh", length = 10)
    private GioiTinh gioiTinh;

    @Column(name = "lop", length = 20)
    private String lop;

    @Column(name = "loaihotro", length = 100)
    private String loaiHoTro;

    @Column(name = "mota", columnDefinition = "TEXT")
    private String moTa;
}
