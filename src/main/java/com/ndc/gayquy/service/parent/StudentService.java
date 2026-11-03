package com.ndc.gayquy.service.parent;

import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.parent.StudentResponse;
import com.ndc.gayquy.dto.parent.StudentSupportHistoryResponse;
import com.ndc.gayquy.entity.CTPhanBo;
import com.ndc.gayquy.entity.DotPhanBo;
import com.ndc.gayquy.entity.HocSinh;
import com.ndc.gayquy.entity.TTTaiTro;
import com.ndc.gayquy.repository.CTPhanBoRepository;
import com.ndc.gayquy.repository.HocSinhRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service("parentStudentService")
@RequiredArgsConstructor
public class StudentService {

    private final HocSinhRepository hocSinhRepository;
    private final CTPhanBoRepository ctPhanBoRepository;

    /**
     * 1. GET /api/parent/students
     * Lấy danh sách các con của phụ huynh đang đăng nhập.
     */
    @Transactional(readOnly = true)
    public List<StudentResponse> getMyStudents(Long parentId) {
        log.info("Phụ huynh #{} tra cứu danh sách con", parentId);
        List<HocSinh> students = hocSinhRepository.findByPhuHuynh_MaNguoiDungOrderByMaHocSinhAsc(parentId);

        return students.stream()
                .map(this::mapToStudentResponse)
                .collect(Collectors.toList());
    }

    /**
     * 2. GET /api/parent/students/{mahocsinh}/history
     * Lịch sử nhận hỗ trợ của con (từ CT_PHANBO).
     * Phải kiểm tra quyền sở hữu: Phụ huynh chỉ được xem dữ liệu của con mình.
     */
    @Transactional(readOnly = true)
    public List<StudentSupportHistoryResponse> getStudentHistory(Long parentId, Long maHocSinh) {
        log.info("Phụ huynh #{} xem lịch sử hỗ trợ của học sinh #{}", parentId, maHocSinh);

        // Kiểm tra học sinh tồn tại và thuộc quyền sở hữu của phụ huynh này
        validateStudentOwnership(parentId, maHocSinh);

        // Lấy danh sách chi tiết phân bổ của học sinh
        List<CTPhanBo> historyList = ctPhanBoRepository.findByHocSinh_MaHocSinhOrderByNgayNhanDesc(maHocSinh);

        return historyList.stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Kiểm tra quyền sở hữu học sinh của phụ huynh đang đăng nhập
     */
    @Transactional(readOnly = true)
    public HocSinh validateStudentOwnership(Long parentId, Long maHocSinh) {
        HocSinh hocSinh = hocSinhRepository.findById(maHocSinh)
                .orElseThrow(() -> new AppException(ErrorCode.HOC_SINH_NOT_FOUND, "Không tìm thấy học sinh với mã: " + maHocSinh));

        if (hocSinh.getPhuHuynh() == null || !hocSinh.getPhuHuynh().getMaNguoiDung().equals(parentId)) {
            log.warn("Cảnh báo bảo mật: Phụ huynh #{} cố ý truy cập trái phép hồ sơ học sinh #{}!", parentId, maHocSinh);
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn không có quyền truy cập dữ liệu của học sinh này (không phải con của bạn)!");
        }

        return hocSinh;
    }

    private StudentResponse mapToStudentResponse(HocSinh h) {
        return StudentResponse.builder()
                .maHocSinh(h.getMaHocSinh())
                .hoTen(h.getHoTen())
                .ngaySinh(h.getNgaySinh())
                .gioiTinh(h.getGioiTinh())
                .lop(h.getLop())
                .loaiHoTro(h.getLoaiHoTro())
                .moTa(h.getMoTa())
                .build();
    }

    private StudentSupportHistoryResponse mapToHistoryResponse(CTPhanBo ct) {
        DotPhanBo dot = ct.getDotPhanBo();
        TTTaiTro baiTaiTro = (dot != null) ? dot.getBaiTaiTro() : null;

        return StudentSupportHistoryResponse.builder()
                .maChiTietPhanBo(ct.getMaChiTietPhanBo())
                .maDotPhanBo(dot != null ? dot.getMaDotPhanBo() : null)
                .tenDotPhanBo(dot != null ? dot.getTenDot() : null)
                .maBaiTaiTro(baiTaiTro != null ? baiTaiTro.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(baiTaiTro != null ? baiTaiTro.getTieuDe() : null)
                .soTien(ct.getSoTien())
                .nguoiNhan(ct.getNguoiNhan())
                .ngayNhan(ct.getNgayNhan())
                .ghiChu(ct.getGhiChu())
                .trangThaiDotPhanBo(dot != null ? dot.getTrangThai() : null)
                .ngayTrao(dot != null ? dot.getNgayTrao() : null)
                .build();
    }
}
