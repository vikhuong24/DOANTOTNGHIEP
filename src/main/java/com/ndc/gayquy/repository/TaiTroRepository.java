package com.ndc.gayquy.repository;

import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
import com.ndc.gayquy.entity.TaiTro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Repository
public interface TaiTroRepository extends JpaRepository<TaiTro, Long> {

    List<TaiTro> findByBaiTaiTro_MaBaiTaiTro(Long maBaiTaiTro);

    List<TaiTro> findByNguoiDung_MaNguoiDung(Long maNguoiDung);

    List<TaiTro> findByTrangThai(TrangThaiTaiTro trangThai);

    List<TaiTro> findByTrangThaiInOrderByNgayGuiDesc(Collection<TrangThaiTaiTro> statuses);

    List<TaiTro> findByBaiTaiTro_MaBaiTaiTroAndTrangThai(Long maBaiTaiTro, TrangThaiTaiTro trangThai);

    @Query("SELECT t FROM TaiTro t WHERE t.trangThai IN (:statuses) AND (:maBaiTaiTro IS NULL OR t.baiTaiTro.maBaiTaiTro = :maBaiTaiTro) ORDER BY t.ngayNhan DESC")
    Page<TaiTro> findPublicStatements(@Param("statuses") Collection<TrangThaiTaiTro> statuses, @Param("maBaiTaiTro") Long maBaiTaiTro, Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.soTienTt), 0) FROM TaiTro t WHERE t.trangThai IN (:statuses)")
    BigDecimal tinhTongTienQuyenGop(@Param("statuses") Collection<TrangThaiTaiTro> statuses);

    @Query("SELECT YEAR(t.ngayNhan), MONTH(t.ngayNhan), SUM(t.soTienTt) " +
           "FROM TaiTro t " +
           "WHERE t.trangThai IN (:statuses) AND t.ngayNhan IS NOT NULL " +
           "GROUP BY YEAR(t.ngayNhan), MONTH(t.ngayNhan) " +
           "ORDER BY YEAR(t.ngayNhan) DESC, MONTH(t.ngayNhan) DESC")
    List<Object[]> thongKeQuyenGopTheoThang(@Param("statuses") Collection<TrangThaiTaiTro> statuses);

    long countByTrangThaiIn(Collection<TrangThaiTaiTro> statuses);
}
