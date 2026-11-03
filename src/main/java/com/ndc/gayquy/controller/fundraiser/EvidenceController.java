package com.ndc.gayquy.controller.fundraiser;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.fundraiser.FundraiserEvidenceResponse;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.fundraiser.EvidenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController("fundraiserEvidenceController")
@RequestMapping("/fundraiser/evidences")
@RequiredArgsConstructor
@Tag(name = "Fundraiser", description = "Các API dành cho Cán bộ quản lý gây quỹ (Bài đăng, Duyệt đề xuất & xác nhận tiền, Phân bổ, Minh chứng, Phản hồi)")
public class EvidenceController {

    private final EvidenceService evidenceService;

    @Operation(summary = "Upload tệp minh chứng bằng MultipartFile",
            description = "Tải lên tệp tài liệu thực tế (hình ảnh trao quà, biên bản ký nhận, hóa đơn...), lưu file vật lý vào thư mục uploads/ và lưu bản ghi vào bảng MINHCHUNG.")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FundraiserEvidenceResponse> uploadEvidence(
            @Parameter(description = "Tệp minh chứng đính kèm (hình ảnh, hóa đơn, chứng từ...)", required = true)
            @RequestPart(value = "file") MultipartFile file,

            @Parameter(description = "Mã bài đăng gây quỹ liên quan (nếu có)", example = "2")
            @RequestParam(value = "mabaitaitro", required = false) Long mabaitaitro,

            @Parameter(description = "Mã đợt phân bổ liên quan (nếu có)", example = "1")
            @RequestParam(value = "madotphanbo", required = false) Long madotphanbo,

            @Parameter(description = "Loại minh chứng (HoaDon, HinhAnh, BienBan, PhieuThu, Khac...)", example = "HoaDon")
            @RequestParam(value = "loaitailieu", required = false) String loaitailieu,

            @Parameter(description = "Mô tả nội dung tài liệu minh chứng", example = "Hóa đơn mua thiết bị trợ thính")
            @RequestParam(value = "mota", required = false) String mota
    ) {
        Long canBoId = SecurityUtils.getCurrentUserId();
        FundraiserEvidenceResponse response = evidenceService.uploadEvidence(
                canBoId, file, mabaitaitro, madotphanbo, loaitailieu, mota
        );
        return ApiResponse.success("Upload và lưu minh chứng thành công", response);
    }

    @Operation(summary = "Xem danh sách tài liệu minh chứng",
            description = "Tra cứu các tài liệu minh chứng theo bài tài trợ hoặc đợt phân bổ.")
    @GetMapping
    public ApiResponse<List<FundraiserEvidenceResponse>> getEvidences(
            @Parameter(description = "Lọc theo mã bài tài trợ", example = "2")
            @RequestParam(value = "mabaitaitro", required = false) Long mabaitaitro,

            @Parameter(description = "Lọc theo mã đợt phân bổ", example = "1")
            @RequestParam(value = "madotphanbo", required = false) Long madotphanbo
    ) {
        List<FundraiserEvidenceResponse> response = evidenceService.getEvidences(mabaitaitro, madotphanbo);
        return ApiResponse.success(response);
    }
}
