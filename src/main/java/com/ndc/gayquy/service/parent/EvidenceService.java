package com.ndc.gayquy.service.parent;

import com.ndc.gayquy.dto.parent.StudentEvidenceResponse;
import com.ndc.gayquy.entity.CTPhanBo;
import com.ndc.gayquy.entity.DotPhanBo;
import com.ndc.gayquy.entity.MinhChung;
import com.ndc.gayquy.entity.TTTaiTro;
import com.ndc.gayquy.repository.CTPhanBoRepository;
import com.ndc.gayquy.repository.MinhChungRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service("parentEvidenceService")
@RequiredArgsConstructor
public class EvidenceService {

    private final StudentService studentService;
    private final CTPhanBoRepository ctPhanBoRepository;
    private final MinhChungRepository minhChungRepository;

    /**
     * 3. GET /api/parent/students/{mahocsinh}/evidences
     * Minh chứng trao tặng cho học sinh (biên bản, hình ảnh lễ trao, hóa đơn,... từ các đợt phân bổ mà học sinh được nhận).
     */
    @Transactional(readOnly = true)
    public List<StudentEvidenceResponse> getStudentEvidences(Long parentId, Long maHocSinh) {
        log.info("Phụ huynh #{} xem tài liệu minh chứng của học sinh #{}", parentId, maHocSinh);

        // 1. Kiểm tra quyền sở hữu của phụ huynh đối với học sinh
        studentService.validateStudentOwnership(parentId, maHocSinh);

        // 2. Lấy danh sách đợt phân bổ học sinh đã nhận hỗ trợ
        List<CTPhanBo> allocations = ctPhanBoRepository.findByHocSinh_MaHocSinh(maHocSinh);
        if (allocations.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> dotPhanBoIds = allocations.stream()
                .map(ct -> ct.getDotPhanBo() != null ? ct.getDotPhanBo().getMaDotPhanBo() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (dotPhanBoIds.isEmpty()) {
            return Collections.emptyList();
        }

        // 3. Tìm các tài liệu minh chứng thuộc các đợt phân bổ này
        List<MinhChung> minhChungList = minhChungRepository.findByDotPhanBo_MaDotPhanBoInOrderByNgayTaiLenDesc(dotPhanBoIds);

        return minhChungList.stream()
                .map(this::mapToEvidenceResponse)
                .collect(Collectors.toList());
    }

    private StudentEvidenceResponse mapToEvidenceResponse(MinhChung mc) {
        DotPhanBo dot = mc.getDotPhanBo();
        TTTaiTro baiTaiTro = mc.getBaiTaiTro();
        if (baiTaiTro == null && dot != null) {
            baiTaiTro = dot.getBaiTaiTro();
        }

        return StudentEvidenceResponse.builder()
                .maMinhChung(mc.getMaMinhChung())
                .maDotPhanBo(dot != null ? dot.getMaDotPhanBo() : null)
                .tenDotPhanBo(dot != null ? dot.getTenDot() : null)
                .maBaiTaiTro(baiTaiTro != null ? baiTaiTro.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(baiTaiTro != null ? baiTaiTro.getTieuDe() : null)
                .loaiTaiLieu(mc.getLoaiTaiLieu())
                .duongDanTep(mc.getDuongDanTep())
                .moTa(mc.getMoTa())
                .ngayTaiLen(mc.getNgayTaiLen())
                .nguoiDang(mc.getNguoiDung() != null ? mc.getNguoiDung().getHoTen() : null)
                .build();
    }
}
