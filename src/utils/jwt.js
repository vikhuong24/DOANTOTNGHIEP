/**
 * Utility giải mã và xử lý JWT Token trên Frontend
 * Tương thích với JWT được tạo từ Spring Boot Backend (HMAC-SHA256)
 */

/**
 * Giải mã an toàn phần payload của JWT Token mà không cần thư viện ngoài
 * Hỗ trợ đúng chuẩn Unicode / UTF-8 tiếng Việt
 * @param {string} token - Chuỗi JWT token
 * @returns {object|null} Đối tượng payload đã giải mã hoặc null nếu token không hợp lệ
 */
export const parseJwt = (token) => {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;

    // Chuẩn hóa Base64URL sang Base64
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Bổ sung padding nếu cần
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    // Giải mã Base64 sang chuỗi nhị phân rồi parse UTF-8
    const binaryStr = atob(padded);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const decodedText = new TextDecoder('utf-8').decode(bytes);

    return JSON.parse(decodedText);
  } catch (error) {
    console.warn('Lỗi khi giải mã JWT token:', error?.message);
    return null;
  }
};

/**
 * Kiểm tra xem JWT token đã hết hạn hay chưa
 * @param {string} token - Chuỗi JWT token
 * @param {number} skewSeconds - Số giây dung sai cho phép lệch đồng hồ giữa client và server (mặc định 5s)
 * @returns {boolean} true nếu token đã hết hạn hoặc không hợp lệ, false nếu còn hạn
 */
export const isTokenExpired = (token, skewSeconds = 5) => {
  if (!token) return true;

  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }

  // payload.exp được tính theo đơn vị giây (Unix timestamp)
  const currentTimeSec = Math.floor(Date.now() / 1000);
  return payload.exp - skewSeconds <= currentTimeSec;
};

/**
 * Lấy thời gian còn lại của token tính bằng mili-giây
 * @param {string} token
 * @returns {number} Thời gian còn lại (ms), trả về 0 nếu đã hết hạn
 */
export const getTokenRemainingTime = (token) => {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') return 0;

  const remaining = payload.exp * 1000 - Date.now();
  return remaining > 0 ? remaining : 0;
};
