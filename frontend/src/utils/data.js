// src/utils/data.js

// ==========================================
// 1. NGÔN NGỮ & DỊCH THUẬT (TRANSLATIONS)
// ==========================================


// ==========================================
// 2. BẢNG MÀU GIAO DIỆN (THEME COLORS)
// ==========================================
export const themeColors = [
  '#3b5998', '#4d5e7a', '#2ecc71', '#9b59b6', '#e74c3c', 
  '#1abc9c', '#319795', '#f68b1f', '#e91e63'
];

// ==========================================
// 3. DỮ LIỆU TRƯỜNG ĐẠI HỌC (MOCK UNIVERSITIES)
// ==========================================
export const mockUniversities = [
  { 
    id: 1, 
    name: 'Đại học Bách Khoa Hà Nội', 
    loc: 'Hai Bà Trưng, Hà Nội', 
    match: 98, 
    ratio: '1 : 12', 
    tuition: '22 - 28tr', 
    tags: ['BK', 'HN', '+5k'], 
    img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', 
    major: 'CNTT & Phần mềm', 
    tuitionRange: '20 - 40 triệu', 
    type: 'Đại học Công lập', 
    facilities: ['Ký túc xá', 'Thư viện'] 
  },
  { 
    id: 2, 
    name: 'Đại học Kinh tế Quốc dân', 
    loc: 'Hai Bà Trưng, Hà Nội', 
    match: 92, 
    ratio: '1 : 15', 
    tuition: '16 - 22tr', 
    tags: ['NE', 'U', '+8k'], 
    img: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80', 
    major: 'Kinh tế & Marketing', 
    tuitionRange: 'Dưới 20 triệu', 
    type: 'Đại học Công lập', 
    facilities: ['Thư viện', 'Sân vận động'] 
  },
  { 
    id: 3, 
    name: 'Đại học RMIT Việt Nam', 
    loc: 'Quận 7, TP. HCM', 
    match: 87, 
    ratio: '1 : 10', 
    tuition: '300 - 350tr', 
    tags: ['RM', 'SG'], 
    img: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80', 
    major: 'Ngôn ngữ Anh', 
    tuitionRange: 'Trên 40 triệu', 
    type: 'Đại học Quốc tế', 
    facilities: ['Thư viện', 'Sân vận động', 'Wifi miễn phí'] 
  },
  { 
    id: 4, 
    name: 'Đại học FPT', 
    loc: 'Thạch Thất, Hà Nội', 
    match: 85, 
    ratio: '1 : 8', 
    tuition: '80 - 120tr', 
    tags: ['FPT', 'HN'], 
    img: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=800&q=80', 
    major: 'CNTT & Phần mềm', 
    tuitionRange: 'Trên 40 triệu', 
    type: 'Đại học Dân lập', 
    facilities: ['Thư viện', 'Ký túc xá', 'Wifi miễn phí'] 
  }
];