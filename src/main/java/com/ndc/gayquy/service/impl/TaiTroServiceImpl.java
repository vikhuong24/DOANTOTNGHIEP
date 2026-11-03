package com.ndc.gayquy.service.impl;

import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.request.XacNhanTaiTroRequest;
import com.ndc.gayquy.dto.response.TaiTroResponse;
import com.ndc.gayquy.entity.NguoiDung;
import com.ndc.gayquy.entity.TaiTro;
import com.ndc.gayquy.entity.TTTaiTro;
import com.ndc.gayquy.repository.NguoiDungRepository;
import com.ndc.gayquy.repository.TaiTroRepository;
import com.ndc.gayquy.repository.TTTaiTroRepository;
import com.ndc.gayquy.service.TaiTroService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaiTroServiceImpl implements TaiTroService {

    private final TaiTroRepository taiTroRepository;
    private final TTTaiTroRepository ttTaiTroRepository;
    private final NguoiDungRepository nguoiDungRepository;

    /**
     * Xác nhận thông tin đóng góp tài trợ (Cập nhật trạng thái TAITRO thành công).
     * Dùng @Transactional và câu lệnh @Modifying @Query để cộng dồn số tiền vào
     * cột tongtiendanhan của bảng TT_TAITRO tương ứng, đảm bảo tính toàn vẹn dữ liệu.
     */
    @Override
    @Transactional
    public TaiTroResponse xacNhanTaiTro(Long maTaiTro, Long maCanBo, XacNhanTaiTroRequest request) {
        log.info("Bắt đầu xác nhận đóng góp tài trợ #{} bởi cán bộ #{}", maTaiTro, maCanBo);

        // 1. Tìm thông tin bản ghi đóng góp
        TaiTro taiTro = taiTroRepository.findById(maTaiTro)
                .orElseThrow(() -> new AppException(ErrorCode.TAI_TRO_NOT_FOUND));

        // Kiểm tra nếu đã xác nhận trước đó
        if (taiTro.getTrangThai() == TrangThaiTaiTro.THANH_CONG) {
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION, "Đóng góp này đã được xác nhận thành công trước đó!");
        }

        // 2. Tìm thông tin cán bộ xác nhận
        NguoiDung canBo = nguoiDungRepository.findById(maCanBo)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        BigDecimal soTienThucTe = request.getSoTienThucTe();
        if (soTienThucTe == null || soTienThucTe.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_AMOUNT);
        }

        // 3. Cập nhật bản ghi đóng góp sang trạng thái THANH_CONG
        taiTro.setTrangThai(TrangThaiTaiTro.THANH_CONG);
        taiTro.setSoTienTt(soTienThucTe);
        taiTro.setCanBo(canBo);
        taiTro.setNgayNhan(LocalDateTime.now());
        if (request.getGhiChu() != null && !request.getGhiChu().isBlank()) {
            String ghiChuMoi = (taiTro.getGhiChu() != null ? taiTro.getGhiChu() + " | " : "") + request.getGhiChu();
            taiTro.setGhiChu(ghiChuMoi);
        }
        taiTroRepository.save(taiTro);

        // 4. Cộng dồn số tiền vào tongtiendanhan của TT_TAITRO thông qua @Modifying @Query
        Long maBaiTaiTro = taiTro.getBaiTaiTro().getMaBaiTaiTro();
        int affectedRows = ttTaiTroRepository.congDonTongTienDaNhan(maBaiTaiTro, soTienThucTe);
        if (affectedRows == 0) {
            throw new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND, "Không tìm thấy bài tài trợ để cộng dồn số tiền!");
        }

        log.info("Đã cộng dồn {} VNĐ vào tổng tiền đã nhận của bài tài trợ #{}", soTienThucTe, maBaiTaiTro);

        return mapToResponse(taiTro);
    }

    @Override
    @Transactional(readOnly = true)
    public TaiTroResponse layChiTietTaiTro(Long maTaiTro) {
        TaiTro taiTro = taiTroRepository.findById(maTaiTro)
                .orElseThrow(() -> new AppException(ErrorCode.TAI_TRO_NOT_FOUND));
        return mapToResponse(taiTro);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaiTroResponse> layDanhSachTheoBaiTaiTro(Long maBaiTaiTro) {
        return taiTroRepository.findByBaiTaiTro_MaBaiTaiTro(maBaiTaiTro).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TaiTroResponse mapToResponse(TaiTro entity) {
        TTTaiTro bai = entity.getBaiTaiTro();
        NguoiDung user = entity.getNguoiDung();
        NguoiDung canBo = entity.getCanBo();

        return TaiTroResponse.builder()
                .maTaiTro(entity.getMaTaiTro())
                .maBaiTaiTro(bai != null ? bai.getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(bai != null ? bai.getTieuDe() : null)
                .maNguoiDung(user != null ? user.getMaNguoiDung() : null)
                .tenNguoiDung(user != null ? user.getHoTen() : null)
                .tenHienThi(entity.getTenHienThi())
                .soTienDk(entity.getSoTienDk())
                .soTienTt(entity.getSoTienTt())
                .anhGiaoDich(entity.getAnhGiaoDich())
                .trangThai(entity.getTrangThai())
                .maCanBoXacNhan(canBo != null ? canBo.getMaNguoiDung() : null)
                .tenCanBoXacNhan(canBo != null ? canBo.getHoTen() : null)
                .ghiChu(entity.getGhiChu())
                .ngayGui(entity.getNgayGui())
                .ngayNhan(entity.getNgayNhan())
                .build();
    }
}
