package com.ndc.gayquy.repository;

import com.ndc.gayquy.common.enums.TrangThaiDeXuat;
import com.ndc.gayquy.entity.DeXuatTaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DeXuatTaiTroRepository extends JpaRepository<DeXuatTaiTro, Long> {

    List<DeXuatTaiTro> findByNguoiDung_MaNguoiDung(Long maNguoiDung);

    List<DeXuatTaiTro> findByTrangThai(TrangThaiDeXuat trangThai);

    List<DeXuatTaiTro> findByTrangThaiInOrderByNgayGuiDesc(Collection<TrangThaiDeXuat> statuses);

    List<DeXuatTaiTro> findByBaiTaiTro_MaBaiTaiTro(Long maBaiTaiTro);
}
