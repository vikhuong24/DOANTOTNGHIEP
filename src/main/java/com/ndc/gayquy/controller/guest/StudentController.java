package com.ndc.gayquy.controller.guest;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.guest.PageCustomResponse;
import com.ndc.gayquy.dto.guest.StudentSummaryResponse;
import com.ndc.gayquy.service.guest.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/guest/students")
@RequiredArgsConstructor
@Tag(name = "Guest", description = "Các API dành cho Khách vãng lai (Đăng ký, Đăng nhập, Bài đăng gây quỹ, Sao kê, Học sinh)")
public class StudentController {

    private final StudentService studentService;

    @Operation(summary = "Xem danh sách học sinh cần hỗ trợ (ẩn danh thông tin nhạy cảm)",
            description = "Hiển thị danh sách học sinh chuyên biệt để nhà hảo tâm tham khảo hoàn cảnh khó khăn.")
    @GetMapping
    public ApiResponse<PageCustomResponse<StudentSummaryResponse>> layDanhSachHocSinh(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        PageCustomResponse<StudentSummaryResponse> response = studentService.layDanhSachHocSinh(page, size);
        return ApiResponse.success(response);
    }
}
