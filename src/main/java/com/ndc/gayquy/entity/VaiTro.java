package com.ndc.gayquy.entity;

import com.ndc.gayquy.common.enums.TenVaiTro;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "vaitro")
public class VaiTro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mavaitro")
    private Long maVaiTro;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "tenvaitro", nullable = false, unique = true, length = 50)
    private TenVaiTro tenVaiTro;

    @Column(name = "mota")
    private String moTa;
}
