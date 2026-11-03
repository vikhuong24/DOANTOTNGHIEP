package com.ndc.gayquy.service.fundraiser;

import com.ndc.gayquy.common.enums.LoaiTaiLieu;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.fundraiser.FundraiserEvidenceResponse;
import com.ndc.gayquy.entity.DotPhanBo;
import com.ndc.gayquy.entity.MinhChung;
import com.ndc.gayquy.entity.NguoiDung;
import com.ndc.gayquy.entity.TTTaiTro;
import com.ndc.gayquy.repository.DotPhanBoRepository;
import com.ndc.gayquy.repository.MinhChungRepository;
import com.ndc.gayquy.repository.NguoiDungRepository;
import com.ndc.gayquy.repository.TTTaiTroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service("fundraiserEvidenceService")
@RequiredArgsConstructor
public class EvidenceService {

    private final MinhChungRepository minhChungRepository;
    private final TTTaiTroRepository ttTaiTroRepository;
    private final DotPhanBoRepository dotPhanBoRepository;
    private final NguoiDungRepository nguoiDungRepository;

    private static final String UPLOAD_DIR = "uploads";

    /**
     * Upload file minh chứng thực tế bằng MultipartFile và lưu bản ghi vào MINHCHUNG.
     */
    @Transactional
    public FundraiserEvidenceResponse uploadEvidence(
            Long canBoId,
            MultipartFile file,
            Long maBaiTaiTro,
            Long maDotPhanBo,
            String loaiTaiLieuStr,
            String moTa
    ) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_KEY, "Vui lòng chọn tệp tin minh chứng đính kèm (file)!");
        }

        NguoiDung canBo = nguoiDungRepository.findById(canBoId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // 1. Lưu file vật lý vào thư mục uploads/ ở thư mục gốc của dự án
        String duongDanTep;
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = StringUtils.cleanPath(
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf"
            );
            String uniqueFileName = UUID.randomUUID().toString().substring(0, 8) + "_" + originalFileName;
            Path destination = uploadPath.resolve(uniqueFileName);

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            duongDanTep = "/" + UPLOAD_DIR + "/" + uniqueFileName;
            log.info("Cán bộ #{} đã tải lên file minh chứng: {}", canBoId, destination.toAbsolutePath());
        } catch (IOException e) {
            log.error("Lỗi khi lưu file upload minh chứng: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Không thể lưu tệp minh chứng: " + e.getMessage());
        }

        // 2. Tra cứu bài tài trợ / đợt phân bổ liên quan
        TTTaiTro baiTaiTro = null;
        if (maBaiTaiTro != null) {
            baiTaiTro = ttTaiTroRepository.findById(maBaiTaiTro)
                    .orElseThrow(() -> new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND));
        }

        DotPhanBo dotPhanBo = null;
        if (maDotPhanBo != null) {
            dotPhanBo = dotPhanBoRepository.findById(maDotPhanBo)
                    .orElseThrow(() -> new AppException(ErrorCode.DOT_PHAN_BO_NOT_FOUND));
            if (baiTaiTro == null && dotPhanBo.getBaiTaiTro() != null) {
                baiTaiTro = dotPhanBo.getBaiTaiTro();
            }
        }

        // 3. Chuẩn hóa loại tài liệu minh chứng
        LoaiTaiLieu loai = LoaiTaiLieu.from(loaiTaiLieuStr);

        // 4. Tạo đối tượng MINHCHUNG lưu vào Database
        MinhChung minhChung = MinhChung.builder()
                .baiTaiTro(baiTaiTro)
                .dotPhanBo(dotPhanBo)
                .loaiTaiLieu(loai)
                .duongDanTep(duongDanTep)
                .moTa(moTa != null ? moTa.trim() : null)
                .ngayTaiLen(LocalDateTime.now())
                .nguoiDung(canBo)
                .build();

        MinhChung saved = minhChungRepository.save(minhChung);
        log.info("Đã lưu bản ghi MINHCHUNG #{} thành công với đường dẫn {}", saved.getMaMinhChung(), duongDanTep);

        return mapToEvidenceResponse(saved);
    }

    /**
     * Lấy danh sách tài liệu minh chứng (hỗ trợ lọc theo bài tài trợ hoặc đợt phân bổ)
     */
    @Transactional(readOnly = true)
    public List<FundraiserEvidenceResponse> getEvidences(Long maBaiTaiTro, Long maDotPhanBo) {
        List<MinhChung> list;
        if (maDotPhanBo != null) {
            list = minhChungRepository.findByDotPhanBo_MaDotPhanBo(maDotPhanBo);
        } else if (maBaiTaiTro != null) {
            list = minhChungRepository.findByBaiTaiTro_MaBaiTaiTro(maBaiTaiTro);
        } else {
            list = minhChungRepository.findAllByOrderByNgayTaiLenDesc();
        }

        return list.stream()
                .map(this::mapToEvidenceResponse)
                .collect(Collectors.toList());
    }

    private FundraiserEvidenceResponse mapToEvidenceResponse(MinhChung m) {
        TTTaiTro bai = m.getBaiTaiTro();
        DotPhanBo dot = m.getDotPhanBo();
        if (bai == null && dot != null) {
            bai = dot.getBaiTaiTro();
        }
        NguoiDung u = m.getNguoiDung();

        return FundraiserEvidenceResponse.builder()
                .maMinhChung(m.getMaMinhChung())
                .maBaiTaiTro(bai != null ? bai.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(bai != null ? bai.getTieuDe() : null)
                .maDotPhanBo(dot != null ? dot.getMaDotPhanBo() : null)
                .tenDotPhanBo(dot != null ? dot.getTenDot() : null)
                .loaiTaiLieu(m.getLoaiTaiLieu())
                .duongDanTep(m.getDuongDanTep())
                .moTa(m.getMoTa())
                .ngayTaiLen(m.getNgayTaiLen())
                .maNguoiDung(u != null ? u.getMaNguoiDung() : null)
                .tenNguoiDung(u != null ? u.getHoTen() : null)
                .build();
    }
}
