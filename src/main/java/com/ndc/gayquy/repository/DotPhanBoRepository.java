package com.ndc.gayquy.repository;

import com.ndc.gayquy.common.enums.TrangThaiDotPhanBo;
import com.ndc.gayquy.entity.DotPhanBo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DotPhanBoRepository extends JpaRepository<DotPhanBo, Long> {

    List<DotPhanBo> findByBaiTaiTro_MaBaiTaiTro(Long maBaiTaiTro);

    List<DotPhanBo> findByCanBo_MaNguoiDungOrderByMaDotPhanBoDesc(Long maCanBo);

    List<DotPhanBo> findAllByOrderByMaDotPhanBoDesc();

    List<DotPhanBo> findByTrangThai(TrangThaiDotPhanBo trangThai);

    List<DotPhanBo> findByTrangThaiInOrderByMaDotPhanBoDesc(Collection<TrangThaiDotPhanBo> statuses);
}
