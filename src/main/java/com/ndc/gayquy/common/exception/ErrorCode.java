package com.ndc.gayquy.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi không xác định từ hệ thống", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Thông điệp lỗi không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "Tên đăng nhập hoặc email đã tồn tại", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1003, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1004, "Chưa xác thực danh tính", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1005, "Bạn không có quyền thực hiện chức năng này", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1006, "Tên đăng nhập hoặc mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    BAI_TAI_TRO_NOT_FOUND(2001, "Bài tài trợ không tồn tại", HttpStatus.NOT_FOUND),
    TAI_TRO_NOT_FOUND(2002, "Thông tin đóng góp tài trợ không tồn tại", HttpStatus.NOT_FOUND),
    DOT_PHAN_BO_NOT_FOUND(2003, "Đợt phân bổ không tồn tại", HttpStatus.NOT_FOUND),
    HOC_SINH_NOT_FOUND(2004, "Học sinh không tồn tại", HttpStatus.NOT_FOUND),
    DE_XUAT_NOT_FOUND(2005, "Đề xuất tài trợ không tồn tại", HttpStatus.NOT_FOUND),
    INVALID_AMOUNT(2006, "Số tiền không hợp lệ, phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    INVALID_STATUS_TRANSITION(2007, "Trạng thái không thể chuyển đổi", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
