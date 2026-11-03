package com.ndc.gayquy.service.principal;

import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
import com.ndc.gayquy.dto.principal.FinancialReportResponse;
import com.ndc.gayquy.dto.principal.MonthlyFinancialSummaryResponse;
import com.ndc.gayquy.repository.CTPhanBoRepository;
import com.ndc.gayquy.repository.TaiTroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Service("principalReportService")
@RequiredArgsConstructor
public class ReportService {

    private final TaiTroRepository taiTroRepository;
    private final CTPhanBoRepository ctPhanBoRepository;

    /**
     * Báo cáo tài chính tổng hợp:
     * - Tổng tiền quyên góp (TAITRO có trạng thái DANHAN)
     * - Tổng tiền giải ngân (CT_PHANBO)
     * - Số dư quỹ còn lại
     * - Thống kê chi tiết theo tháng (sử dụng câu lệnh Query GROUP BY trong Repository)
     */
    @Transactional(readOnly = true)
    public FinancialReportResponse getFinancialReport() {
        log.info("Hiệu trưởng xem báo cáo tài chính tổng hợp");

        List<TrangThaiTaiTro> receivedStatuses = List.of(
                TrangThaiTaiTro.DANHAN
        );

        // 1. Tổng tiền quyên góp
        BigDecimal tongTienQuyenGop = taiTroRepository.tinhTongTienQuyenGop(receivedStatuses);
        if (tongTienQuyenGop == null) {
            tongTienQuyenGop = BigDecimal.ZERO;
        }

        // 2. Tổng tiền giải ngân
        BigDecimal tongTienGiaiNgan = ctPhanBoRepository.tinhTongTienGiaiNgan();
        if (tongTienGiaiNgan == null) {
            tongTienGiaiNgan = BigDecimal.ZERO;
        }

        // 3. Số dư quỹ hiện tại
        BigDecimal soDuQuyHienTai = tongTienQuyenGop.subtract(tongTienGiaiNgan);

        // 4. Các chỉ số phụ
        long tongSoLuotQuyenGop = taiTroRepository.countByTrangThaiIn(receivedStatuses);
        long tongSoHocSinhNhanHoTro = ctPhanBoRepository.countDistinctHocSinhNhanHoTro();

        // 5. Thống kê theo tháng dùng query GROUP BY
        List<Object[]> rawDonations = taiTroRepository.thongKeQuyenGopTheoThang(receivedStatuses);
        List<Object[]> rawDisbursements = ctPhanBoRepository.thongKeGiaiNganTheoThang();

        // Ghép kết quả theo từng tháng (key: YYYY-MM sắp xếp giảm dần)
        Map<String, MonthlyFinancialSummaryResponse> monthlyMap = new TreeMap<>(Comparator.reverseOrder());

        // Duyệt kết quả quyên góp theo tháng
        for (Object[] row : rawDonations) {
            if (row[0] != null && row[1] != null) {
                int nam = ((Number) row[0]).intValue();
                int thang = ((Number) row[1]).intValue();
                BigDecimal soTien = (row[2] != null) ? (BigDecimal) row[2] : BigDecimal.ZERO;

                String key = String.format("%04d-%02d", nam, thang);
                MonthlyFinancialSummaryResponse item = monthlyMap.computeIfAbsent(key, k -> MonthlyFinancialSummaryResponse.builder()
                        .nam(nam)
                        .thang(thang)
                        .thangNam(String.format("%02d/%04d", thang, nam))
                        .tongTienQuyenGop(BigDecimal.ZERO)
                        .tongTienGiaiNgan(BigDecimal.ZERO)
                        .chenhLech(BigDecimal.ZERO)
                        .build());
                item.setTongTienQuyenGop(soTien);
            }
        }

        // Duyệt kết quả giải ngân theo tháng
        for (Object[] row : rawDisbursements) {
            if (row[0] != null && row[1] != null) {
                int nam = ((Number) row[0]).intValue();
                int thang = ((Number) row[1]).intValue();
                BigDecimal soTien = (row[2] != null) ? (BigDecimal) row[2] : BigDecimal.ZERO;

                String key = String.format("%04d-%02d", nam, thang);
                MonthlyFinancialSummaryResponse item = monthlyMap.computeIfAbsent(key, k -> MonthlyFinancialSummaryResponse.builder()
                        .nam(nam)
                        .thang(thang)
                        .thangNam(String.format("%02d/%04d", thang, nam))
                        .tongTienQuyenGop(BigDecimal.ZERO)
                        .tongTienGiaiNgan(BigDecimal.ZERO)
                        .chenhLech(BigDecimal.ZERO)
                        .build());
                item.setTongTienGiaiNgan(soTien);
            }
        }

        // Tính chênh lệch từng tháng (Quyên góp - Giải ngân)
        List<MonthlyFinancialSummaryResponse> monthlyList = new ArrayList<>();
        for (MonthlyFinancialSummaryResponse item : monthlyMap.values()) {
            BigDecimal chenhLech = item.getTongTienQuyenGop().subtract(item.getTongTienGiaiNgan());
            item.setChenhLech(chenhLech);
            monthlyList.add(item);
        }

        return FinancialReportResponse.builder()
                .tongTienQuyenGop(tongTienQuyenGop)
                .tongTienGiaiNgan(tongTienGiaiNgan)
                .soDuQuyHienTai(soDuQuyHienTai)
                .tongSoLuotQuyenGop(tongSoLuotQuyenGop)
                .tongSoHocSinhNhanHoTro(tongSoHocSinhNhanHoTro)
                .thongKeTheoThang(monthlyList)
                .build();
    }
}
