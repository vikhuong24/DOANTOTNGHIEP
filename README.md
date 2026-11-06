# Website Gây Quỹ Trường Phổ Thông Chuyên Biệt Nguyễn Đình Chiểu — Đà Nẵng

Hệ thống Frontend Website hỗ trợ hoạt động kêu gọi tài trợ, tiếp nhận nguồn lực thiện nguyện, phân bổ học bổng - đồ dùng học tập và công khai sao kê minh bạch dành cho học sinh khiếm thị, khiếm thính và đa tật tại Trường Phổ thông Chuyên biệt Nguyễn Đình Chiểu, thành phố Đà Nẵng.

---

## 📖 1. Giới thiệu dự án

Trường Phổ thông Chuyên biệt Nguyễn Đình Chiểu Đà Nẵng là cơ sở giáo dục chuyên biệt nuôi dạy học sinh khiếm thị (học chữ nổi Braille), khiếm thính và khuyết tật đặc thù. Dự án Frontend xây dựng một nền tảng thông tin minh bạch, kết nối chặt chẽ giữa 6 nhóm đối tượng:
1. **Khách vãng lai (Guest):** Tìm hiểu các chiến dịch, tra cứu danh sách học sinh nhận hỗ trợ và tra cứu sao kê dòng tiền thực tế.
2. **Nhà hảo tâm (Donor - NHT):** Đăng ký tài trợ chiến dịch, đề xuất tài trợ ngoài danh mục, theo dõi tiến trình dự án đã ủng hộ và xem lịch sử đóng góp.
3. **Phụ huynh học sinh (Parent - PH):** Theo dõi lịch sử con em nhận hỗ trợ/học bổng, xem hình ảnh - biên bản minh chứng trao tặng và gửi phản ánh sai lệch đến nhà trường.
4. **Cán bộ quản lý gây quỹ (Fundraiser - CBQL):** Tạo & cập nhật bài kêu gọi tài trợ, phê duyệt đơn đăng ký của nhà hảo tâm, xác nhận tiếp nhận tiền/hiện vật, phân bổ học bổng/đồ dùng cho học sinh, cập nhật giải ngân và phản hồi phụ huynh/nhà hảo tâm.
5. **Hiệu trưởng (Principal - HT):** Phê duyệt bài kêu gọi gây quỹ, phê duyệt đợt phân bổ học bổng, xem báo cáo tài chính trực quan và theo dõi các luồng phản hồi toàn trường.
6. **Quản trị viên (Admin - ADMIN):** Quản lý người dùng, cấu hình ma trận phân quyền hệ thống, quản lý hồ sơ học sinh (hỗ trợ nhập từ Excel), và thống kê chiến dịch toàn trường.

---

## 🧰 2. Công nghệ sử dụng

- **Framework / Bundler:** ReactJS 18+ (Vite)
- **Định tuyến:** React Router DOM v6 (Nested routes, `PrivateRoute`, code splitting)
- **Styling:** CSS thuần hiện đại, Responsive, CSS Variables, không sử dụng Tailwind CSS hoặc Bootstrap
- **Quản lý trạng thái:** Context API (`AuthContext`, `ChatContext`, `NotificationContext`)
- **Biểu đồ & Thống kê:** `recharts` (BarChart, PieChart tương tác)
- **Xử lý Excel:** `xlsx` (SheetJS) hỗ trợ đọc file, trích xuất dữ liệu và tải file mẫu Excel
- **Biểu tượng:** `react-icons` (Bộ icon Feather `Fi...`)
- **HTTP Client & Mocking:** Axios, LocalStorage mock authentication, dịch vụ tách lớp sẵn sàng ghép API Backend thực tế

---

## 📁 3. Cấu trúc thư mục

```
src/
├── assets/                     # Hình ảnh, biểu tượng tĩnh
├── components/                 # Các UI Component dùng chung toàn hệ thống
│   ├── Button/                 # Nút bấm đa dạng variant (primary, outline, danger,...)
│   ├── Card/                   # Khung thẻ hiển thị nội dung
│   ├── ChatBox/                # Trợ lý ảo AI phân quyền (400x500px, session LocalStorage)
│   ├── EmptyState/             # Trạng thái rỗng khi không có dữ liệu
│   ├── Footer/                 # Chân trang hệ thống
│   ├── Header/                 # Thanh điều hướng thích ứng theo vai trò người dùng
│   ├── ImportStudentModal/     # Modal nhập danh sách học sinh từ file Excel
│   ├── Input/                  # Ô nhập liệu chuẩn hóa có nhãn và thông báo lỗi
│   ├── Lightbox/               # Xem trước ảnh minh chứng toàn màn hình
│   ├── Loading/                # Vòng xoay tiến trình và khung xương Skeleton
│   ├── Modal/                  # Hộp thoại đa kích thước (sm, md, lg, xl)
│   ├── Notification/           # Toast thông báo trạng thái nổi góc màn hình
│   ├── Pagination/             # Phân trang dữ liệu
│   ├── ProgressBar/            # Thanh tiến độ phần trăm gây quỹ
│   ├── Sidebar/                # Menu điều hướng bên hông theo từng vai trò
│   ├── Table/                  # Bảng dữ liệu tự động định dạng và responsive
│   └── Tabs/                   # Bộ chuyển đổi tab danh mục/trạng thái
├── contexts/
│   ├── AuthContext.jsx         # Quản lý phiên đăng nhập, quyền hạn và LocalStorage
│   └── ChatContext.jsx         # Quản lý lịch sử hội thoại trợ lý ảo theo vai trò
├── mock/                       # Dữ liệu mô phỏng chuẩn hóa khớp 100% CSDL
│   ├── approvals.js            # Lịch sử phê duyệt
│   ├── campaigns.js            # Bảng TT_TAITRO + CT_TT_TAITRO
│   ├── categories.js           # Bảng DANHMUC
│   ├── distributions.js        # Bảng DOTPHANBO + CT_PHANBO
│   ├── donations.js            # Bảng TAITRO + CT_TAITRO
│   ├── evidences.js            # Bảng MINHCHUNG
│   ├── feedbacks.js            # Bảng PHANHOI
│   ├── proposals.js            # Bảng DEXT_TAITRO
│   ├── students.js             # Bảng HOCSINH
│   └── users.js                # Bảng NGUOIDUNG + VAITRO
├── pages/
│   ├── Forbidden/              # Trang báo lỗi 403 (Truy cập bị từ chối)
│   └── NotFound/               # Trang báo lỗi 404 (Không tìm thấy trang)
├── routes/
│   ├── AppRoutes.jsx           # Định tuyến tổng thể hệ thống
│   └── PrivateRoute.jsx        # Bộ lọc bảo vệ truy cập theo vai trò
├── services/                   # Tầng dịch vụ API & nghiệp vụ
│   ├── api.js                  # Axios client cấu hình sẵn
│   ├── assistantService.js     # Nghiệp vụ Trợ lý ảo & tạo nội dung tự động
│   ├── authService.js          # Nghiệp vụ đăng nhập / đăng xuất
│   ├── campaignService.js      # Nghiệp vụ quản lý chiến dịch gây quỹ
│   ├── distributionService.js  # Nghiệp vụ đợt phân bổ học bổng/đồ dùng
│   ├── donationService.js      # Nghiệp vụ đóng góp và sao kê
│   ├── studentService.js       # Nghiệp vụ học sinh & Import Excel
│   └── userService.js          # Nghiệp vụ quản lý tài khoản người dùng
├── utils/
│   ├── constants.js            # Hằng số vai trò (ROLES), thông tin trường học
│   ├── formatCurrency.js       # Định dạng tiền tệ VNĐ
│   └── formatDate.js           # Định dạng thời gian
└── app/                        # Phân hệ chức năng theo 6 tác nhân
    ├── guest/                  # Phân hệ Khách vãng lai
    ├── donor/                  # Phân hệ Nhà hảo tâm
    ├── parent/                 # Phân hệ Phụ huynh học sinh
    ├── fundraiser/             # Phân hệ Cán bộ Quản lý gây quỹ
    ├── principal/              # Phân hệ Hiệu trưởng
    └── admin/                  # Phân hệ Quản trị viên
```

---

## 👥 4. Tài khoản Demo kiểm thử hệ thống

Tất cả các tài khoản demo đều sử dụng mật khẩu mặc định: `123456`

| Vai trò | Tên người dùng | Email đăng nhập | Tên đăng nhập | Chức năng chính |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên** | Hoàng Văn Em | `admin@demo.com` | `admin` | Quản lý người dùng, phân quyền, hồ sơ học sinh (Import Excel), thống kê hệ thống |
| **Hiệu trưởng** | Phạm Thị Dung | `principal@demo.com` | `principal` | Phê duyệt chiến dịch, duyệt phân bổ, báo cáo tài chính, giám sát phản hồi |
| **Cán bộ quản lý** | Lê Minh Cường | `fundraiser@demo.com` | `fundraiser` | Tạo/sửa bài gây quỹ, duyệt đề xuất/tài trợ, phân bổ học sinh, giải ngân, phản hồi |
| **Phụ huynh** | Trần Thị Bình | `parent@demo.com` | `parent` | Theo dõi hỗ trợ con em (Trần Minh Khang), xem minh chứng, phản hồi sai lệch |
| **Nhà hảo tâm** | Nguyễn Văn An | `donor@demo.com` | `donor` | Đăng ký tài trợ, đề xuất dự án, theo dõi tiến trình, xem lịch sử đóng góp |
| **Khách vãng lai** | Khách Vãng Lai | `guest@demo.com` | `guest_user` | Xem chiến dịch, sao kê toàn trường, danh sách học sinh nhận hỗ trợ |

---

## 🚀 5. Hướng dẫn cài đặt và khởi chạy

### Yêu cầu môi trường
- NodeJS version 18.x hoặc mới hơn
- npm version 9.x hoặc mới hơn

### Các bước cài đặt:

1. **Cài đặt các gói phụ thuộc:**
```bash
npm install
```

2. **Khởi chạy máy chủ phát triển (Development):**
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173/` (hoặc cổng hiển thị trên terminal).

3. **Kiểm tra và đóng gói sản phẩm (Production Build):**
```bash
npm run build
```

4. **Xem trước bản đóng gói (Preview):**
```bash
npm run preview
```

---

## 🌟 6. Các tính năng nổi bật hoàn thiện

1. **Phân quyền và bảo mật chặt chẽ:** Tự động điều hướng và bảo vệ URL theo vai trò, trang `403 Forbidden` rõ ràng khi truy cập trái phép.
2. **Trợ lý ảo NĐC thông minh:** Hộp thoại 400x500px lưu lịch sử theo phiên/vai trò (LocalStorage), trả lời ngữ cảnh chuyên sâu cho từng nhóm đối tượng (Nhà hảo tâm, Phụ huynh, Cán bộ).
3. **Quản lý học sinh & Import Excel:** Tải file mẫu chuẩn CSDL, đọc file Excel trực tiếp, kiểm tra lỗi và xem trước dữ liệu trước khi lưu vào hệ thống.
4. **Báo cáo và thống kê trực quan:** Tích hợp Recharts thể hiện doanh thu quyên góp 12 tháng, cơ cấu danh mục phân bổ và tiến độ giải ngân.
5. **Giao diện thân thiện:** Thiết kế chuẩn mực, thuần CSS, tối ưu hóa cho màn hình di động và tablet.
