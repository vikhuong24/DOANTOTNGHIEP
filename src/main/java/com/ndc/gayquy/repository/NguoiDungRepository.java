package com.ndc.gayquy.repository;

import com.ndc.gayquy.common.enums.TenVaiTro;
import com.ndc.gayquy.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);
    Optional<NguoiDung> findByEmail(String email);
    boolean existsByTenDangNhap(String tenDangNhap);
    boolean existsByEmail(String email);
    List<NguoiDung> findByVaiTro_TenVaiTro(TenVaiTro tenVaiTro);
}
