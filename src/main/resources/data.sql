-- ===================================================================
-- DỮ LIỆU MẪU (5 DÒNG / BẢNG): data.sql
-- Mật khẩu mặc định của các tài khoản: 123456
-- Chuỗi mã hóa BCrypt của 123456: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
-- ===================================================================

-- 1. BẢNG vaitro (5 dòng)
INSERT INTO vaitro (mavaitro, tenvaitro, mota) VALUES
(1, 'ADMIN', 'Quản trị viên hệ thống toàn quyền'),
(2, 'HIEUTRUONG', 'Hiệu trưởng - Phê duyệt các bài gây quỹ và đợt phân bổ'),
(3, 'CANBO', 'Cán bộ / Giáo viên phụ trách điều phối gây quỹ'),
(4, 'NHATAITRO', 'Nhà hảo tâm, tổ chức đóng góp từ thiện'),
(5, 'PHUHUYNH', 'Phụ huynh hoặc người giám hộ học sinh');

-- 2. BẢNG nguoidung (5 dòng)
INSERT INTO nguoidung (manguoidung, mavaitro, tendangnhap, matkhau, hoten, sdt, email, diachi, trangthai, ngaytao, ngaycapnhat) VALUES
(1, 1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Quản Trị Viên Hệ Thống', '0901111222', 'admin@ndc.edu.vn', '184 Nguyễn Chí Thanh, P.2, Q.10, TP.HCM', 'HOAT_DONG', '2026-01-01 08:00:00', '2026-01-01 08:00:00'),
(2, 2, 'hieutruong', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Thầy Nguyễn Văn Nam (Hiệu Trưởng)', '0903333444', 'hieutruong@ndc.edu.vn', 'Quận 3, TP.HCM', 'HOAT_DONG', '2026-01-02 08:00:00', '2026-01-02 08:00:00'),
(3, 3, 'canbo_thao', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Cô Lê Phương Thảo (Cán Bộ)', '0905555666', 'lephuongthao@ndc.edu.vn', 'Quận 10, TP.HCM', 'HOAT_DONG', '2026-01-03 08:00:00', '2026-01-03 08:00:00'),
(4, 4, 'nhataitro_tam', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Ông Trần Minh Tâm (Mạnh Thường Quân)', '0907777888', 'minhtam.tran@gmail.com', 'Quận 1, TP.HCM', 'HOAT_DONG', '2026-01-04 08:00:00', '2026-01-04 08:00:00'),
(5, 5, 'phuhuynh_mai', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Bà Hoàng Thị Mai (Phụ Huynh)', '0909999000', 'hoangmai.ph@gmail.com', 'Quận Bình Thạnh, TP.HCM', 'HOAT_DONG', '2026-01-05 08:00:00', '2026-01-05 08:00:00');

-- 3. BẢNG hocsinh (5 dòng)
INSERT INTO hocsinh (mahocsinh, maphuhuynh, hoten, ngaysinh, gioitinh, lop, loaihotro, mota) VALUES
(1, 5, 'Nguyễn Hoàng Đức', '2015-05-12', 'NAM', 'Lớp 3A-KT', 'Khiếm thị hoàn toàn', 'Học sinh có tinh thần vượt khó, đam mê học vi tính bằng phần mềm chuyên dụng'),
(2, 5, 'Nguyễn Hoàng Mai Anh', '2017-09-20', 'NU', 'Lớp 1B-KT', 'Nhìn kém bẩm sinh', 'Cần sách giáo khoa chữ lớn và kính lúp trợ thị điện tử'),
(3, 5, 'Trần Tuấn Kiệt', '2014-03-15', 'NAM', 'Lớp 4A-KT', 'Khiếm thị & khuyết tật vận động nhẹ', 'Gia cảnh khó khăn, cần hỗ trợ bữa ăn bán trú và xe lăn hỗ trợ'),
(4, 5, 'Lê Thị Thu Thảo', '2016-11-08', 'NU', 'Lớp 2A-KT', 'Khiếm thị hoàn toàn', 'Có năng khiếu âm nhạc dân tộc đặc biệt xuất sắc'),
(5, 5, 'Phạm Gia Bảo', '2018-02-28', 'NAM', 'Lớp Mầm-KT', 'Khiếm thị bẩm sinh', 'Cần học cụ chuyên biệt cho trẻ can thiệp sớm');

-- 4. BẢNG tt_taitro (5 dòng)
INSERT INTO tt_taitro (mabaitaitro, tieude, noidung, anhbia, muctieu, tongtiendanhan, trangthai, macanbo, mahieutruong, ngaybatdau, ngaykethuc) VALUES
(1, 'Trang bị phòng vi tính chuyên biệt cho học sinh khiếm thị', 'Dự án nhằm mua sắm 20 bộ máy vi tính có cài đặt màn hình chữ nổi Braille và tai nghe chuyên dụng phục vụ việc học tin học cho các em.', '/uploads/banners/may-tinh-khiem-thi.jpg', 150000000.00, 85000000.00, 'DADUYET', 3, 2, '2026-01-10 08:00:00', '2026-05-30 23:59:59'),
(2, 'Quỹ học bổng Ánh Sáng Tương Lai năm học 2026', 'Trao 50 suất học bổng vượt khó cho học sinh có hoàn cảnh đặc biệt nghèo khó tiếp tục đến trường học chữ và học nghề.', '/uploads/banners/hoc-bong-anh-sang.jpg', 100000000.00, 100000000.00, 'KETTHUC', 3, 2, '2026-01-15 08:00:00', '2026-04-15 17:00:00'),
(3, 'Cải tạo bếp ăn bán trú và nước sạch vệ sinh học đường', 'Cải tạo hệ thống lọc nước RO công nghiệp và nâng cao dinh dưỡng bữa ăn trưa hàng ngày cho 120 học sinh bán trú.', '/uploads/banners/bep-an-dinh-duong.jpg', 80000000.00, 35000000.00, 'DADUYET', 3, 2, '2026-02-01 08:00:00', '2026-06-30 23:59:59'),
(4, 'Sách giáo khoa chữ nổi Braille và gậy định hướng đón năm học mới', 'In ấn 200 bộ sách giáo khoa chữ Braille và tặng 100 cây gậy định hướng thông minh cho học sinh tiểu học.', '/uploads/banners/sach-braille.jpg', 60000000.00, 15000000.00, 'DADUYET', 3, 2, '2026-02-20 08:00:00', '2026-08-30 23:59:59'),
(5, 'Tài trợ dụng cụ thể thao và phát triển năng khiếu âm nhạc', 'Trang bị đàn organ, sáo, đàn tranh và bóng chuông thi đấu cho đội văn thể mỹ trường Nguyễn Đình Chiểu.', '/uploads/banners/am-nhac-the-thao.jpg', 50000000.00, 0.00, 'NHAP', 3, 2, '2026-03-01 08:00:00', '2026-09-01 23:59:59');

-- 5. BẢNG taitro (5 dòng)
INSERT INTO taitro (maitaitro, manguoidung, mabaitaitro, tenhienthi, soitendk, soitentt, anhgiaodich, trangthai, macanbo, ghichu, ngaygui, ngaynhan) VALUES
(1, 4, 1, 'Trần Minh Tâm', 50000000.00, 50000000.00, '/uploads/receipts/bill_01.jpg', 'DANHAN', 3, 'Ủng hộ phòng máy vi tính cho các cháu', '2026-01-12 09:30:00', '2026-01-12 10:00:00'),
(2, 4, 1, 'Nhóm Thiện Nguyện Sen Vàng', 35000000.00, 35000000.00, '/uploads/receipts/bill_02.jpg', 'DANHAN', 3, 'Chuyển khoản ủng hộ đợt 1', '2026-01-20 14:15:00', '2026-01-20 15:00:00'),
(3, NULL, 2, 'Một nhà hảo tâm ẩn danh', 100000000.00, 100000000.00, '/uploads/receipts/bill_03.jpg', 'DANHAN', 3, 'Tài trợ toàn bộ 50 suất học bổng', '2026-01-25 11:00:00', '2026-01-25 11:30:00'),
(4, 4, 3, 'Gia đình Bác Minh Tâm', 35000000.00, 35000000.00, '/uploads/receipts/bill_04.jpg', 'DANHAN', 3, 'Ủng hộ cải tạo bếp ăn bán trú', '2026-02-10 16:45:00', '2026-02-10 17:00:00'),
(5, NULL, 4, 'Công ty TNHH Phát Triển Công Nghệ X', 15000000.00, 15000000.00, '/uploads/receipts/bill_05.jpg', 'CHODUYET', 3, 'Đang chờ sao kê ngân hàng đối soát', '2026-03-01 08:30:00', NULL);

-- 6. BẢNG dexuattaitro (5 dòng)
INSERT INTO dexuattaitro (madexuat, manguoidung, mabaitaitro, tieude, soitendx, mucdichsd, trangthai, macanbo, ngayxuly, lydotuchoi, ngaygui) VALUES
(1, 5, 2, 'Đề xuất hỗ trợ học phí và dụng cụ cho em Nguyễn Hoàng Đức', 3000000.00, 'Gia đình khó khăn, đề xuất xin học bổng Ánh Sáng Tương Lai học kỳ 2', 'DADUYET', 3, '2026-02-05 14:00:00', NULL, '2026-02-01 10:00:00'),
(2, 5, 2, 'Đề xuất xin hỗ trợ kinh phí phẫu thuật mắt cho em Mai Anh', 10000000.00, 'Bác sĩ chỉ định phẫu thuật can thiệp giảm thoái hóa thị lực', 'CHODUYET', 3, NULL, NULL, '2026-02-15 09:20:00'),
(3, 5, 3, 'Đề xuất miễn giảm chi phí bán trú quý 2 cho em Trần Tuấn Kiệt', 2500000.00, 'Mẹ đơn thân mất việc làm, không đủ chi trả tiền ăn trưa', 'DADUYET', 3, '2026-02-18 10:30:00', NULL, '2026-02-16 11:00:00'),
(4, 5, 4, 'Đề xuất xin cấp gậy thông minh cho học sinh lớp 2A', 1500000.00, 'Gậy cũ của em Thu Thảo bị gãy trong quá trình tập di chuyển', 'DADUYET', 3, '2026-02-25 15:00:00', NULL, '2026-02-22 08:45:00'),
(5, 5, NULL, 'Đề xuất mở lớp dạy đàn guitar miễn phí cuối tuần', 5000000.00, 'Kinh phí mời giảng viên thanh nhạc ngoài giờ', 'TUCHOI', 3, '2026-03-02 16:00:00', 'Hiện nhà trường đã có giáo viên âm nhạc biên chế phụ trách', '2026-02-28 13:10:00');

-- 7. BẢNG dotphanbo (5 dòng)
INSERT INTO dotphanbo (madotphanbo, mabaitaitro, tendot, tongtien, ngaytrao, trangthai, macanbo, mahieutruong) VALUES
(1, 2, 'Đợt 1 - Trao 25 suất học bổng học kỳ 1 năm học 2025-2026', 50000000.00, '2026-02-10 09:00:00', 'DATRAO', 3, 2),
(2, 2, 'Đợt 2 - Trao 25 suất học bổng còn lại nhân dịp 8/3', 50000000.00, '2026-03-08 09:00:00', 'DATRAO', 3, 2),
(3, 1, 'Đợt 1 - Mua sắm 10 máy vi tính và bàn ghế chuyên dụng', 75000000.00, '2026-03-15 14:00:00', 'DADUYET', 3, 2),
(4, 3, 'Đợt 1 - Lắp đặt hệ thống lọc nước uống RO tinh khiết', 30000000.00, '2026-03-20 08:30:00', 'CHODUYET', 3, 2),
(5, 4, 'Đợt 1 - Trao 50 gậy định hướng và 100 tập sách Braille', 15000000.00, '2026-04-05 08:00:00', 'CHODUYET', 3, 2);

-- 8. BẢNG ct_phanbo (5 dòng)
INSERT INTO ct_phanbo (machitietphanbo, madotphanbo, mahocsinh, sotien, nguoinhan, ngaynhan, ghichu) VALUES
(1, 1, 1, 2000000.00, 'Hoàng Thị Mai (Mẹ nhận thay)', '2026-02-10 09:30:00', 'Học bổng vượt khó kỳ 1'),
(2, 1, 2, 2000000.00, 'Hoàng Thị Mai (Mẹ nhận thay)', '2026-02-10 09:35:00', 'Học bổng vượt khó kỳ 1'),
(3, 1, 3, 2000000.00, 'Nguyễn Thị Hồng (Mẹ nhận thay)', '2026-02-10 09:40:00', 'Học bổng trợ cấp bán trú'),
(4, 2, 4, 2000000.00, 'Lê Văn Tám (Bố nhận thay)', '2026-03-08 09:20:00', 'Học bổng tài năng âm nhạc'),
(5, 2, 5, 2000000.00, 'Phạm Quốc Cường (Bố nhận thay)', '2026-03-08 09:25:00', 'Học bổng can thiệp sớm');

-- 9. BẢNG minhchung (5 dòng)
INSERT INTO minhchung (maminhchung, mabaitaitro, madotphanbo, loaitailieu, duongdantep, mota, ngaytailen, manguoidung) VALUES
(1, 2, 1, 'CHUNGTU', '/uploads/proofs/bien_ban_trao_hoc_bong_dot1.pdf', 'Biên bản có chữ ký của Hiệu trưởng, Cán bộ và Đại diện phụ huynh', '2026-02-10 11:30:00', 3),
(2, 2, 1, 'HINHANH', '/uploads/proofs/hinh_anh_le_trao_hoc_bong_dot1.jpg', 'Ảnh chụp các em học sinh nhận biểu trưng học bổng tại sân trường', '2026-02-10 11:45:00', 3),
(3, 1, 3, 'HOADON', '/uploads/proofs/hoa_don_vat_phong_may_tinh.pdf', 'Hóa đơn đỏ mua 10 máy vi tính hãng HP từ nhà cung cấp', '2026-03-16 10:00:00', 3),
(4, 2, 2, 'CHUNGTU', '/uploads/proofs/danh_sach_ky_nhan_hoc_bong_dot2.pdf', 'Danh sách có chữ ký phụ huynh nhận tiền mặt đợt 2', '2026-03-08 12:00:00', 3),
(5, 3, NULL, 'CHUNGTU', '/uploads/proofs/hop_dong_thi_cong_loc_nuoc.pdf', 'Hợp đồng và phiếu tạm ứng thi công hệ thống nước RO', '2026-03-18 15:20:00', 3);

-- 10. BẢNG phanhoi (5 dòng)
INSERT INTO phanhoi (maphanhoi, manguoidung, mabaitaitro, madotphanbo, tieude, noidung, noidungtraloi, macanbo, trangthai, ngaygui, ngaytraloi) VALUES
(1, 4, 1, NULL, 'Tôi muốn đóng góp trực tiếp thiết bị máy vi tính có được không?', 'Chào nhà trường, công ty tôi có sẵn 5 bộ máy vi tính mới nguyên seal, liệu có thể bàn giao trực tiếp thay vì chuyển khoản không?', 'Dạ kính chào quý nhà hảo tâm. Nhà trường hoàn toàn hoan nghênh và sẵn sàng tiếp nhận hiện vật. Xin mời quý vị liên hệ cô Thảo qua số 0905555666 để sắp xếp buổi tiếp nhận ạ.', 3, 'DAXULY', '2026-01-15 09:00:00', '2026-01-15 14:30:00'),
(2, 5, 2, 1, 'Thời gian nhận học bổng đợt 2 của em Mai Anh', 'Cho tôi hỏi đợt 2 khi nào trao và địa điểm tổ chức ở đâu?', 'Chào chị Mai, đợt 2 dự kiến tổ chức tại Hội trường A lúc 09h00 sáng ngày 08/03/2026 ạ.', 3, 'DAXULY', '2026-02-20 10:00:00', '2026-02-20 16:00:00'),
(3, 4, 3, NULL, 'Tiến độ thi công hệ thống nước sạch thế nào rồi?', 'Tôi là Tâm, tôi muốn cập nhật hình ảnh thi công hệ thống lọc nước bán trú.', 'Kính gửi Bác Tâm, nhà trường đang hoàn tất nghiệm thu đợt 1 và đã đăng ảnh minh chứng trên trang chi tiết dự án ạ.', 3, 'DAXULY', '2026-03-21 08:30:00', '2026-03-21 11:15:00'),
(4, 5, NULL, NULL, 'Thủ tục xin nhập học nội trú cho trẻ khiếm thị ở tỉnh', 'Tôi ở Tiền Giang, muốn gửi cháu vào học lớp 1 khiếm thị thì cần những hồ sơ gì?', NULL, NULL, 'CHOXULY', '2026-03-25 14:20:00', NULL),
(5, 4, 4, NULL, 'Đề xuất tài trợ thêm sách nói Audio kỹ thuật số', 'Bên cạnh sách chữ nổi, tôi muốn tài trợ thêm 50 máy phát sách nói Audio cầm tay cho học sinh.', NULL, NULL, 'CHOXULY', '2026-03-26 16:00:00', NULL);
