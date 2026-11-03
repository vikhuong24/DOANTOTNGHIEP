package com.ndc.gayquy.common.enums;

public enum LoaiTaiLieu {
    HOADON,
    HINHANH,
    CHUNGTU,
    KHAC;

    public static LoaiTaiLieu from(String value) {
        if (value == null || value.isBlank()) {
            return KHAC;
        }
        String clean = value.trim().toUpperCase().replace("_", "").replace("-", "");
        for (LoaiTaiLieu item : values()) {
            if (item.name().equalsIgnoreCase(clean)) {
                return item;
            }
        }
        if (clean.contains("HOADON")) return HOADON;
        if (clean.contains("HINHANH") || clean.contains("ANH") || clean.contains("IMAGE")) return HINHANH;
        if (clean.contains("CHUNGTU") || clean.contains("BIENBAN") || clean.contains("PHIEUTHU")) return CHUNGTU;
        return KHAC;
    }
}
