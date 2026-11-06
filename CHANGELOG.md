# CHANGELOG — Lịch sử cập nhật dự án

## [2026-10-30 18:45:00] — Cập nhật lớn: Đồng bộ ERD mới, xóa bảng Danh mục tài trợ, gộp bảng chi tiết vào bảng chính

### Thay đổi kiến trúc CSDL (ERD mới) & Mock Data

- **Xóa bỏ hoàn toàn bảng `DANHMUCTAITRO`**:
  - Xóa file mock `src/mock/categories.js` và service `src/services/categoryService.js`.
  - Loại bỏ toàn bộ các tabs lọc danh mục trên giao diện Khách vãng lai (`CampaignList`), Nhà hảo tâm (`Donor`).
  - Dọn dẹp các tham chiếu danh mục tài trợ trên trang Phê duyệt bài (`CampaignApproval`), Thống kê tài chính (`FinancialReport`, `CampaignStatistics`).

- **BẢNG TT_TAITRO (Bài đăng gây quỹ - Gộp bảng CT_TT_TAITRO)**:
  - Cấu trúc mới: `maBaiTaiTro` (PK), `tieude`, `noidung`, `anhbia`, `muctieu`, `tongtienDaNhan` (MỚI), `trangthai`, `maCanBo`, `maHieuTruong`, `ngaybatdau`, `ngaykethuc`.
  - Bảng `CT_TT_TAITRO` cũ đã bị xóa; gộp trực tiếp `muctieu` và `tongtienDaNhan` vào bảng chính `TT_TAITRO`.
  - Cập nhật lại giao diện `CampaignDetail`, `CampaignList`: hiển thị `muctieu`, `tongtienDaNhan`; tính thanh tiến độ `ProgressBar` = `(tongtienDaNhan / muctieu) * 100`.

- **BẢNG TAITRO (Đăng ký tài trợ - Gộp bảng CHITIETTAITRO)**:
  - Cấu trúc mới: `maTaiTro` (PK), `maNguoiDung`, `maBaiTaiTro`, `tenHienThi`, `soTienDK` (MỚI), `soTienTT` (MỚI), `anhGiaoDich` (MỚI), `trangthai`, `maCanBo`, `ghichu`, `ngaygui`, `ngaynhan`.
  - Bảng `CHITIETTAITRO` cũ đã bị xóa; gộp thẳng số tiền đăng ký (`soTienDK`), số tiền thực tế tiếp nhận (`soTienTT`) và ảnh biên lai giao dịch (`anhGiaoDich`) vào bảng chính.
  - Cập nhật Form Đăng ký tài trợ (`RegisterSponsor`): bỏ chọn danh mục, chỉ nhập số tiền (`soTienDK`) và tải lên ảnh giao dịch chuyển khoản (`anhGiaoDich`).
  - Cập nhật Lịch sử đóng góp (`DonationHistory`), Phê duyệt đơn (`SponsorApproval`), Tiếp nhận kinh phí (`DonationConfirm`): hiển thị và đối soát theo `soTienDK`, `soTienTT`, `anhGiaoDich`.

- **BẢNG DEXUATTAITRO (Đề xuất tài trợ - Gộp bảng CT_DEXUAT)**:
  - Cấu trúc mới: `madexuat` (PK), `manguoidung`, `mabaitaitro`, `tieude` (MỚI), `soTienDX` (MỚI), `mucdichSD` (MỚI), `trangthai`, `macanbo`, `ngayxuly`, `lydotuchoi`, `ngaygui`.
  - Bảng `CT_DEXUAT` cũ đã bị xóa.
  - Cập nhật Form Đề xuất tài trợ (`ProposeSponsor`): đổi thành nhập Tiêu đề (`tieude`), Số tiền đề xuất (`soTienDX`), Mục đích sử dụng (`mucdichSD`).
  - Cập nhật trang Phê duyệt đề xuất (`ProposalApproval`): map đúng các trường `tieude`, `soTienDX`, `mucdichSD`, `lydotuchoi`.

- **BẢNG DOTPHANBO & CT_PHANBO (Đợt phân bổ & Chi tiết phân bổ)**:
  - Bảng `DOTPHANBO`: `maDotphanbo` (PK), `mabaitaitro`, `tendot`, `tongtien` (MỚI), `ngaytrao`, `trangthai`, `macanbo`, `mahieutruong`.
  - Bảng `CT_PHANBO`: `maChiTietPhanBo` (PK), `maDotPhanBo`, `maHocSinh`, `soTien` (MỚI), `nguoinhan`, `ngayNhan`, `ghichu`.
  - Xóa bỏ hoàn toàn các trường `maDanhMuc` và `soLuong`. Mọi phân bổ hiện vật/học bổng đều quy đổi trực tiếp bằng kinh phí (`soTien`).
  - Cập nhật trang Phân bổ (`ScholarshipDistribution`, `SuppliesDistribution`): bỏ phần chọn Danh mục/Đồ dùng, chỉ chọn Học sinh và nhập Số tiền (`soTien`).
  - Cập nhật `StudentList`, `DistributionApproval`: hiển thị số tiền nhận và người nhận theo cấu trúc mới.

- **BẢNG HOCSINH & NGUOIDUNG**:
  - Chuẩn hóa trường khóa ngoại `maphuhuynh` trong bảng `HOCSINH` (hỗ trợ tương thích `mahuuhuynh`).
  - Đồng bộ `users.js`, `students.js`, `evidences.js`, `feedbacks.js`, `approvals.js` khớp 10 bảng ERD mới.

## [2026-10-17 10:38:00] — Task 5: Hoàn thiện Trợ lý ảo, Routing 403/404, Quản lý & Import Học Sinh từ Excel, README

### Thêm mới

#### 📊 Chức năng Quản lý & Import Danh Sách Học Sinh từ Excel (Khớp bảng HOCSINH)
- Cài đặt thư viện `xlsx` (SheetJS) đọc và tạo file bảng tính Excel phía client.
- `src/components/ImportStudentModal/ImportStudentModal.jsx` + `ImportStudentModal.css` — Modal nhập danh sách học sinh từ file Excel (.xlsx, .xls, .csv):
  - Hỗ trợ kéo thả file, tự động nhận diện và ánh xạ các cột CSDL: `mahocsinh`, `mahuuhuynh`, `hoten`, `ngaysinh`, `gioitinh`, `lop`, `hoancanh`, `trangthai`.
  - Nút "Tải file Excel mẫu (.xlsx)" tự tạo workbook chuẩn cấu trúc CSDL để người dùng nhập liệu đúng chuẩn.
  - Bảng xem trước dữ liệu (Preview Table) trước khi xác nhận lưu vào hệ thống.
  - Phân loại thêm mới học sinh tự tăng ID hoặc cập nhật học sinh nếu đã có `mahocsinh`.
- `src/app/admin/pages/student-management/StudentManagement.jsx` + `StudentManagement.css` — Trang Quản lý hồ sơ học sinh dành cho Quản trị viên (Admin):
  - Tìm kiếm học sinh theo tên/hoàn cảnh, lọc theo lớp học, hiển thị số lượng học sinh.
  - CRUD học sinh: Thêm học sinh mới, Chỉnh sửa, Xóa học sinh có xác nhận an toàn.
  - Tích hợp nút "Nhập từ Excel (.xlsx)" mở Modal import.
- `src/app/guest/pages/student-list/StudentList.jsx` — Tích hợp nút "Nhập học sinh từ Excel" dành cho Quản trị viên và Cán bộ gây quỹ khi đang đăng nhập, tự động tải lại danh sách sau khi import.

#### 🤖 Trợ lý ảo NĐC phân quyền (`ChatBox` + `ChatContext` + `assistantService`)
- `src/components/ChatBox/ChatBox.jsx` + `ChatBox.css`:
  - Kích thước chuẩn 400x500px, cố định góc phải dưới màn hình.
  - Nhận prop `role` (`donor` | `parent` | `fundraiser` | `principal` | `admin`).
  - Thanh gợi ý câu hỏi nhanh (Quick Prompts) thích ứng chính xác theo vai trò người dùng:
    - **DONOR**: "Dự án X đang tiến độ bao nhiêu?", "Tôi đã đóng góp bao nhiêu?", "Làm sao để tài trợ?"
    - **PARENT**: "Con tôi đã nhận được gì?", "Minh chứng trao tặng ở đâu?", "Tôi muốn phản hồi sai lệch"
    - **FUNDRAISER**: "Viết content bài đăng cho dự án X", "Thống kê quyên góp tháng này", "Đối soát dữ liệu đóng góp"
  - Header hiển thị "Trợ lý ảo NĐC", trạng thái kết nối và vai trò người dùng, nút "Xóa lịch sử", nút "Đóng".
  - Phân quyền hiển thị: Chỉ hiển thị icon nổi khi người dùng đã đăng nhập vào hệ thống.
- `src/contexts/ChatContext.jsx`:
  - Quản lý lịch sử hội thoại riêng biệt theo từng phiên và vai trò lưu trữ tại LocalStorage (`chat_history_${role}`).
  - Tự động khôi phục tin nhắn chào mừng và phiên chat khi chuyển đổi giữa các tài khoản.
  - Hàm `clearHistory` xóa sạch lịch sử của vai trò hiện tại.
- `src/services/assistantService.js`:
  - Xử lý thông minh phản hồi tin nhắn dựa trên phân tích từ khóa theo từng vai trò (tiến độ, đóng góp, tài trợ, nhận được gì, minh chứng, phản hồi, content, thống kê, đối soát...).
  - Thiết kế sẵn sàng kết nối trực tiếp với API Backend qua hàm `sendMessage(message, role)`.

#### 🚦 Hoàn thiện Routing & Trang lỗi
- `src/pages/Forbidden/Forbidden.jsx` + `Forbidden.css` — Trang báo lỗi 403 khi truy cập trái quyền hạn với nút quay lại và về trang chủ.
- `src/pages/NotFound/NotFound.jsx` + `NotFound.css` — Trang báo lỗi 404 cho các đường dẫn không tồn tại.
- `src/routes/AppRoutes.jsx`:
  - Kết nối đầy đủ các phân hệ `GuestRoutes`, `DonorRoutes`, `ParentRoutes`, `FundraiserRoutes`, `PrincipalRoutes`, `AdminRoutes`.
  - Cấu hình route `/403` và `/404`, fallback route `*` về trang 404.
  - Bổ sung alias route `/guest/campaign-list` và `/guest/*`.

#### 📄 Tài liệu hệ thống
- `README.md` — Tài liệu tổng quan toàn bộ dự án tại thư mục root: giới thiệu dự án, công nghệ sử dụng, cấu trúc thư mục chi tiết, bảng danh sách tài khoản demo kiểm thử theo 6 vai trò và hướng dẫn cài đặt/khởi chạy.

### Thêm mới

#### 🟪 Tác nhân PRINCIPAL (Hiệu trưởng)
- `src/app/principal/components/PrincipalLayout.jsx` + `PrincipalLayout.css` — Layout dành riêng cho Hiệu trưởng, tích hợp Header, Sidebar điều hướng theo vai trò `HT` và Footer.
- `src/app/principal/pages/login/Login.jsx` + `Login.css` — Giao diện đăng nhập Hiệu trưởng với panel giới thiệu quyền hạn đặc thù, tích hợp tài khoản demo `principal@demo.com` / `123456`.
- `src/app/principal/pages/campaign-approval/CampaignApproval.jsx` + `CampaignApproval.css` — Phê duyệt chiến dịch gây quỹ:
  - Tabs phân loại trạng thái: Chờ duyệt, Đã duyệt, Từ chối, Tất cả; huy hiệu đếm số lượng chiến dịch đang chờ duyệt.
  - Bảng danh sách bài kêu gọi kèm chi tiết mục tiêu, cán bộ lập, ngày tạo, trạng thái.
  - Modal xem toàn bộ hồ sơ chiến dịch (ảnh bìa, mô tả, chi tiết ngân sách theo từng danh mục).
  - Modal xác nhận phê duyệt và Modal từ chối yêu cầu nhập lý do phản hồi cho cán bộ.
- `src/app/principal/pages/distribution-approval/DistributionApproval.jsx` + `DistributionApproval.css` — Phê duyệt đợt phân bổ học sinh:
  - Tabs lọc trạng thái (Chờ duyệt, Đã duyệt, Đã trao, Tất cả).
  - Modal chi tiết từng học sinh nhận hỗ trợ, số tiền hoặc hiện vật được bàn giao.
  - Phê duyệt / từ chối đợt phân bổ trực tiếp.
- `src/app/principal/pages/financial-report/FinancialReport.jsx` + `FinancialReport.css` — Báo cáo tài chính toàn trường:
  - 4 Thẻ KPI: Tổng quyên góp, Tổng giải ngân, Số dư quỹ trường, Dự án đang chạy.
  - Biểu đồ cột (Recharts): Thu quyên góp 12 tháng theo năm tùy chọn.
  - Biểu đồ tròn (Recharts): Tỷ trọng phân bổ theo danh mục tài trợ.
  - Bảng xếp hạng Top chiến dịch gây quỹ nhiều nhất.
- `src/app/principal/pages/parent-feedback-view/ParentFeedbackView.jsx` + `ParentFeedbackView.css` — Theo dõi phản hồi và thắc mắc của phụ huynh học sinh (chế độ chỉ xem), xem nội dung trả lời từ cán bộ gây quỹ.
- `src/app/principal/pages/staff-response-view/StaffResponseView.jsx` + `StaffResponseView.css` — Bảng giám sát các phúc đáp chính thức của cán bộ quản lý gây quỹ gửi đến phụ huynh và nhà hảo tâm.
- `src/app/principal/routers/PrincipalRoutes.jsx` — Định tuyến toàn bộ các trang của Hiệu trưởng, bảo vệ bởi `PrivateRoute`.

#### 🛡️ Tác nhân ADMIN (Quản trị viên)
- `src/app/admin/components/AdminLayout.jsx` + `AdminLayout.css` — Layout dành riêng cho Quản trị viên hệ thống.
- `src/app/admin/pages/login/Login.jsx` + `Login.css` — Giao diện đăng nhập Admin riêng biệt với tài khoản demo `admin@demo.com` / `123456`.
- `src/app/admin/pages/user-management/UserManagement.jsx` + `UserManagement.css` — Quản lý toàn bộ người dùng trong hệ thống:
  - Thanh công cụ tìm kiếm họ tên, email, tên đăng nhập; lọc theo vai trò và trạng thái tài khoản.
  - Bảng danh sách với avatar chữ cái, huy hiệu vai trò và trạng thái.
  - Modal Thêm mới và Chỉnh sửa người dùng (họ tên, email, sdt, địa chỉ, username, password, vai trò).
  - Khóa / Mở khóa tài khoản người dùng ngay tại bảng.
  - Xóa tài khoản với Modal xác nhận an toàn.
- `src/app/admin/pages/role-permission/RolePermission.jsx` + `RolePermission.css` — Bảng ma trận phân quyền hệ thống:
  - Bảng ma trận trực quan các nhóm chức năng (Chiến dịch, Quyên góp, Phân bổ, Người dùng, Báo cáo) theo từng vai trò (NHT, PH, CBQL, HT, ADMIN).
  - Checkbox bật/tắt quyền truy cập cho từng vai trò và nút "Lưu cấu hình", "Khôi phục mặc định".
- `src/app/admin/pages/campaign-statistics/CampaignStatistics.jsx` + `CampaignStatistics.css` — Thống kê chiến dịch toàn hệ thống:
  - Thẻ KPI: Tổng số bài kêu gọi, Đang chạy, Hoàn thành, Từ chối.
  - Biểu đồ cột: Tần suất bài kêu gọi khởi tạo theo tháng.
  - Biểu đồ tròn: Cơ cấu các chiến dịch theo danh mục hỗ trợ.
  - Bảng Top 10 chiến dịch gây quỹ nhiều nhất.
- `src/app/admin/routers/AdminRoutes.jsx` — Định tuyến toàn bộ các trang của Quản trị viên, bảo vệ bởi `PrivateRoute`.

#### 🛠️ Services & Router tích hợp
- `src/services/userService.js` — Service quản lý người dùng (`getAllUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`, `toggleUserStatus`, `getRoles`).
- `src/routes/AppRoutes.jsx` — Kết nối các route chính thức của `/principal/*` và `/admin/*`.
- `src/components/Sidebar/Sidebar.jsx` & `src/components/Header/Header.jsx` — Bổ sung menu và chuyển hướng tương ứng cho vai trò `HT` và `ADMIN`.
- Cài đặt thư viện `recharts` phục vụ hiển thị biểu đồ phân tích số liệu tài chính và thống kê.

### Thêm mới

#### 👨‍👩‍👧 Tác nhân PARENT (Phụ huynh học sinh)
- `src/app/parent/components/ParentLayout.jsx` + `ParentLayout.css` — Layout dành riêng cho Phụ huynh, tích hợp Header, Sidebar điều hướng theo vai trò `PH` và Footer.
- `src/app/parent/pages/login/Login.jsx` + `Login.css` — Đăng nhập phụ huynh, có sẵn nút điền nhanh tài khoản demo `parent@demo.com` / `password123`.
- `src/app/parent/pages/student-support-history/StudentSupportHistory.jsx` + `StudentSupportHistory.css` — Tra cứu lịch sử các đợt nhận học bổng, quà tặng và hỗ trợ của từng con:
  - Tabs động chuyển đổi giữa các con em của phụ huynh đăng nhập.
  - Thẻ tóm tắt thông tin học sinh (lớp, loại hỗ trợ, hoàn cảnh).
  - Bảng chi tiết các đợt phân bổ: mã đợt, tên đợt, phân loại (Học bổng / Hiện vật), giá trị/số lượng, ngày nhận, trạng thái.
  - Modal và Lightbox xem minh chứng hình ảnh/phiếu ký nhận trực tiếp.
  - Nút "Báo sai" dẫn truyền query sang trang phản hồi.
- `src/app/parent/pages/donation-evidence/DonationEvidence.jsx` + `DonationEvidence.css` — Thư viện Gallery toàn bộ hình ảnh và tư liệu trao tặng hỗ trợ, lọc theo loại (Học bổng, Đồ dùng, Cơ sở vật chất), tích hợp Lightbox phóng to toàn màn hình.
- `src/app/parent/pages/feedback/Feedback.jsx` + `Feedback.css` — Gửi phản ánh sai lệch về số tiền/hiện vật hoặc thông tin học sinh đến nhà trường, tự động điền thông tin nếu chuyển từ bảng lịch sử; theo dõi trạng thái xử lý và xem thư trả lời từ cán bộ quản lý.
- `src/app/parent/pages/chat-assistant/ChatAssistant.jsx` + `ChatAssistant.css` — Trợ lý AI hỗ trợ phụ huynh tìm hiểu các quy chế học bổng, tiêu chuẩn hỗ trợ học phẩm chuyên biệt, quy trình rà soát sai lệch với các câu hỏi gợi ý nhanh.
- `src/app/parent/routers/ParentRoutes.jsx` — Định tuyến toàn bộ 5 page của Phụ huynh học sinh, bảo vệ bằng `PrivateRoute`.

#### 📋 Tác nhân FUNDRAISER (Cán bộ Quản lý Gây quỹ)
- `src/app/fundraiser/components/FundraiserLayout.jsx` + `FundraiserLayout.css` — Khung giao diện quản trị cho Cán bộ gây quỹ, kết nối Header, Sidebar `CBQL` và Footer.
- `src/app/fundraiser/pages/login/Login.jsx` + `Login.css` — Đăng nhập cán bộ quản lý với tài khoản demo `fundraiser@demo.com` / `password123`.
- `src/app/fundraiser/pages/campaign-create/CampaignCreate.jsx` + `CampaignCreate.css` — Khởi tạo bài kêu gọi gây quỹ:
  - Form nhập thông tin cơ bản: Tiêu đề, ngày bắt đầu/kết thúc, URL ảnh bìa có xem trước trực tiếp.
  - Tích hợp Trợ lý AI viết nội dung tự động thông qua nút "Nhờ AI viết nội dung".
  - Thêm / bớt động nhiều hạng mục mục tiêu gây quỹ (chọn danh mục tài trợ, nhập số lượng/kinh phí dự toán, ghi chú).
  - Tùy chọn "Lưu nháp" hoặc "Gửi duyệt Hiệu trưởng".
- `src/app/fundraiser/pages/campaign-update/CampaignUpdate.jsx` + `CampaignUpdate.css` — Bảng danh sách bài kêu gọi kèm Tabs lọc trạng thái (Đang chạy, Chờ duyệt, Đã duyệt, Bản nháp, Kết thúc), thanh tiến độ %, nút xem bài công khai và Modal chỉnh sửa nhanh nội dung, gia hạn thời gian.
- `src/app/fundraiser/pages/proposal-approval/ProposalApproval.jsx` + `ProposalApproval.css` — Thẩm định đề xuất tài trợ ngoài danh mục từ nhà hảo tâm:
  - Lọc theo trạng thái đề xuất (Chờ duyệt, Đã duyệt, Đã từ chối).
  - Modal xem toàn bộ hồ sơ dự án thiện nguyện.
  - Nút duyệt chấp thuận hoặc từ chối kèm Modal nhập lý do gửi đến nhà hảo tâm.
- `src/app/fundraiser/pages/sponsor-approval/SponsorApproval.jsx` + `SponsorApproval.css` — Phê duyệt đơn đăng ký tài trợ của nhà hảo tâm, kiểm tra số tiền/hiện vật đăng ký và xem lời nhắn gửi gắm.
- `src/app/fundraiser/pages/donation-confirm/DonationConfirm.jsx` + `DonationConfirm.css` — Xác nhận tiếp nhận tiền vào tài khoản ngân hàng hoặc hiện vật bàn giao tại trường, cập nhật số tiền thực nhận và mã tham chiếu biên lai vào tiến độ gây quỹ.
- `src/app/fundraiser/pages/scholarship-distribution/ScholarshipDistribution.jsx` + `ScholarshipDistribution.css` — Phân bổ học bổng cho học sinh:
  - Chọn chiến dịch gây quỹ nguồn.
  - Chọn danh sách học sinh (lọc theo Hoàn cảnh: Khuyết tật, Hộ nghèo, Mồ côi; nút chọn tất cả/bỏ chọn).
  - Nhập định mức học bổng mỗi suất, tự động tính tổng kinh phí.
  - Lịch sử các đợt trao học bổng đã thực hiện.
- `src/app/fundraiser/pages/supplies-distribution/SuppliesDistribution.jsx` + `SuppliesDistribution.css` — Phân bổ đồ dùng học tập, sách chữ nổi Braille, máy trợ thính chuyên biệt cho học sinh.
- `src/app/fundraiser/pages/disbursement-progress/DisbursementProgress.jsx` + `DisbursementProgress.css` — Cập nhật tiến độ giải ngân:
  - Thống kê tổng quỹ đã nhận, đã giải ngân và số dư còn lại.
  - Thanh tiến độ giải ngân tổng quan.
  - Form ghi nhận đợt chi tiêu mới kèm URL chứng từ hóa đơn, biên bản bàn giao.
- `src/app/fundraiser/pages/parent-feedback/ParentFeedback.jsx` + `ParentFeedback.css` — Hộp thư tiếp nhận và xử lý phản ánh sai lệch từ Phụ huynh học sinh, Modal soạn phúc đáp.
- `src/app/fundraiser/pages/donor-feedback/DonorFeedback.jsx` + `DonorFeedback.css` — Hộp thư trả lời câu hỏi và tâm thư tri ân gửi đến các Nhà hảo tâm.
- `src/app/fundraiser/pages/chat-assistant/ChatAssistant.jsx` + `ChatAssistant.css` — Trợ lý AI nghiệp vụ gây quỹ (soạn bài kêu gọi, viết thư cảm ơn, lập kế hoạch dự toán) có tính năng sao chép và chuyển nhanh sang form tạo chiến dịch.
- `src/app/fundraiser/routers/FundraiserRoutes.jsx` — Định tuyến toàn bộ 12 page của Cán bộ Quản lý Gây quỹ.

#### 🛠️ Hạ tầng & Services cập nhật
- `src/utils/formatters.js` — Tạo file re-export tập trung cho `formatCurrency` và `formatDate`.
- `src/utils/constants.js` — Bổ sung alias `CAMPAIGN_STATUS_LABELS`, `DONATION_STATUS_LABELS`.
- `src/services/distributionService.js` — Bổ sung `getDistributions` và `getDistributionsByStudent`.
- `src/services/evidenceService.js` — Bổ sung `getEvidences` và `createEvidence`.
- `src/services/feedbackService.js` — Bổ sung `getFeedbacks`, `getFeedbacksByUser` và `replyFeedback`.
- `src/services/assistantService.js` — Bổ sung `sendChatMessage` và hàm `generateCampaignContent` hỗ trợ tạo nội dung tự động cho chiến dịch.
- `src/services/categoryService.js` — Bổ sung alias `getCategories`.
- `src/services/campaignService.js` — Bổ sung alias `getCampaigns`.
- `src/services/proposalService.js` — Bổ sung alias `getProposals`.
- `src/services/studentService.js` — Bổ sung alias `getStudents`.
- `src/services/donationService.js` — Bổ sung `approveDonation`, `rejectDonation` và `updateDisbursement`.
- `src/components/Header/Header.jsx` & `src/components/Sidebar/Sidebar.jsx` — Cập nhật menu điều hướng đầy đủ cho vai trò Phụ huynh (`PH`) và Cán bộ quản lý gây quỹ (`CBQL`).
- `src/routes/AppRoutes.jsx` — Kết nối chính thức `ParentRoutes` và `FundraiserRoutes`.

---

## [2026-10-16 16:30:00] — Task 2: Guest + Donor

### Thêm mới

#### 🟦 Tác nhân GUEST (Khách vãng lai)
- `src/app/guest/components/GuestLayout.jsx` + `GuestLayout.css` — Layout chung gồm Header, main container và Footer.
- `src/app/guest/pages/register/Register.jsx` + `Register.css` — Form đăng ký tài khoản Nhà hảo tâm với validation (họ tên, email, sdt 10 số, mật khẩu >= 6 ký tự, xác nhận mật khẩu, điều khoản), gọi `authService.register` và redirect sang trang đăng nhập.
- `src/app/guest/pages/campaign-list/CampaignList.jsx` + `CampaignList.css` — Grid card danh sách các chương trình tài trợ (ảnh, tiêu đề, mục tiêu, đã quyên, progress %, số ngày còn lại), bộ lọc theo danh mục tài trợ (Học bổng, Đồ dùng, Cơ sở vật chất, Y tế), ô tìm kiếm và phân trang.
- `src/app/guest/pages/campaign-detail/CampaignDetail.jsx` + `CampaignDetail.css` — Chi tiết bài tài trợ với ảnh cover, gallery tương tác, hỗ trợ Lightbox phóng to, chi tiết hạng mục, danh sách nhà hảo tâm gần đây, hồ sơ minh chứng giải ngân thực tế và 2 nút hành động: "Đăng ký tài trợ ngay", "Đề xuất tài trợ hiện vật/khác".
- `src/app/guest/pages/statement/Statement.jsx` + `Statement.css` — Bảng sao kê minh bạch các khoản quyên góp với bộ lọc theo chương trình/dự án, khoảng ngày (từ ngày - đến ngày) và tổng cộng số tiền ở footer.
- `src/app/guest/pages/student-list/StudentList.jsx` + `StudentList.css` — Danh sách học sinh nhận hỗ trợ với cơ chế bảo mật danh tính trẻ em khuyết tật (mã hóa HS-xxx, khối/lớp, hoàn cảnh tóm tắt, diện chính sách, các gói hỗ trợ đã nhận).
- `src/app/guest/routers/GuestRoutes.jsx` — Định tuyến toàn bộ 5 page của Khách vãng lai.

#### 🟩 Tác nhân DONOR (Nhà hảo tâm)
- `src/app/donor/components/DonorLayout.jsx` + `DonorLayout.css` — Khung giao diện Nhà hảo tâm tích hợp Header, Sidebar điều hướng, vùng nội dung và Footer.
- `src/app/donor/pages/login/Login.jsx` + `Login.css` — Đăng nhập Nhà hảo tâm với validation, gợi ý tài khoản demo tự động điền và redirect lại đúng trang trước đó.
- `src/app/donor/pages/profile/Profile.jsx` + `Profile.css` — Xem và cập nhật hồ sơ cá nhân (họ tên, email readonly, số điện thoại, địa chỉ, avatar), đổi mật khẩu và tab điều hướng sang lịch sử đóng góp.
- `src/app/donor/pages/register-sponsor/RegisterSponsor.jsx` + `RegisterSponsor.css` — Đăng ký tài trợ bằng tiền (kèm nút chọn nhanh số tiền và thông tin tài khoản ngân hàng của trường) hoặc bằng hiện vật (quy cách, số lượng, cách bàn giao), hỗ trợ lời nhắn và tùy chọn tài trợ ẩn danh.
- `src/app/donor/pages/propose-sponsor/ProposeSponsor.jsx` + `ProposeSponsor.css` — Đề xuất tài trợ các hạng mục đặc thù ngoài danh mục sẵn có (tên đề xuất, mô tả chi tiết, giá trị ước tính, lý do đóng góp, ảnh catalog đính kèm, thời gian dự kiến).
- `src/app/donor/pages/campaign-progress/CampaignProgress.jsx` + `CampaignProgress.css` — Theo dõi tiến trình các dự án cá nhân đã tài trợ, thống kê tổng tiền đóng góp, tỷ lệ hoàn thành mục tiêu và xem modal hồ sơ minh chứng giải ngân.
- `src/app/donor/pages/donation-history/DonationHistory.jsx` + `DonationHistory.css` — Bảng lịch sử các lượt đăng ký tài trợ của nhà hảo tâm kèm bộ lọc theo chương trình và trạng thái xác nhận (Chờ duyệt, Đã duyệt, Đã nhận, Hoàn thành, Từ chối).
- `src/app/donor/pages/feedback/Feedback.jsx` + `Feedback.css` — Gửi câu hỏi, thắc mắc hoặc phản ánh (chọn dự án, tiêu đề, nội dung, tệp đính kèm) và theo dõi câu trả lời từ Ban quản lý trường.
- `src/app/donor/pages/chat-assistant/ChatAssistant.jsx` + `ChatAssistant.css` — Giao diện Trợ lý AI toàn màn hình dành cho Nhà hảo tâm với các gợi ý câu hỏi nhanh (thủ tục, chứng nhận, quy trình giải ngân).
- `src/app/donor/routers/DonorRoutes.jsx` — Định tuyến toàn bộ 8 page của Nhà hảo tâm, bảo vệ các trang dashboard bằng `PrivateRoute`.

#### ⚙️ Dịch vụ bổ sung
- `src/services/categoryService.js` — Cung cấp API lấy danh mục tài trợ.
- `src/services/evidenceService.js` — Cung cấp API lấy hồ sơ minh chứng, hóa đơn và hình ảnh giải ngân.
- `src/services/proposalService.js` — Cung cấp API quản lý và tạo đề xuất tài trợ ngoài danh mục.

### Sửa đổi
- `src/services/authService.js` — Thêm hàm `register` tạo tài khoản Nhà hảo tâm mới vào mock data.
- `src/services/donationService.js` — Thêm alias `register` và `propose` phục vụ đăng ký và đề xuất tài trợ.
- `src/components/Header/Header.jsx` — Cập nhật menu điều hướng và nút chức năng phù hợp cho Guest (Trang chủ, Bài gây quỹ, Sao kê, Học sinh, Đăng ký, Đăng nhập) và Donor.
- `src/components/Sidebar/Sidebar.jsx` — Cập nhật menu dọc cho Nhà hảo tâm dẫn tới đủ 8 chức năng của Task 2.
- `src/routes/AppRoutes.jsx` — Tích hợp `GuestRoutes` và `DonorRoutes` vào luồng ứng dụng chính.

### Ghi chú
- Hệ thống hỗ trợ liên tục giữa 2 vai trò: Khách xem chi tiết bài tài trợ -> bấm nút -> chuyển sang màn hình đăng nhập -> quay lại đúng form đăng ký/đề xuất tài trợ.
- Build kiểm thử production bằng Vite hoàn thành xuất sắc: `✓ 118 modules transformed`, không có lỗi cú pháp hoặc cảnh báo lặp.

---

## [2026-10-16 16:18:00] — Cập nhật mock data theo thiết kế CSDL

### Thêm mới
- `src/mock/categories.js` — Danh mục tài trợ theo bảng `DANHMUCTAITRO` (maDanhMuc, tenDanhMuc, donVi, moTa, trangthai, maCanBoCapNhat, ngayTao, ngayCapNhat).
- `src/mock/proposals.js` — Đề xuất tài trợ theo bảng `DEXUATTAITRO` và `CT_DEXUAT` (madexuat, manguoidung, mabaitaitro, trangthai, macanbo, lydotuchoi, ngaygui, ngayxuly, chiTiet[]).
- `src/mock/distributions.js` — Đợt phân bổ theo bảng `DOTPHANBO` và `CT_PHANBO` (maDotphanbo, mabaitaitro, tendot, ngaytrao, trangthai, macanbo, mahieutruong, chiTiet[]).
- `src/mock/evidences.js` — Minh chứng tài liệu/hình ảnh theo bảng `MINHCHUNG` (maMinhchung, mabaitaitro, maDotphanbo, loaitailieu, duongdantep, mota, ngaytailen, manguoitai).

### Sửa đổi
- `src/mock/users.js` — Chuẩn hóa trường theo bảng `NGUOIDUNG` + `VAITRO` (maNguoiDung, maVaiTro, tendangnhap, matkhau, hoten, sdt, email, diachi, trangthai, ngaytao, ngaycapnhat) với đủ 6 vai trò: GUEST, NHT, PH, CBQL, HT, ADMIN và tài khoản demo.
- `src/mock/campaigns.js` — Chuẩn hóa theo bảng `TT_TAITRO` + `CT_TT_TAITRO` (maBaiTaiTro, tieude, noidung, anhbia, trangthai, maCanBo, maHieuTruong, ngaybatdau, ngaykethuc, chiTiet[] gồm maCTBaiTaiTro, maDanhMuc, mucTieu, moTa).
- `src/mock/donations.js` — Chuẩn hóa theo bảng `TAITRO` + `CHITIETTAITRO` (maTaiTro, maNguoiDung, maBaiTaiTro, tenHienThi, trangthai, maCanBo, ghiChu, ngayGui, ngayNhan, chiTiet[] gồm maChiTietTaiTro, maCTBaiTaiTro, dangKy, thucTe, tinhTrang, ghiChu).
- `src/mock/students.js` — Chuẩn hóa theo bảng `HOCSINH` (mahocsinh, mahuuhuynh, hoten, ngaysinh, gioitinh, lop, loaihotro, mota) với 12 học sinh và liên kết khóa ngoại mahuuhuynh trỏ tới phụ huynh trong users.
- `src/mock/feedbacks.js` — Chuẩn hóa theo bảng `PHANHOI` (maPhanhoi, manguoidung, mabaitaitro, madotphanbo, tieude, noidung, noidungtraloi, macanbo, trangthai, ngaygui, ngaytraloi).
- `src/mock/approvals.js` — Đồng bộ hóa theo trường CSDL bảng `TT_TAITRO` (maPheDuyet, maBaiTaiTro, tieude, maCanBo, maHieuTruong, trangthai, ghiChu, ngaygui, ngayduyet).
- `src/utils/constants.js` — Bổ sung mã vai trò chuẩn (NHT, PH, CBQL, HT, ADMIN, GUEST), trạng thái CSDL và nhãn tiếng Việt tương ứng.
- `src/contexts/AuthContext.jsx` — Hỗ trợ cả mã vai trò CSDL (maVaiTro) và route slug để không làm gián đoạn điều hướng giao diện.
- `src/services/authService.js` — Hỗ trợ đăng nhập bằng cả tendangnhap hoặc email và trả về đối tượng an toàn theo schema mới.
- `src/services/campaignService.js` — Map các truy vấn và bộ lọc theo `maBaiTaiTro`, `tieude`, `trangthai`, `chiTiet`.
- `src/services/donationService.js` — Map các truy vấn theo `maTaiTro`, `maBaiTaiTro`, `maNguoiDung`, tính toán tổng tiền dựa trên `chiTiet`.
- `src/services/studentService.js` — Map các truy vấn theo `mahocsinh`, `mahuuhuynh`, `lop`, `loaihotro`.
- `src/services/feedbackService.js` — Map các truy vấn theo `maPhanhoi`, `manguoidung`, `mabaitaitro`, `trangthai`.
- `src/services/approvalService.js` — Map các truy vấn theo `maPheDuyet`, `maBaiTaiTro`, `trangthai`.
- `src/components/Header/Header.jsx` & `src/components/Sidebar/Sidebar.jsx` — Đảm bảo tương thích mượt mà giữa mã vai trò CSDL và điều hướng menu.

### Ghi chú
- Tất cả các khóa ngoại (Foreign Keys) giữa các bảng giả lập đã được liên kết chặt chẽ: `maNguoiDung` (NGUOIDUNG) ↔ `mahuuhuynh` (HOCSINH), `maNguoiDung` ↔ `TAITRO`, `maBaiTaiTro` ↔ `CT_TT_TAITRO` / `TAITRO` / `DEXUATTAITRO` / `DOTPHANBO` / `MINHCHUNG` / `PHANHOI`.
- Build Vite chạy thành công tuyệt đối 0 lỗi.

---

## [2026-10-16 16:09:00] — Task 1: Khởi tạo dự án, Components dùng chung, Contexts, Services, Routes

### Thêm mới

#### 🏗️ Khởi tạo project
- `package.json` — Vite + React project với các dependencies: react-router-dom, axios, react-icons
- `.env` — Biến môi trường VITE_API_URL=http://localhost:8080/api

#### 🎨 Style toàn cục
- `src/index.css` — CSS variables (--primary, --secondary, --bg, --text, --accent, --border, --success, --warning, --danger), Google Fonts (Inter + Nunito), Reset CSS, utility classes (.container, .btn, .card, .grid, .flex, .badge, ...)
- `src/App.css` — Layout wrapper cho root element

#### 📦 Components dùng chung (`src/components/`)
- `Button/Button.jsx` + `Button.css` — Variant: primary, secondary, outline, danger, ghost; Size: sm, md, lg; loading state
- `Input/Input.jsx` + `Input.css` — Text, email, password (show/hide), number, textarea; label, error, required, helpText
- `Modal/Modal.jsx` + `Modal.css` — Title, children, footer, onClose, overlay click; size: sm, md, lg, xl
- `Card/Card.jsx` + `Card.css` — Title, children, footer, hoverable, clickable
- `Table/Table.jsx` + `Table.css` — Columns + data + loading skeleton + empty state + row click
- `Pagination/Pagination.jsx` + `Pagination.css` — Smart pagination với ellipsis
- `ProgressBar/ProgressBar.jsx` + `ProgressBar.css` — Percent, showLabel, auto color by progress
- `Tabs/Tabs.jsx` + `Tabs.css` — Tabs array + active + onChange + badge + icon
- `Header/Header.jsx` + `Header.css` — Logo, nav role-aware, user menu dropdown, mobile toggle
- `Footer/Footer.jsx` + `Footer.css` — Multi-column layout, school info, social links
- `Sidebar/Sidebar.jsx` + `Sidebar.css` — Menu theo role, collapsible, tooltip khi collapsed
- `Notification/Notification.jsx` + `Notification.css` — Toast provider (success, error, warning, info), useNotification hook
- `EmptyState/EmptyState.jsx` + `EmptyState.css` — Icon, title, description, action button
- `Loading/Loading.jsx` + `Loading.css` — Spinner + Skeleton loader
- `Lightbox/Lightbox.jsx` + `Lightbox.css` — Xem ảnh phóng to, navigation, zoom, keyboard support
- `ChatBox/ChatBox.jsx` + `ChatBox.css` — Bubble góc phải dưới, typing indicator, auto-scroll

#### 🔐 Contexts (`src/contexts/`)
- `AuthContext.jsx` — State: user, role, isAuthenticated, loading; Methods: login(), logout(), hasRole(); Khôi phục session từ localStorage
- `ChatContext.jsx` — State: messages, loading, isOpen; Methods: sendMessage(), clearHistory(), toggleChat()

#### ⚙️ Services (`src/services/`)
- `api.js` — Axios instance với baseURL từ env, interceptor gắn token, xử lý 401
- `authService.js` — login(), logout(), getCurrentUser(), updateProfile(), changePassword() — mock
- `campaignService.js` — getAllCampaigns(), getCampaignById(), createCampaign(), updateCampaign(), deleteCampaign(), getActiveCampaigns()
- `donationService.js` — getAllDonations(), getDonationById(), createDonation(), confirmDonation(), cancelDonation(), getDonationStats()
- `studentService.js` — getAllStudents(), getStudentById(), getStudentsByParent(), createStudent(), updateStudent(), deleteStudent()
- `feedbackService.js` — getAllFeedbacks(), getFeedbackById(), createFeedback(), respondFeedback()
- `approvalService.js` — getAllApprovals(), getApprovalById(), requestApproval(), reviewApproval()
- `assistantService.js` — sendMessage() với mock responses theo role (donor/parent/fundraiser)

#### 📊 Mock data (`src/mock/`)
- `users.js` — 5 tài khoản demo (donor, parent, fundraiser, principal, admin)
- `campaigns.js` — 8 chiến dịch gây quỹ (active, completed, pending, draft, rejected)
- `donations.js` — 6 giao dịch quyên góp với các trạng thái khác nhau
- `students.js` — 10 học sinh với thông tin khuyết tật, lớp, phụ huynh
- `feedbacks.js` — 4 phản hồi từ donor và parent
- `approvals.js` — 7 yêu cầu phê duyệt chiến dịch

#### 🛣️ Routes (`src/routes/`)
- `AppRoutes.jsx` — 6 prefix route: /guest/*, /donor/*, /parent/*, /fundraiser/*, /principal/*, /admin/* với placeholder pages
- `PrivateRoute.jsx` — Bảo vệ route theo role, redirect về login hoặc dashboard phù hợp

#### 🔧 Utils (`src/utils/`)
- `constants.js` — ROLES, CAMPAIGN_STATUS, DONATION_STATUS, APPROVAL_STATUS, FEEDBACK_STATUS, labels, APP_NAME, SCHOOL_NAME, ...
- `formatCurrency.js` — formatCurrency(), formatCurrencyShort(), parseCurrency()
- `formatDate.js` — formatDate(), formatDateTime(), formatRelativeTime(), daysRemaining()
- `validators.js` — validateEmail(), validatePassword(), validatePhone(), validateRequired(), validateMinAmount(), validateUrl(), validateImageFile()

#### 🗂️ App directory structure (`src/app/`)
- `guest/`, `donor/`, `parent/`, `fundraiser/`, `principal/`, `admin/` — placeholder, sẽ hoàn thiện ở Task 2-5

#### 🔗 Entry points
- `src/App.jsx` — Root component với BrowserRouter + AuthProvider + NotificationProvider + ChatProvider + AppRoutes + ChatBox
- `src/main.jsx` — Entry point với StrictMode

### Ghi chú
- Tất cả services dùng **mock data** với setTimeout để giả lập API call, sẵn sàng thay thế bằng BE thực
- Auth dùng **localStorage** để persist session
- 5 tài khoản test: donor@demo.com, parent@demo.com, fundraiser@demo.com, principal@demo.com, admin@demo.com — tất cả password: `123456`
- CSS thuần, không dùng Tailwind hay Bootstrap
- Component ChatBox được tích hợp toàn cục, visible trên mọi trang
