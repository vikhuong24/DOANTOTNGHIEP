package com.ndc.gayquy.repository;

import com.ndc.gayquy.common.enums.TrangThaiPhanHoi;
import com.ndc.gayquy.entity.PhanHoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface PhanHoiRepository extends JpaRepository<PhanHoi, Long> {

    List<PhanHoi> findByNguoiDung_MaNguoiDung(Long maNguoiDung);

    List<PhanHoi> findByNguoiDung_MaNguoiDungOrderByNgayGuiDesc(Long maNguoiDung);

    List<PhanHoi> findByBaiTaiTro_MaBaiTaiTro(Long maBaiTaiTro);

    List<PhanHoi> findByDotPhanBo_MaDotPhanBo(Long maDotPhanBo);

    List<PhanHoi> findByTrangThai(TrangThaiPhanHoi trangThai);

    List<PhanHoi> findByTrangThaiInOrderByNgayGuiDesc(Collection<TrangThaiPhanHoi> statuses);

    List<PhanHoi> findAllByOrderByNgayGuiDesc();
}
