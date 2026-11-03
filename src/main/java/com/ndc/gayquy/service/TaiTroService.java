package com.ndc.gayquy.service;

import com.ndc.gayquy.dto.request.XacNhanTaiTroRequest;
import com.ndc.gayquy.dto.response.TaiTroResponse;

import java.util.List;

public interface TaiTroService {

    /**
     * Xác nhận đóng góp tài trợ: cập nhật trạng thái DANHAN
     * và cộng dồn số tiền thực tế vào tongtiendanhan của bảng TT_TAITRO
     *
     * @param maTaiTro Mã đóng góp
     * @param maCanBo Mã cán bộ xử lý xác nhận
     * @param request Dữ liệu xác nhận (số tiền thực tế, ghi chú)
     * @return Thông tin tài trợ sau khi cập nhật
     */
    TaiTroResponse xacNhanTaiTro(Long maTaiTro, Long maCanBo, XacNhanTaiTroRequest request);

    TaiTroResponse layChiTietTaiTro(Long maTaiTro);

    List<TaiTroResponse> layDanhSachTheoBaiTaiTro(Long maBaiTaiTro);
}
