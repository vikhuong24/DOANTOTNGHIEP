package com.ndc.gayquy.repository;

import com.ndc.gayquy.common.enums.TenVaiTro;
import com.ndc.gayquy.entity.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VaiTroRepository extends JpaRepository<VaiTro, Long> {
    Optional<VaiTro> findByTenVaiTro(TenVaiTro tenVaiTro);
    boolean existsByTenVaiTro(TenVaiTro tenVaiTro);
}
