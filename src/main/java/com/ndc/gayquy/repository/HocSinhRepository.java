package com.ndc.gayquy.repository;

import com.ndc.gayquy.entity.HocSinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HocSinhRepository extends JpaRepository<HocSinh, Long> {
    List<HocSinh> findByPhuHuynh_MaNguoiDung(Long maPhuHuynh);
    List<HocSinh> findByPhuHuynh_MaNguoiDungOrderByMaHocSinhAsc(Long maPhuHuynh);
    List<HocSinh> findByLop(String lop);
}
