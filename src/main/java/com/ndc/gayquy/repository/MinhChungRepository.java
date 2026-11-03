package com.ndc.gayquy.repository;

import com.ndc.gayquy.entity.MinhChung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface MinhChungRepository extends JpaRepository<MinhChung, Long> {

    List<MinhChung> findByBaiTaiTro_MaBaiTaiTro(Long maBaiTaiTro);

    List<MinhChung> findByDotPhanBo_MaDotPhanBo(Long maDotPhanBo);

    List<MinhChung> findByDotPhanBo_MaDotPhanBoInOrderByNgayTaiLenDesc(Collection<Long> dotPhanBoIds);

    List<MinhChung> findByNguoiDung_MaNguoiDung(Long maNguoiDung);

    List<MinhChung> findByNguoiDung_MaNguoiDungOrderByNgayTaiLenDesc(Long maNguoiDung);

    List<MinhChung> findAllByOrderByNgayTaiLenDesc();
}
