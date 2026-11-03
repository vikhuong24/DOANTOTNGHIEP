package com.ndc.gayquy.common.enums;

public enum LoaiTaiLieuMinhChung {
    ANH,
    HOA_DON,
    BIEN_BAN,
    PHIEU_THU,
    KHAC,
    HoaDon,
    HinhAnh,
    BienBan,
    PhieuThu;

    public static LoaiTaiLieuMinhChung from(String value) {
        if (value == null || value.isBlank()) {
            return KHAC;
        }
        String clean = value.trim();
        for (LoaiTaiLieuMinhChung item : values()) {
            if (item.name().equalsIgnoreCase(clean)) {
                return item;
            }
        }
        String normalized = clean.toLowerCase().replace("_", "").replace("-", "");
        if (normalized.contains("hoadon")) return HOA_DON;
        if (normalized.contains("hinhanh") || normalized.contains("anh") || normalized.contains("image")) return ANH;
        if (normalized.contains("bienban")) return BIEN_BAN;
        if (normalized.contains("phieuthu")) return PHIEU_THU;
        return KHAC;
    }
}
