package com.ndc.gayquy.repository;

import com.ndc.gayquy.entity.CTPhanBo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CTPhanBoRepository extends JpaRepository<CTPhanBo, Long> {

    List<CTPhanBo> findByDotPhanBo_MaDotPhanBo(Long maDotPhanBo);

    List<CTPhanBo> findByHocSinh_MaHocSinh(Long maHocSinh);

    List<CTPhanBo> findByHocSinh_MaHocSinhOrderByNgayNhanDesc(Long maHocSinh);

    @Query("SELECT COALESCE(SUM(c.soTien), 0) FROM CTPhanBo c")
    BigDecimal tinhTongTienGiaiNgan();

    @Query("SELECT YEAR(COALESCE(c.ngayNhan, c.dotPhanBo.ngayTrao)), " +
           "MONTH(COALESCE(c.ngayNhan, c.dotPhanBo.ngayTrao)), " +
           "SUM(c.soTien) " +
           "FROM CTPhanBo c " +
           "WHERE (c.ngayNhan IS NOT NULL OR c.dotPhanBo.ngayTrao IS NOT NULL) " +
           "GROUP BY YEAR(COALESCE(c.ngayNhan, c.dotPhanBo.ngayTrao)), MONTH(COALESCE(c.ngayNhan, c.dotPhanBo.ngayTrao)) " +
           "ORDER BY YEAR(COALESCE(c.ngayNhan, c.dotPhanBo.ngayTrao)) DESC, MONTH(COALESCE(c.ngayNhan, c.dotPhanBo.ngayTrao)) DESC")
    List<Object[]> thongKeGiaiNganTheoThang();

    @Query("SELECT COUNT(DISTINCT c.hocSinh.maHocSinh) FROM CTPhanBo c")
    long countDistinctHocSinhNhanHoTro();
}
