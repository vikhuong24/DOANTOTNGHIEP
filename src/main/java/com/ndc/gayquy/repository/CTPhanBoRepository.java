package com.ndc.gayquy.repository;

import com.ndc.gayquy.entity.CTPhanBo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CTPhanBoRepository extends JpaRepository<CTPhanBo, Long> {

    List<CTPhanBo> findByDotPhanBo_MaDotPhanBo(Long maDotPhanBo);

    List<CTPhanBo> findByHocSinh_MaHocSinh(Long maHocSinh);

    List<CTPhanBo> findByHocSinh_MaHocSinhOrderByNgayNhanDesc(Long maHocSinh);
}
