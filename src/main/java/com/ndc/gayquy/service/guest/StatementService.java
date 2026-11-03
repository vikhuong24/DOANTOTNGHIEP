package com.ndc.gayquy.service.guest;

import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
import com.ndc.gayquy.dto.guest.PageCustomResponse;
import com.ndc.gayquy.dto.guest.StatementResponse;
import com.ndc.gayquy.entity.TaiTro;
import com.ndc.gayquy.repository.TaiTroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatementService {

    private final TaiTroRepository taiTroRepository;

    /**
     * Sao kê công khai các khoản tiền tài trợ đã tiếp nhận thành công (trangthai = 'DaNhan' hoặc 'THANH_CONG')
     */
    @Transactional(readOnly = true)
    public PageCustomResponse<StatementResponse> layDanhSachSaoKe(Long maBaiTaiTro, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        List<TrangThaiTaiTro> receivedStatuses = Arrays.asList(
                TrangThaiTaiTro.DaNhan,
                TrangThaiTaiTro.THANH_CONG
        );

        Page<TaiTro> pageResult = taiTroRepository.findPublicStatements(receivedStatuses, maBaiTaiTro, pageable);

        Page<StatementResponse> mappedPage = pageResult.map(t -> StatementResponse.builder()
                .maTaiTro(t.getMaTaiTro())
                .maBaiTaiTro(t.getBaiTaiTro() != null ? t.getBaiTaiTro().getMaBaiTaiTro() : null)
                .tieuDeBaiTaiTro(t.getBaiTaiTro() != null ? t.getBaiTaiTro().getTieuDe() : null)
                .tenHienThi(t.getTenHienThi() != null && !t.getTenHienThi().isBlank() ? t.getTenHienThi() : "Nhà hảo tâm ẩn danh")
                .soTienTt(t.getSoTienTt())
                .ngayNhan(t.getNgayNhan())
                .ghiChu(t.getGhiChu())
                .build());

        return PageCustomResponse.from(mappedPage);
    }
}
