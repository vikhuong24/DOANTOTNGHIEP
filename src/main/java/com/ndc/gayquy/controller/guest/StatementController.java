package com.ndc.gayquy.controller.guest;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.guest.PageCustomResponse;
import com.ndc.gayquy.dto.guest.StatementResponse;
import com.ndc.gayquy.service.guest.StatementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/guest/statements")
@RequiredArgsConstructor
@Tag(name = "Guest", description = "Các API dành cho Khách vãng lai (Đăng ký, Đăng nhập, Bài đăng gây quỹ, Sao kê, Học sinh)")
public class StatementController {

    private final StatementService statementService;

    @Operation(summary = "Lấy danh sách sao kê công khai (các khoản đóng góp đã nhận)",
            description = "Tra cứu danh sách sao kê minh bạch của toàn trường hoặc lọc theo từng bài gây quỹ cụ thể.")
    @GetMapping
    public ApiResponse<PageCustomResponse<StatementResponse>> layDanhSachSaoKe(
            @RequestParam(required = false) Long maBaiTaiTro,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageCustomResponse<StatementResponse> response = statementService.layDanhSachSaoKe(maBaiTaiTro, page, size);
        return ApiResponse.success(response);
    }
}
