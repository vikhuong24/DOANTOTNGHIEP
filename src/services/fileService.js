// Service tải lên tệp hình ảnh/tài liệu lên Backend (multipart/form-data)
import api, { unwrap } from './api';

/**
 * Upload ảnh lên Backend vào thư mục uploads/<folder>/
 * Endpoint: POST /api/files/upload
 * @param {File} file - File ảnh cần tải lên
 * @param {string} folder - Thư mục lưu ('campaigns' | 'receipts' | 'evidences' | 'others')
 * @returns {Promise<{url: string, fileName: string}>}
 */
export const uploadImage = async (file, folder = 'others') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrap(res);
};
