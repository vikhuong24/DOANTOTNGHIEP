-- ===================================================================
-- DATABASE SCHEMA: gay_quy_db
-- Hệ thống gây quỹ trường phổ thông chuyên biệt Nguyễn Đình Chiểu
-- QUY TẮC ĐẶT TÊN: Tên bảng và tên cột viết thường toàn bộ, viết liền không dấu gạch dưới
-- ===================================================================

-- Tắt kiểm tra khóa ngoại để drop theo thứ tự an toàn
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS phanhoi;
DROP TABLE IF EXISTS minhchung;
DROP TABLE IF EXISTS ct_phanbo;
DROP TABLE IF EXISTS dotphanbo;
DROP TABLE IF EXISTS dexuattaitro;
DROP TABLE IF EXISTS taitro;
DROP TABLE IF EXISTS tt_taitro;
DROP TABLE IF EXISTS hocsinh;
DROP TABLE IF EXISTS nguoidung;
DROP TABLE IF EXISTS vaitro;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. BẢNG vaitro
CREATE TABLE vaitro (
    mavaitro BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenvaitro VARCHAR(50) NOT NULL UNIQUE,
    mota VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG nguoidung
CREATE TABLE nguoidung (
    manguoidung BIGINT AUTO_INCREMENT PRIMARY KEY,
    mavaitro BIGINT NOT NULL,
    tendangnhap VARCHAR(50) UNIQUE,
    matkhau VARCHAR(255) NOT NULL,
    hoten VARCHAR(100) NOT NULL,
    sdt VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    diachi VARCHAR(255),
    trangthai VARCHAR(30) NOT NULL DEFAULT 'HOAT_DONG',
    ngaytao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_nguoidung_vaitro FOREIGN KEY (mavaitro) REFERENCES vaitro (mavaitro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG hocsinh
CREATE TABLE hocsinh (
    mahocsinh BIGINT AUTO_INCREMENT PRIMARY KEY,
    maphuhuynh BIGINT,
    hoten VARCHAR(100) NOT NULL,
    ngaysinh DATE,
    gioitinh VARCHAR(10),
    lop VARCHAR(20),
    loaihotro VARCHAR(100),
    mota TEXT,
    CONSTRAINT fk_hocsinh_phuhuynh FOREIGN KEY (maphuhuynh) REFERENCES nguoidung (manguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG tt_taitro
CREATE TABLE tt_taitro (
    mabaitaitro BIGINT AUTO_INCREMENT PRIMARY KEY,
    tieude VARCHAR(255) NOT NULL,
    noidung LONGTEXT NOT NULL,
    anhbia VARCHAR(255),
    muctieu DECIMAL(15,2) NOT NULL DEFAULT 0,
    tongtiendanhan DECIMAL(15,2) NOT NULL DEFAULT 0,
    trangthai VARCHAR(30) NOT NULL DEFAULT 'DANG_VAN_DONG',
    macanbo BIGINT NOT NULL,
    mahieutruong BIGINT,
    ngaybatdau DATETIME,
    ngaykethuc DATETIME,
    CONSTRAINT fk_tttaitro_canbo FOREIGN KEY (macanbo) REFERENCES nguoidung (manguoidung),
    CONSTRAINT fk_tttaitro_hieutruong FOREIGN KEY (mahieutruong) REFERENCES nguoidung (manguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG taitro
CREATE TABLE taitro (
    maitaitro BIGINT AUTO_INCREMENT PRIMARY KEY,
    manguoidung BIGINT,
    mabaitaitro BIGINT NOT NULL,
    tenhienthi VARCHAR(100),
    soitendk DECIMAL(15,2) NOT NULL DEFAULT 0,
    soitentt DECIMAL(15,2) NOT NULL DEFAULT 0,
    anhgiaodich VARCHAR(255),
    trangthai VARCHAR(30) NOT NULL DEFAULT 'CHO_XAC_NHAN',
    macanbo BIGINT,
    ghichu TEXT,
    ngaygui DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngaynhan DATETIME,
    CONSTRAINT fk_taitro_nguoidung FOREIGN KEY (manguoidung) REFERENCES nguoidung (manguoidung),
    CONSTRAINT fk_taitro_baitaitro FOREIGN KEY (mabaitaitro) REFERENCES tt_taitro (mabaitaitro),
    CONSTRAINT fk_taitro_canbo FOREIGN KEY (macanbo) REFERENCES nguoidung (manguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG dexuattaitro
CREATE TABLE dexuattaitro (
    madexuat BIGINT AUTO_INCREMENT PRIMARY KEY,
    manguoidung BIGINT NOT NULL,
    mabaitaitro BIGINT,
    tieude VARCHAR(255) NOT NULL,
    soitendx DECIMAL(15,2) NOT NULL DEFAULT 0,
    mucdichsd TEXT,
    trangthai VARCHAR(30) NOT NULL DEFAULT 'CHO_DUYET',
    macanbo BIGINT,
    ngayxuly DATETIME,
    lydotuchoi TEXT,
    ngaygui DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dexuat_nguoidung FOREIGN KEY (manguoidung) REFERENCES nguoidung (manguoidung),
    CONSTRAINT fk_dexuat_baitaitro FOREIGN KEY (mabaitaitro) REFERENCES tt_taitro (mabaitaitro),
    CONSTRAINT fk_dexuat_canbo FOREIGN KEY (macanbo) REFERENCES nguoidung (manguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG dotphanbo
CREATE TABLE dotphanbo (
    madotphanbo BIGINT AUTO_INCREMENT PRIMARY KEY,
    mabaitaitro BIGINT NOT NULL,
    tendot VARCHAR(255) NOT NULL,
    tongtien DECIMAL(15,2) NOT NULL DEFAULT 0,
    ngaytrao DATETIME,
    trangthai VARCHAR(30) NOT NULL DEFAULT 'LEN_KE_HOACH',
    macanbo BIGINT NOT NULL,
    mahieutruong BIGINT,
    CONSTRAINT fk_dotphanbo_baitaitro FOREIGN KEY (mabaitaitro) REFERENCES tt_taitro (mabaitaitro),
    CONSTRAINT fk_dotphanbo_canbo FOREIGN KEY (macanbo) REFERENCES nguoidung (manguoidung),
    CONSTRAINT fk_dotphanbo_hieutruong FOREIGN KEY (mahieutruong) REFERENCES nguoidung (manguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG ct_phanbo
CREATE TABLE ct_phanbo (
    machitietphanbo BIGINT AUTO_INCREMENT PRIMARY KEY,
    madotphanbo BIGINT NOT NULL,
    mahocsinh BIGINT NOT NULL,
    sotien DECIMAL(15,2) NOT NULL DEFAULT 0,
    nguoinhan VARCHAR(100),
    ngaynhan DATETIME,
    ghichu TEXT,
    CONSTRAINT fk_ctphanbo_dotphanbo FOREIGN KEY (madotphanbo) REFERENCES dotphanbo (madotphanbo),
    CONSTRAINT fk_ctphanbo_hocsinh FOREIGN KEY (mahocsinh) REFERENCES hocsinh (mahocsinh)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BẢNG minhchung
CREATE TABLE minhchung (
    maminhchung BIGINT AUTO_INCREMENT PRIMARY KEY,
    mabaitaitro BIGINT,
    madotphanbo BIGINT,
    loaitailieu VARCHAR(50),
    duongdantep VARCHAR(255) NOT NULL,
    mota TEXT,
    ngaytailen DATETIME DEFAULT CURRENT_TIMESTAMP,
    manguoidung BIGINT NOT NULL,
    CONSTRAINT fk_minhchung_baitaitro FOREIGN KEY (mabaitaitro) REFERENCES tt_taitro (mabaitaitro),
    CONSTRAINT fk_minhchung_dotphanbo FOREIGN KEY (madotphanbo) REFERENCES dotphanbo (madotphanbo),
    CONSTRAINT fk_minhchung_nguoidung FOREIGN KEY (manguoidung) REFERENCES nguoidung (manguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BẢNG phanhoi
CREATE TABLE phanhoi (
    maphanhoi BIGINT AUTO_INCREMENT PRIMARY KEY,
    manguoidung BIGINT NOT NULL,
    mabaitaitro BIGINT,
    madotphanbo BIGINT,
    tieude VARCHAR(255) NOT NULL,
    noidung TEXT NOT NULL,
    noidungtraloi TEXT,
    macanbo BIGINT,
    trangthai VARCHAR(30) NOT NULL DEFAULT 'CHO_XU_LY',
    ngaygui DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngaytraloi DATETIME,
    CONSTRAINT fk_phanhoi_nguoidung FOREIGN KEY (manguoidung) REFERENCES nguoidung (manguoidung),
    CONSTRAINT fk_phanhoi_baitaitro FOREIGN KEY (mabaitaitro) REFERENCES tt_taitro (mabaitaitro),
    CONSTRAINT fk_phanhoi_dotphanbo FOREIGN KEY (madotphanbo) REFERENCES dotphanbo (madotphanbo),
    CONSTRAINT fk_phanhoi_canbo FOREIGN KEY (macanbo) REFERENCES nguoidung (manguoidung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
