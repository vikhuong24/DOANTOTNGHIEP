package com.ndc.gayquy.repository;

import com.ndc.gayquy.common.enums.TrangThaiBaiDang;
import com.ndc.gayquy.entity.TTTaiTro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Repository
public interface TTTaiTroRepository extends JpaRepository<TTTaiTro, Long> {

    List<TTTaiTro> findByTrangThai(TrangThaiBaiDang trangThai);

    List<TTTaiTro> findByTrangThaiInOrderByMaBaiTaiTroDesc(Collection<TrangThaiBaiDang> statuses);

    List<TTTaiTro> findByCanBo_MaNguoiDung(Long maCanBo);

    List<TTTaiTro> findByCanBo_MaNguoiDungOrderByMaBaiTaiTroDesc(Long maCanBo);

    @Query("SELECT t FROM TTTaiTro t WHERE t.trangThai IN (:statuses) AND (:keyword IS NULL OR LOWER(t.tieuDe) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<TTTaiTro> findActiveCampaigns(@Param("statuses") Collection<TrangThaiBaiDang> statuses, @Param("keyword") String keyword, Pageable pageable);

    /**
     * Cộng dồn số tiền vào tongtiendanhan của bài tài trợ tương ứng.
     * Sử dụng @Modifying và @Query để cập nhật trực tiếp trong DB đảm bảo tính toàn vẹn dữ liệu.
     */
    @Modifying
    @Query("UPDATE TTTaiTro t SET t.tongTienDaNhan = COALESCE(t.tongTienDaNhan, 0) + :soTien WHERE t.maBaiTaiTro = :maBaiTaiTro")
    int congDonTongTienDaNhan(@Param("maBaiTaiTro") Long maBaiTaiTro, @Param("soTien") BigDecimal soTien);
}
