package com.ndc.gayquy.service.donor;

import com.ndc.gayquy.common.enums.TrangThaiBaiTaiTro;
import com.ndc.gayquy.common.enums.TrangThaiDeXuat;
import com.ndc.gayquy.common.enums.TrangThaiTaiTro;
import com.ndc.gayquy.common.exception.AppException;
import com.ndc.gayquy.common.exception.ErrorCode;
import com.ndc.gayquy.dto.donor.*;
import com.ndc.gayquy.entity.*;
import com.ndc.gayquy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DonationService {

    private final TaiTroRepository taiTroRepository;
    private final DeXuatTaiTroRepository deXuatTaiTroRepository;
    private final TTTaiTroRepository ttTaiTroRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final MinhChungRepository minhChungRepository;

    /**
     * 2. POST /api/donor/donations/register
     * Tạo TAITRO (trangthai = 'ChoDuyet' / 'CHO_XAC_NHAN').
     * Input: mabaitaitro, tenhienthi, soitendk, anhgiaodich, ghichu.
     */
    @Transactional
    public Long registerDonation(Long userId, DonationRegisterRequest request) {
        NguoiDung donor = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        TTTaiTro campaign = ttTaiTroRepository.findById(request.getMaBaiTaiTro())
                .orElseThrow(() -> new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND));

        String tenHienThi = donor.getHoTen();
        if (request.getTenHienThi() != null && !request.getTenHienThi().trim().isEmpty() && !request.getTenHienThi().trim().equalsIgnoreCase("string")) {
            tenHienThi = request.getTenHienThi().trim();
        }

        String anhGiaoDich = (request.getAnhGiaoDich() != null && !request.getAnhGiaoDich().trim().equalsIgnoreCase("string"))
                ? request.getAnhGiaoDich().trim() : null;
        String ghiChu = (request.getGhiChu() != null && !request.getGhiChu().trim().equalsIgnoreCase("string"))
                ? request.getGhiChu().trim() : null;

        TaiTro taiTro = TaiTro.builder()
                .nguoiDung(donor)
                .baiTaiTro(campaign)
                .tenHienThi(tenHienThi)
                .soTienDk(request.getSoTienDk())
                .soTienTt(BigDecimal.ZERO)
                .anhGiaoDich(anhGiaoDich)
                .trangThai(TrangThaiTaiTro.ChoDuyet)
                .ghiChu(ghiChu)
                .ngayGui(LocalDateTime.now())
                .build();

        TaiTro saved = taiTroRepository.save(taiTro);
        log.info("Nhà hảo tâm #{} đã đăng ký ủng hộ {} VNĐ cho bài gây quỹ #{}",
                userId, request.getSoTienDk(), campaign.getMaBaiTaiTro());
        return saved.getMaTaiTro();
    }

    /**
     * 3. POST /api/donor/donations/propose
     * Tạo DEXUATTAITRO (trangthai = 'ChoDuyet' / 'CHO_DUYET').
     * Input: mabaitaitro, tieude, soitendx, mucdichsd.
     */
    @Transactional
    public Long proposeDonation(Long userId, DonationProposeRequest request) {
        NguoiDung donor = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        TTTaiTro campaign = null;
        if (request.getMaBaiTaiTro() != null) {
            campaign = ttTaiTroRepository.findById(request.getMaBaiTaiTro())
                    .orElseThrow(() -> new AppException(ErrorCode.BAI_TAI_TRO_NOT_FOUND));
        }

        DeXuatTaiTro deXuat = DeXuatTaiTro.builder()
                .nguoiDung(donor)
                .baiTaiTro(campaign)
                .tieuDe(request.getTieuDe().trim())
                .soTienDx(request.getSoTienDx())
                .mucDichSd(request.getMucDichSd().trim())
                .trangThai(TrangThaiDeXuat.ChoDuyet)
                .ngayGui(LocalDateTime.now())
                .build();

        DeXuatTaiTro saved = deXuatTaiTroRepository.save(deXuat);
        log.info("Nhà hảo tâm #{} đã gửi đề xuất tài trợ #{} số tiền {}",
                userId, saved.getMaDeXuat(), request.getSoTienDx());
        return saved.getMaDeXuat();
    }

    /**
     * 4. GET /api/donor/campaigns/progress
     * Danh sách bài đăng đã ủng hộ + tiến độ bài đăng + minh chứng.
     */
    @Transactional(readOnly = true)
    public List<CampaignProgressResponse> getCampaignsProgress(Long userId) {
        List<TaiTro> donorDonations = taiTroRepository.findByNguoiDung_MaNguoiDung(userId);

        // Nhóm các lượt ủng hộ theo bài tài trợ
        Map<TTTaiTro, List<TaiTro>> campaignMap = donorDonations.stream()
                .filter(t -> t.getBaiTaiTro() != null)
                .collect(Collectors.groupingBy(TaiTro::getBaiTaiTro));

        List<CampaignProgressResponse> result = new ArrayList<>();

        for (Map.Entry<TTTaiTro, List<TaiTro>> entry : campaignMap.entrySet()) {
            TTTaiTro campaign = entry.getKey();
            List<TaiTro> donations = entry.getValue();

            // Tính tổng tiền donor này đã đóng góp thành công cho chiến dịch này
            BigDecimal totalDonatedByMe = donations.stream()
                    .filter(t -> t.getTrangThai() == TrangThaiTaiTro.THANH_CONG || t.getTrangThai() == TrangThaiTaiTro.DaNhan)
                    .map(TaiTro::getSoTienTt)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Tính % hoàn thành của bài tài trợ
            BigDecimal mucTieu = campaign.getMucTieu() != null ? campaign.getMucTieu() : BigDecimal.ZERO;
            BigDecimal daNhan = campaign.getTongTienDaNhan() != null ? campaign.getTongTienDaNhan() : BigDecimal.ZERO;
            double percent = 0.0;
            if (mucTieu.compareTo(BigDecimal.ZERO) > 0) {
                percent = daNhan.divide(mucTieu, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
            }

            // Lấy danh sách minh chứng của bài đăng
            List<MinhChung> minhChungs = minhChungRepository.findByBaiTaiTro_MaBaiTaiTro(campaign.getMaBaiTaiTro());
            List<MinhChungItemResponse> minhChungDtos = minhChungs.stream()
                    .map(m -> MinhChungItemResponse.builder()
                            .maMinhChung(m.getMaMinhChung())
                            .loaiTaiLieu(m.getLoaiTaiLieu())
                            .duongDanTep(m.getDuongDanTep())
                            .moTa(m.getMoTa())
                            .ngayTaiLen(m.getNgayTaiLen())
                            .build())
                    .collect(Collectors.toList());

            result.add(CampaignProgressResponse.builder()
                    .maBaiTaiTro(campaign.getMaBaiTaiTro())
                    .tieuDe(campaign.getTieuDe())
                    .anhBia(campaign.getAnhBia())
                    .mucTieu(campaign.getMucTieu())
                    .tongTienDaNhan(campaign.getTongTienDaNhan())
                    .phanTramHoanThanh(percent)
                    .trangThai(campaign.getTrangThai())
                    .tongTienToiDaDongGop(totalDonatedByMe)
                    .danhSachMinhChung(minhChungDtos)
                    .build());
        }

        return result;
    }

    /**
     * 5. GET /api/donor/donations/history
     * Lịch sử đóng góp (từ TAITRO và DEXUATTAITRO).
     */
    @Transactional(readOnly = true)
    public DonationHistoryResponse getDonationHistory(Long userId) {
        List<TaiTro> taiTros = taiTroRepository.findByNguoiDung_MaNguoiDung(userId);
        List<DeXuatTaiTro> deXuats = deXuatTaiTroRepository.findByNguoiDung_MaNguoiDung(userId);

        BigDecimal tongTienThanhCong = taiTros.stream()
                .filter(t -> t.getTrangThai() == TrangThaiTaiTro.THANH_CONG || t.getTrangThai() == TrangThaiTaiTro.DaNhan)
                .map(TaiTro::getSoTienTt)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DonationHistoryResponse.TaiTroHistoryItem> taiTroItems = taiTros.stream()
                .map(t -> DonationHistoryResponse.TaiTroHistoryItem.builder()
                        .maTaiTro(t.getMaTaiTro())
                        .maBaiTaiTro(t.getBaiTaiTro() != null ? t.getBaiTaiTro().getMaBaiTaiTro() : null)
                        .tieuDeBaiTaiTro(t.getBaiTaiTro() != null ? t.getBaiTaiTro().getTieuDe() : null)
                        .tenHienThi(t.getTenHienThi())
                        .soTienDk(t.getSoTienDk())
                        .soTienTt(t.getSoTienTt())
                        .anhGiaoDich(t.getAnhGiaoDich())
                        .trangThai(t.getTrangThai())
                        .ghiChu(t.getGhiChu())
                        .ngayGui(t.getNgayGui())
                        .ngayNhan(t.getNgayNhan())
                        .build())
                .collect(Collectors.toList());

        List<DonationHistoryResponse.DeXuatHistoryItem> deXuatItems = deXuats.stream()
                .map(d -> DonationHistoryResponse.DeXuatHistoryItem.builder()
                        .maDeXuat(d.getMaDeXuat())
                        .maBaiTaiTro(d.getBaiTaiTro() != null ? d.getBaiTaiTro().getMaBaiTaiTro() : null)
                        .tieuDeBaiTaiTro(d.getBaiTaiTro() != null ? d.getBaiTaiTro().getTieuDe() : null)
                        .tieuDe(d.getTieuDe())
                        .soTienDx(d.getSoTienDx())
                        .mucDichSd(d.getMucDichSd())
                        .trangThai(d.getTrangThai())
                        .lyDoTuChoi(d.getLyDoTuChoi())
                        .ngayGui(d.getNgayGui())
                        .ngayXuLy(d.getNgayXuLy())
                        .build())
                .collect(Collectors.toList());

        return DonationHistoryResponse.builder()
                .tongTienDongGopThanhCong(tongTienThanhCong)
                .danhSachDongGop(taiTroItems)
                .danhSachDeXuat(deXuatItems)
                .build();
    }
}
