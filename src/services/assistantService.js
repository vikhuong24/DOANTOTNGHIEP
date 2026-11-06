// Service AI Assistant / Chatbot tư vấn và hỗ trợ tự động các tác nhân
import api, { unwrap } from './api';

/**
 * Xử lý câu trả lời thông minh theo ngữ cảnh role và từ khóa câu hỏi
 * Kết nối API AI của Backend nếu có endpoint, fallback bộ phân tích ngữ cảnh thông minh chuyên biệt
 */
export const sendMessage = async (message, role) => {
  const q = (message || '').toLowerCase().trim();
  const rawRole = String(role || '').toUpperCase();
  const normRole =
    rawRole === 'PH' || rawRole === 'PHUHUYNH' || role === 'parent'
      ? 'parent'
      : rawRole === 'CBQL' || rawRole === 'CANBO' || role === 'fundraiser'
      ? 'fundraiser'
      : rawRole === 'NHT' || rawRole === 'NHATAITRO' || role === 'donor'
      ? 'donor'
      : rawRole === 'HT' || rawRole === 'HIEUTRUONG' || role === 'principal'
      ? 'principal'
      : rawRole === 'ADMIN' || role === 'admin'
      ? 'admin'
      : 'guest';

  // Thử gọi endpoint AI backend nếu có cấu hình
  try {
    const res = await api.post('/ai/chat', { message, role: normRole });
    const reply = unwrap(res)?.reply || unwrap(res)?.message;
    if (reply) return reply;
  } catch {
    // Nếu BE chưa mở endpoint /ai/chat, sử dụng bộ trợ lý tri thức chuyên biệt cho trường
  }

  // 1. Phản hồi cho DONOR (Nhà hảo tâm)
  if (normRole === 'donor') {
    if (q.includes('tiến độ') || q.includes('bao nhiêu %') || q.includes('dự án')) {
      return 'Hệ thống hiển thị tiến trình thời gian thực của từng chiến dịch. Bạn có thể theo dõi chi tiết tại mục "Tiến trình dự án đã ủng hộ" trên thanh điều hướng.';
    }
    if (q.includes('đóng góp bao nhiêu') || q.includes('tôi đã ủng hộ') || q.includes('lịch sử')) {
      return 'Hệ thống đã ghi nhận lịch sử các lượt đóng góp của bạn. Bạn có thể xem bảng chi tiết từng đợt đóng góp kèm biên nhận tại menu "Lịch sử đóng góp".';
    }
    if (q.includes('tài trợ') || q.includes('làm sao') || q.includes('quyên góp') || q.includes('ủng hộ')) {
      return 'Để tài trợ, bạn chỉ cần chọn một chiến dịch trên trang chủ và bấm "Đăng ký tài trợ". Ngoài ra bạn cũng có thể "Đề xuất tài trợ ngoài danh mục" cho các trang thiết bị chuyên biệt của học sinh khiếm thị.';
    }
    return 'Chào bạn! Là Nhà hảo tâm, bạn có thể hỏi tôi về: tiến độ các chiến dịch, tổng số tiền bạn đã đóng góp, hoặc cách thức đăng ký tài trợ cho học sinh khiếm thị trường Nguyễn Đình Chiểu.';
  }

  // 2. Phản hồi cho PARENT (Phụ huynh học sinh)
  if (normRole === 'parent') {
    if (q.includes('nhận được gì') || q.includes('con tôi') || q.includes('học bổng') || q.includes('quà')) {
      return 'Toàn bộ danh sách học bổng, quà tặng và hỗ trợ bán trú của con em bạn được lưu lại chi tiết tại trang "Lịch sử nhận hỗ trợ".';
    }
    if (q.includes('minh chứng') || q.includes('hình ảnh') || q.includes('ở đâu')) {
      return 'Toàn bộ hình ảnh trao tặng thực tế, biên bản ký nhận và danh sách thụ hưởng đều được lưu trữ minh bạch tại mục "Minh chứng trao tặng". Bạn có thể mở xem và phóng to hình ảnh.';
    }
    if (q.includes('sai lệch') || q.includes('phản hồi') || q.includes('khiếu nại') || q.includes('báo sai')) {
      return 'Nếu phát hiện sai sót về số tiền hoặc quà tặng, bạn vui lòng vào mục "Phản hồi sai lệch" để gửi phản ánh. Cán bộ nhà trường cam kết đối soát và phúc đáp nhanh chóng.';
    }
    return 'Kính chào quý Phụ huynh! Tôi có thể giải đáp cho bạn về: các khoản hỗ trợ con bạn đã nhận, vị trí xem hình ảnh minh chứng trao tặng, hoặc quy trình phản hồi sai lệch thông tin.';
  }

  // 3. Phản hồi cho FUNDRAISER (Cán bộ quản lý gây quỹ)
  if (normRole === 'fundraiser') {
    if (q.includes('content') || q.includes('bài đăng') || q.includes('viết bài') || q.includes('kêu gọi')) {
      return 'Gợi ý bài kêu gọi: "🌟 CHUNG TAY TIẾP BƯỚC ƯỚC MƠ HỌC SINH KHIẾM THỊ ĐÀ NẴNG 🌟\nHơn 200 em học sinh khiếm thị và đa tật tại trường chuyên biệt Nguyễn Đình Chiểu đang cần sự đồng hành để có đủ sách chữ nổi Braille và thiết bị học tập. Mỗi đóng góp của quý vị là ánh sáng soi đường cho tương lai các em!"';
    }
    if (q.includes('thống kê') || q.includes('tiến độ') || q.includes('tổng số tiền')) {
      return 'Bạn có thể xem chi tiết số liệu quyên góp và cập nhật phân bổ tại menu "Tiến độ giải ngân" và "Quản lý chiến dịch".';
    }
    if (q.includes('đối soát') || q.includes('dữ liệu') || q.includes('xác nhận')) {
      return 'Để đối soát dữ liệu đóng góp: Bạn hãy vào mục "Xác nhận tiếp nhận", đối chiếu mã giao dịch ngân hàng và số tiền thực nhận với đơn đăng ký của Nhà hảo tâm trước khi bấm xác nhận.';
    }
    return 'Chào cán bộ! Tôi có thể hỗ trợ bạn: viết content bài kêu gọi gây quỹ, thống kê số liệu quyên góp, và hướng dẫn quy trình đối soát phân bổ hỗ trợ học sinh.';
  }

  // 4. Phản hồi chung / Guest
  if (q.includes('trường') || q.includes('nguyễn đình chiểu') || q.includes('địa chỉ')) {
    return 'Trường Phổ thông Chuyên biệt Nguyễn Đình Chiểu Đà Nẵng là nơi nuôi dạy và đào tạo các em học sinh khiếm thị, đa tật trên địa bàn TP. Đà Nẵng và khu vực miền Trung.';
  }
  if (q.includes('sao kê') || q.includes('minh bạch')) {
    return 'Tất cả các khoản tài trợ đều được công khai 100% tại trang "Sao kê toàn trường". Bạn có thể tra cứu theo từng dự án và thời gian.';
  }

  return 'Xin chào! Tôi là Trợ lý ảo của Quỹ Gây quỹ Trường Nguyễn Đình Chiểu. Tôi có thể hỗ trợ bạn tra cứu chiến dịch gây quỹ, sao kê minh bạch và thông tin hỗ trợ học sinh.';
};

export const sendChatMessage = sendMessage;

/**
 * AI hỗ trợ cán bộ tạo nội dung bài đăng gây quỹ
 */
export const generateCampaignContent = async (params = {}) => {
  const topic = params.topic || params.tieude || 'Hỗ trợ học sinh khiếm thị trường Nguyễn Đình Chiểu';
  return (
    `🌟 CHƯƠNG TRÌNH GÂY QUỸ: ${topic.toUpperCase()} 🌟\n\n` +
    `Kính gửi quý Nhà hảo tâm, các tổ chức thiện nguyện và các bậc phụ huynh,\n\n` +
    `Trường Phổ Thông Chuyên Biệt Nguyễn Đình Chiểu Đà Nẵng hiện đang nuôi dạy và đào tạo hơn 200 em học sinh khiếm thị, đa tật. Hoàn cảnh gia đình của nhiều em thuộc diện hộ nghèo, khó khăn tại các vùng sâu vùng xa miền Trung.\n\n` +
    `Nhằm tạo điều kiện tốt nhất cho các em tiếp cận tri thức và hòa nhập xã hội, nhà trường kêu gọi sự chung tay đóng góp của cộng đồng cho chương trình "${topic}".\n\n` +
    `🎯 Mục tiêu: Trang bị trang thiết bị chuyên dụng và trao học bổng tiếp sức đến trường.\n` +
    `🤝 Cam kết minh bạch: Toàn bộ dòng tiền ủng hộ được cập nhật sao kê công khai 100% và bàn giao tận tay các em với biên bản, hình ảnh minh chứng rõ ràng.\n\n` +
    `Trân trọng cảm ơn tấm lòng vàng của quý vị!`
  );
};
