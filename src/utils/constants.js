// Hằng số dùng chung toàn hệ thống - Chuẩn hóa theo Database Spring Boot & Frontend
// Trường Phổ Thông Chuyên Biệt Nguyễn Đình Chiểu Đà Nẵng

// 1. Vai trò chuẩn theo CSDL (Bảng VAITRO: 1: ADMIN, 2: HIEUTRUONG, 3: CANBO, 4: NHATAITRO, 5: PHUHUYNH)
export const ROLES = {
  ADMIN: 'ADMIN',
  HIEUTRUONG: 'HIEUTRUONG',
  CANBO: 'CANBO',
  NHATAITRO: 'NHATAITRO',
  PHUHUYNH: 'PHUHUYNH',

  // Viết tắt nghiệp vụ
  HT: 'HIEUTRUONG',
  CBQL: 'CANBO',
  NHT: 'NHATAITRO',
  PH: 'PHUHUYNH',
  GUEST: 'GUEST',

  // Tiếng Anh & Route Aliases
  DONOR: 'NHATAITRO',
  PARENT: 'PHUHUYNH',
  FUNDRAISER: 'CANBO',
  PRINCIPAL: 'HIEUTRUONG',

  donor: 'NHATAITRO',
  parent: 'PHUHUYNH',
  fundraiser: 'CANBO',
  principal: 'HIEUTRUONG',
  admin: 'ADMIN',
  guest: 'GUEST',
};

// Map vai trò sang route prefix URL
export const ROLE_ROUTE_PREFIX = {
  // DB Roles
  ADMIN: 'admin',
  HIEUTRUONG: 'principal',
  CANBO: 'fundraiser',
  NHATAITRO: 'donor',
  PHUHUYNH: 'parent',
  // Short codes
  HT: 'principal',
  CBQL: 'fundraiser',
  NHT: 'donor',
  PH: 'parent',
  GUEST: 'guest',
  // Lowercase
  admin: 'admin',
  principal: 'principal',
  fundraiser: 'fundraiser',
  donor: 'donor',
  parent: 'parent',
  guest: 'guest',
};

// Nhãn hiển thị vai trò người dùng
export const ROLE_LABEL = {
  ADMIN: 'Quản trị viên',
  HIEUTRUONG: 'Hiệu trưởng',
  HT: 'Hiệu trưởng',
  CANBO: 'Cán bộ gây quỹ',
  CBQL: 'Cán bộ gây quỹ',
  NHATAITRO: 'Nhà hảo tâm',
  NHT: 'Nhà hảo tâm',
  PHUHUYNH: 'Phụ huynh học sinh',
  PH: 'Phụ huynh học sinh',
  GUEST: 'Khách vãng lai',
  // lowercase
  admin: 'Quản trị viên',
  principal: 'Hiệu trưởng',
  fundraiser: 'Cán bộ gây quỹ',
  donor: 'Nhà hảo tâm',
  parent: 'Phụ huynh học sinh',
  guest: 'Khách vãng lai',
};

// 2. Trạng thái bài tài trợ (Bảng TT_TAITRO: NHAP, CHODUYET, DADUYET, TUCHOI, KETTHUC)
export const CAMPAIGN_STATUS = {
  NHAP: 'NHAP',
  CHODUYET: 'CHODUYET',
  DADUYET: 'DADUYET',
  TUCHOI: 'TUCHOI',
  KETTHUC: 'KETTHUC',
  DANGCHAY: 'DANGCHAY',

  // PascalCase aliases
  Nhap: 'NHAP',
  ChoDuyet: 'CHODUYET',
  DaDuyet: 'DADUYET',
  TuChoi: 'TUCHOI',
  KetThuc: 'KETTHUC',
  DangChay: 'DANGCHAY',

  // Tiếng Anh aliases
  DRAFT: 'NHAP',
  PENDING: 'CHODUYET',
  APPROVED: 'DADUYET',
  REJECTED: 'TUCHOI',
  ACTIVE: 'DADUYET',
  COMPLETED: 'KETTHUC',
};

export const CAMPAIGN_STATUS_LABEL = {
  // DB enum
  NHAP: 'Bản nháp',
  CHODUYET: 'Chờ duyệt',
  DADUYET: 'Đang vận động',
  TUCHOI: 'Từ chối',
  KETTHUC: 'Kết thúc',
  DANGCHAY: 'Đang chạy',
  // PascalCase
  Nhap: 'Bản nháp',
  ChoDuyet: 'Chờ duyệt',
  DaDuyet: 'Đang vận động',
  TuChoi: 'Từ chối',
  KetThuc: 'Kết thúc',
  DangChay: 'Đang chạy',
  // Lowercase
  draft: 'Bản nháp',
  pending: 'Chờ duyệt',
  approved: 'Đang vận động',
  rejected: 'Từ chối',
  active: 'Đang chạy',
  completed: 'Kết thúc',
};
export const CAMPAIGN_STATUS_LABELS = CAMPAIGN_STATUS_LABEL;

// 3. Trạng thái đăng ký tài trợ (Bảng TAITRO: CHODUYET, DADUYET, DANHAN, TUCHOI)
export const DONATION_STATUS = {
  CHODUYET: 'CHODUYET',
  DADUYET: 'DADUYET',
  DANHAN: 'DANHAN',
  TUCHOI: 'TUCHOI',

  // PascalCase
  ChoDuyet: 'CHODUYET',
  DaDuyet: 'DADUYET',
  DaNhan: 'DANHAN',
  TuChoi: 'TUCHOI',
  HoanThanh: 'DANHAN',

  // Aliases
  PENDING: 'CHODUYET',
  CONFIRMED: 'DANHAN',
  CANCELLED: 'TUCHOI',
};

export const DONATION_STATUS_LABEL = {
  CHODUYET: 'Chờ duyệt',
  DADUYET: 'Đã duyệt',
  DANHAN: 'Đã nhận tiền',
  TUCHOI: 'Đã từ chối',

  ChoDuyet: 'Chờ duyệt',
  DaDuyet: 'Đã duyệt',
  DaNhan: 'Đã nhận tiền',
  TuChoi: 'Đã từ chối',
  HoanThanh: 'Hoàn thành',

  pending: 'Chờ duyệt',
  confirmed: 'Đã nhận tiền',
  cancelled: 'Đã từ chối',
};
export const DONATION_STATUS_LABELS = DONATION_STATUS_LABEL;

// 4. Trạng thái đợt phân bổ (Bảng DOTPHANBO: CHODUYET, DADUYET, DATRAO, TUCHOI)
export const DISTRIBUTION_STATUS = {
  CHODUYET: 'CHODUYET',
  DADUYET: 'DADUYET',
  DATRAO: 'DATRAO',
  TUCHOI: 'TUCHOI',

  ChoDuyet: 'CHODUYET',
  DaDuyet: 'DADUYET',
  DaTrao: 'DATRAO',
  TuChoi: 'TUCHOI',
};

export const DISTRIBUTION_STATUS_LABEL = {
  CHODUYET: 'Chờ hiệu trưởng duyệt',
  DADUYET: 'Đã phê duyệt',
  DATRAO: 'Đã trao cho học sinh',
  TUCHOI: 'Từ chối phê duyệt',

  ChoDuyet: 'Chờ hiệu trưởng duyệt',
  DaDuyet: 'Đã phê duyệt',
  DaTrao: 'Đã trao cho học sinh',
  TuChoi: 'Từ chối phê duyệt',
};

// 5. Trạng thái đề xuất tài trợ (Bảng DEXUATTAITRO: CHODUYET, DADUYET, TUCHOI)
export const PROPOSAL_STATUS = {
  CHODUYET: 'CHODUYET',
  DADUYET: 'DADUYET',
  TUCHOI: 'TUCHOI',

  ChoDuyet: 'CHODUYET',
  DaDuyet: 'DADUYET',
  TuChoi: 'TUCHOI',
};

export const PROPOSAL_STATUS_LABEL = {
  CHODUYET: 'Chờ cán bộ duyệt',
  DADUYET: 'Đã chấp thuận',
  TUCHOI: 'Từ chối tiếp nhận',

  ChoDuyet: 'Chờ cán bộ duyệt',
  DaDuyet: 'Đã chấp thuận',
  TuChoi: 'Từ chối tiếp nhận',
};

// 6. Trạng thái phản hồi (Bảng PHANHOI: CHOXULY, DAXULY, TUCHOI)
export const FEEDBACK_STATUS = {
  CHOXULY: 'CHOXULY',
  DAXULY: 'DAXULY',
  TUCHOI: 'TUCHOI',

  ChoXuLy: 'CHOXULY',
  DaXuLy: 'DAXULY',
  TuChoi: 'TUCHOI',
};

export const FEEDBACK_STATUS_LABEL = {
  CHOXULY: 'Chờ xử lý',
  DAXULY: 'Đã phản hồi',
  TUCHOI: 'Từ chối',

  ChoXuLy: 'Chờ xử lý',
  DaXuLy: 'Đã phản hồi',
  TuChoi: 'Từ chối',
};

// 7. Trạng thái người dùng (Bảng NGUOIDUNG: HOATDONG, KHOA)
export const USER_STATUS = {
  HOATDONG: 'HOATDONG',
  KHOA: 'KHOA',
  HoatDong: 'HOATDONG',
  Khoa: 'KHOA',
};

export const USER_STATUS_LABEL = {
  HOATDONG: 'Hoạt động',
  KHOA: 'Đã khóa',
  HoatDong: 'Hoạt động',
  Khoa: 'Đã khóa',
};

// Thông tin trường
export const APP_NAME = 'Quỹ Gây Quỹ Trường Nguyễn Đình Chiểu';
export const SCHOOL_NAME = 'Trường Phổ Thông Chuyên Biệt Nguyễn Đình Chiểu - Đà Nẵng';
export const SCHOOL_ADDRESS = '120 Lê Duẩn, P. Thạch Thang, Q. Hải Châu, TP. Đà Nẵng';
export const SCHOOL_PHONE = '0236 382 1234';
export const SCHOOL_EMAIL = 'contact@ndcdanang.edu.vn';

export const ITEMS_PER_PAGE = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
