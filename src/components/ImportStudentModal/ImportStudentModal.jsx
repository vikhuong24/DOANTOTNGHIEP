import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { FiUploadCloud, FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import { useNotification } from '../Notification/Notification';
import { importStudentsFromExcel } from '../../services/studentService';
import './ImportStudentModal.css';

const TEMPLATE_COLUMNS = [
  { key: 'mahocsinh', header: 'Mã học sinh (bỏ trống nếu thêm mới)', example: '' },
  { key: 'mahuuhuynh', header: 'Mã phụ huynh (FK)', example: 2 },
  { key: 'hoten', header: 'Họ và tên *', example: 'Nguyễn Văn Minh' },
  { key: 'ngaysinh', header: 'Ngày sinh (YYYY-MM-DD)', example: '2015-05-20' },
  { key: 'gioitinh', header: 'Giới tính (Nam/Nu) *', example: 'Nam' },
  { key: 'lop', header: 'Lớp *', example: '3A' },
  { key: 'hoancanh', header: 'Hoàn cảnh / Tật *', example: 'Khiếm thị, Hộ cận nghèo' },
  { key: 'trangthai', header: 'Trạng thái (DangHoc/DaTotNghiep/NghiHoc)', example: 'DangHoc' },
];

const ImportStudentModal = ({ isOpen, onClose, onImportSuccess }) => {
  const { addToast } = useNotification();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetState = () => {
    setFile(null);
    setPreviewData([]);
    setErrorMsg('');
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Tải file template mẫu
  const handleDownloadTemplate = () => {
    try {
      const headers = TEMPLATE_COLUMNS.map((c) => c.key);
      const sampleRow = {};
      TEMPLATE_COLUMNS.forEach((c) => {
        sampleRow[c.key] = c.example;
      });

      const ws = XLSX.utils.json_to_sheet([
        sampleRow,
        {
          mahocsinh: '',
          mahuuhuynh: 7,
          hoten: 'Trần Thị Thu Thảo',
          ngaysinh: '2016-08-12',
          gioitinh: 'Nu',
          lop: '2B',
          hoancanh: 'Khiếm thính, mồ côi cha',
          trangthai: 'DangHoc',
        },
      ], { header: headers });

      // Thiết lập độ rộng cột
      ws['!cols'] = [
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 10 },
        { wch: 30 },
        { wch: 15 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DANH_SACH_HOC_SINH');
      XLSX.writeFile(wb, 'Mau_Import_HocSinh_NDC.xlsx');
      addToast('Đã tải xuống file Excel mẫu', 'success');
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi tải file mẫu', 'error');
    }
  };

  // Đọc file Excel khi người dùng chọn
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMsg('Vui lòng chọn file Excel đúng định dạng (.xlsx, .xls, .csv)');
      return;
    }

    setFile(selectedFile);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawJson.length) {
          setErrorMsg('File Excel không có dữ liệu!');
          setPreviewData([]);
          return;
        }

        // Chuẩn hóa tên cột khớp CSDL
        const normalized = rawJson.map((row) => {
          const item = {};
          Object.keys(row).forEach((k) => {
            const keyLower = k.trim().toLowerCase();
            const val = typeof row[k] === 'string' ? row[k].trim() : row[k];

            if (keyLower.includes('mahocsinh') || keyLower.includes('mã học sinh')) {
              item.mahocsinh = val;
            } else if (keyLower.includes('mahuuhuynh') || keyLower.includes('mã phụ huynh') || keyLower.includes('maphuhuynh')) {
              item.mahuuhuynh = val;
            } else if (keyLower.includes('hoten') || keyLower.includes('họ và tên') || keyLower.includes('tên học sinh')) {
              item.hoten = val;
            } else if (keyLower.includes('ngaysinh') || keyLower.includes('ngày sinh')) {
              // Format ngày
              if (val instanceof Date) {
                item.ngaysinh = val.toISOString().split('T')[0];
              } else {
                item.ngaysinh = val;
              }
            } else if (keyLower.includes('gioitinh') || keyLower.includes('giới tính')) {
              item.gioitinh = val;
            } else if (keyLower === 'lop' || keyLower.includes('lớp')) {
              item.lop = val;
            } else if (keyLower.includes('hoancanh') || keyLower.includes('hoàn cảnh') || keyLower.includes('tật') || keyLower.includes('loại hỗ trợ')) {
              item.hoancanh = val;
            } else if (keyLower.includes('trangthai') || keyLower.includes('trạng thái')) {
              item.trangthai = val;
            } else {
              item[k] = val;
            }
          });

          // Gán mặc định nếu thiếu
          if (!item.hoten && row['hoten']) item.hoten = row['hoten'];
          if (!item.lop && row['lop']) item.lop = row['lop'];
          return item;
        }).filter((item) => !!item.hoten);

        if (!normalized.length) {
          setErrorMsg('Không tìm thấy bản ghi học sinh hợp lệ nào (cột hoten/Họ và tên bắt buộc có dữ liệu)');
          setPreviewData([]);
          return;
        }

        setPreviewData(normalized);
      } catch (err) {
        console.error(err);
        setErrorMsg('Không thể đọc dữ liệu file Excel. Vui lòng kiểm tra lại cấu trúc file.');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  // Xác nhận lưu vào hệ thống
  const handleConfirmImport = async () => {
    if (!previewData.length) return;
    setLoading(true);
    try {
      const result = await importStudentsFromExcel(previewData);
      addToast(
        `Nhập dữ liệu thành công! Thêm mới: ${result.insertedCount}, Cập nhật: ${result.updatedCount}`,
        'success'
      );
      if (onImportSuccess) onImportSuccess(result);
      handleClose();
    } catch (err) {
      console.error(err);
      addToast('Có lỗi xảy ra khi nhập học sinh', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nhập danh sách học sinh từ file Excel"
      size="xl"
      footer={
        <div className="import-modal-footer">
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            disabled={!previewData.length || loading}
            loading={loading}
            onClick={handleConfirmImport}
          >
            <FiCheckCircle /> Xác nhận nhập ({previewData.length} học sinh)
          </Button>
        </div>
      }
    >
      <div className="import-modal-body">
        {/* Hướng dẫn & Tải mẫu */}
        <div className="import-guide-box">
          <div className="import-guide-text">
            <h4>Chuẩn cấu trúc bảng HOCSINH (CSDL chính thức)</h4>
            <p>
              Các cột bắt buộc: <strong>hoten</strong> (Họ và tên), <strong>lop</strong> (Lớp),{' '}
              <strong>gioitinh</strong> (Nam/Nu), <strong>hoancanh</strong> (Hoàn cảnh/Khuyết tật).
            </p>
          </div>
          <button type="button" className="btn-download-template" onClick={handleDownloadTemplate}>
            <FiDownload /> Tải file Excel mẫu (.xlsx)
          </button>
        </div>

        {/* Upload Dropzone */}
        <div
          className={`import-dropzone ${file ? 'import-dropzone--has-file' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div className="import-dropzone-content">
            <FiUploadCloud className="import-dropzone-icon" />
            {file ? (
              <div>
                <strong>{file.name}</strong>
                <p className="import-file-size">{(file.size / 1024).toFixed(1)} KB — Nhấp để chọn file khác</p>
              </div>
            ) : (
              <div>
                <p className="import-dropzone-title">Nhấp hoặc kéo thả file Excel vào đây</p>
                <span className="import-dropzone-sub">Hỗ trợ các định dạng .xlsx, .xls, .csv</span>
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="import-error-msg">
            <FiAlertCircle /> {errorMsg}
          </div>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="import-preview-wrap">
            <div className="import-preview-header">
              <h5>Xem trước dữ liệu ({previewData.length} học sinh sẵn sàng nhập)</h5>
            </div>
            <div className="import-table-container">
              <table className="import-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã HS</th>
                    <th>Mã PH</th>
                    <th>Họ và tên</th>
                    <th>Ngày sinh</th>
                    <th>Giới tính</th>
                    <th>Lớp</th>
                    <th>Hoàn cảnh / Khuyết tật</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 15).map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{row.mahocsinh || <em style={{ color: '#888' }}>Tự tăng</em>}</td>
                      <td>{row.mahuuhuynh || 2}</td>
                      <td><strong>{row.hoten}</strong></td>
                      <td>{row.ngaysinh || '—'}</td>
                      <td>
                        <span className={`gioitinh-tag ${row.gioitinh === 'Nu' ? 'gioitinh-tag--nu' : 'gioitinh-tag--nam'}`}>
                          {row.gioitinh === 'Nu' ? 'Nữ' : 'Nam'}
                        </span>
                      </td>
                      <td>{row.lop}</td>
                      <td>{row.hoancanh || '—'}</td>
                      <td>{row.trangthai || 'DangHoc'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 15 && (
                <p className="import-preview-more">...và {previewData.length - 15} học sinh khác</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportStudentModal;
