from app import create_app
from extensions import db
# 🚀 IMPORT THÊM 2 BẢNG TRUNG GIAN ĐỂ XÓA RÁC
from models import UniversityData, UniversityDetail, MasterInterest, MasterWorkEnvironment, university_interest, university_environment,UniversityReview
import random

app = create_app()

INTERESTS_DATA = [
    "Toán học & Logic", "Lập trình & Phần mềm", "Trí tuệ nhân tạo (AI)", "Lắp ráp & Robot", 
    "Bảo mật & Hacker", "Thiết kế vi mạch", "Cơ khí & Máy móc", "Điện & Điện tử", 
    "Vật lý ứng dụng", "Bán hàng & Chốt sale", "Đầu tư chứng khoán", "Quản lý tài chính", 
    "Khởi nghiệp & Kinh doanh", "Kế toán & Thuế", "Logistics & Vận tải", "Quản trị nhân sự", 
    "Thương mại quốc tế", "Sáng tạo nghệ thuật", "Nhiếp ảnh & Quay phim", "Thiết kế đồ họa", 
    "Thiết kế thời trang", "Thiết kế nội thất", "Âm nhạc & Biểu diễn", "Viết lách & Kịch bản", 
    "Tổ chức sự kiện", "Báo chí & Truyền thông", "Chăm sóc bệnh nhân", "Nghiên cứu y khoa", 
    "Dược phẩm & Thuốc", "Dinh dưỡng & Thể thao", "Thú y & Động vật", "Nông nghiệp & Cây trồng", 
    "Môi trường & Sinh thái", "Tâm lý & Hành vi con người", "Pháp lý & Tố tụng", "Giao tiếp cộng đồng", 
    "Giảng dạy & Truyền đạt", "Ngoại ngữ & Dịch thuật", "Lịch sử & Văn hóa", "Hoạt động tình nguyện",
    "Khoa học dữ liệu", "Thương mại điện tử", "Dịch vụ du lịch" # Thêm vài sở thích mới
]

ENVIRONMENTS_DATA = [
    {"id": "ap_luc_cao", "icon": "fa-fire", "title": "Khởi nghiệp & Áp lực cao", "desc": "Môi trường nhiều thách thức."},
    {"id": "cong_dong", "icon": "fa-users", "title": "Tương tác & Cộng đồng", "desc": "Tập trung vào yếu tố con người."},
    {"id": "doc_lap", "icon": "fa-laptop-code", "title": "Độc lập & Chuyên sâu", "desc": "Đề cao sự tập trung cao độ."},
    {"id": "hien_truong", "icon": "fa-tree", "title": "Ngoài trời & Hiện trường", "desc": "Gắn liền với thiên nhiên, công trường."},
    {"id": "khuon_kho", "icon": "fa-building", "title": "Khuôn khổ & Ổn định", "desc": "Tìm kiếm sự rõ ràng, quy trình chuẩn mực."},
    {"id": "nang_dong", "icon": "fa-rocket", "title": "Năng động & Tự do", "desc": "Ưu tiên sự linh hoạt, tốc độ, sáng tạo."},
    {"id": "quoc_te", "icon": "fa-globe", "title": "Quốc tế & Đa văn hóa", "desc": "Giao tiếp và làm việc với đối tác nước ngoài."},
    {"id": "sang_tao", "icon": "fa-palette", "title": "Sáng tạo & Nghệ thuật", "desc": "Tôn trọng ý tưởng mới, cái đẹp."},
    {"id": "tu_xa", "icon": "fa-house-user", "title": "Từ xa & Linh hoạt", "desc": "Tự do quản lý thời gian cá nhân."}
]

SCHOOLS = [
    # ---- HÀ NỘI & CÁC TỈNH MIỀN BẮC ----
    {"name": "Đại học Bách Khoa Hà Nội", "logo": "/assets/logo/dhbkhn.jpg", "base": 27.0, "province": "TP. Hà Nội", "address": "Số 1 Đại Cồ Việt, Hai Bà Trưng", "type": "Đại học Công lập", "website": "hust.edu.vn"},
    {"name": "Đại học Quốc gia Hà Nội (Khối các trường)", "logo": "/assets/logo/vnu_hn.jpg", "base": 26.5, "province": "TP. Hà Nội", "address": "144 Xuân Thủy, Cầu Giấy", "type": "Đại học Công lập", "website": "vnu.edu.vn"},
    {"name": "Đại học Kinh tế Quốc dân (NEU)", "logo": "/assets/logo/neu.jpg", "base": 26.5, "province": "TP. Hà Nội", "address": "207 Giải Phóng, Hai Bà Trưng", "type": "Đại học Công lập", "website": "neu.edu.vn"},
    {"name": "Trường Đại học Ngoại thương (FTU)", "logo": "/assets/logo/ftu.jpg", "base": 27.5, "province": "TP. Hà Nội", "address": "91 Chùa Láng, Đống Đa", "type": "Đại học Công lập", "website": "ftu.edu.vn"},
    {"name": "Trường Đại học Y Hà Nội", "logo": "/assets/logo/dhyhn.jpg", "base": 27.8, "province": "TP. Hà Nội", "address": "01 Tôn Thất Tùng, Đống Đa", "type": "Đại học Công lập", "website": "hmu.edu.vn"},
    {"name": "Trường Đại học Sư phạm Hà Nội", "logo": "/assets/logo/dhsphn.jpg", "base": 26.0, "province": "TP. Hà Nội", "address": "136 Xuân Thủy, Cầu Giấy", "type": "Đại học Công lập", "website": "hnue.edu.vn"},
    {"name": "Học viện Ngân hàng", "logo": "/assets/logo/hvnh.jpg", "base": 25.5, "province": "TP. Hà Nội", "address": "12 Chùa Bộc, Đống Đa", "type": "Đại học Công lập", "website": "hvnh.edu.vn"},
    {"name": "Trường Đại học Kiến trúc Hà Nội", "logo": "/assets/logo/hau.jpg", "base": 24.0, "province": "TP. Hà Nội", "address": "Km10 Nguyễn Trãi, Thanh Xuân", "type": "Đại học Công lập", "website": "hau.edu.vn"},
    {"name": "Trường Đại học FPT Hà Nội", "logo": "/assets/logo/fpt.jpg", "base": 22.0, "province": "TP. Hà Nội", "address": "Khu Công nghệ cao Hòa Lạc", "type": "Đại học Tư thục", "website": "hanoi.fpt.edu.vn"},
    {"name": "Đại học Thái Nguyên (Khối các trường)", "logo": "/assets/logo/tnu.jpg", "base": 21.0, "province": "Thái Nguyên", "address": "Phường Tân Thịnh, TP Thái Nguyên", "type": "Đại học Công lập", "website": "tnu.edu.vn"},
    {"name": "Trường Đại học Hàng hải Việt Nam", "logo": "/assets/logo/vimaru.jpg", "base": 22.5, "province": "Hải Phòng", "address": "484 Lạch Tray, Lê Chân", "type": "Đại học Công lập", "website": "vimaru.edu.vn"},
    {"name": "Trường Đại học Y Dược Hải Phòng", "logo": "/assets/logo/hpmu.jpg", "base": 25.5, "province": "Hải Phòng", "address": "72A Nguyễn Bỉnh Khiêm, Ngô Quyền", "type": "Đại học Công lập", "website": "hpmu.edu.vn"},
    {"name": "Trường Đại học Hạ Long", "logo": "/assets/logo/uhl.jpg", "base": 19.0, "province": "Quảng Ninh", "address": "258 Bạch Đằng, Uông Bí", "type": "Đại học Công lập", "website": "uhl.edu.vn"},
    {"name": "Đại học Anh Quốc Việt Nam (BUV)", "logo": "/assets/logo/buv.jpg", "base": 24.0, "province": "Hưng Yên", "address": "Khu đô thị Ecopark, Văn Giang", "type": "Đại học Quốc tế", "website": "buv.edu.vn"},
    {"name": "Trường Đại học Sư phạm Kỹ thuật Hưng Yên", "logo": "/assets/logo/utehy.jpg", "base": 20.0, "province": "Hưng Yên", "address": "Khoái Châu, Hưng Yên", "type": "Đại học Công lập", "website": "utehy.edu.vn"},
    {"name": "Trường Đại học Sao Đỏ", "logo": "/assets/logo/saodo.jpg", "base": 18.0, "province": "Hải Dương", "address": "TP Chí Linh, Hải Dương", "type": "Đại học Công lập", "website": "saodo.edu.vn"},
    {"name": "Trường Đại học Y Dược Thái Bình", "logo": "/assets/logo/tbump.jpg", "base": 24.5, "province": "Thái Bình", "address": "373 Lý Bôn, TP Thái Bình", "type": "Đại học Công lập", "website": "tbump.edu.vn"},
    {"name": "Trường Đại học Điều dưỡng Nam Định", "logo": "/assets/logo/ndun.jpg", "base": 20.5, "province": "Nam Định", "address": "257 Hàn Thuyên, TP Nam Định", "type": "Đại học Công lập", "website": "ndun.edu.vn"},
    {"name": "Trường Đại học Hùng Vương", "logo": "/assets/logo/hvu.jpg", "base": 18.5, "province": "Phú Thọ", "address": "Nông Trang, TP Việt Trì", "type": "Đại học Công lập", "website": "hvu.edu.vn"},
    {"name": "Trường Đại học Tây Bắc", "logo": "/assets/logo/utb.jpg", "base": 17.5, "province": "Sơn La", "address": "Chu Văn Thịnh, TP Sơn La", "type": "Đại học Công lập", "website": "utb.edu.vn"},

    # ---- MIỀN TRUNG & TÂY NGUYÊN ----
    {"name": "Đại học Đà Nẵng (Khối các trường)", "logo": "/assets/logo/udn.jpg", "base": 24.5, "province": "TP. Đà Nẵng", "address": "41 Lê Duẩn, Hải Châu", "type": "Đại học Công lập", "website": "udn.vn"},
    {"name": "Đại học Huế (Khối các trường)", "logo": "/assets/logo/hueuni.jpg", "base": 23.0, "province": "TP. Huế", "address": "03 Lê Lợi, TP Huế", "type": "Đại học Công lập", "website": "hueuni.edu.vn"},
    {"name": "Trường Đại học Vinh", "logo": "/assets/logo/vinh.jpg", "base": 22.5, "province": "Nghệ An", "address": "182 Lê Duẩn, TP Vinh", "type": "Đại học Công lập", "website": "vinhuni.edu.vn"},
    {"name": "Trường Đại học Hồng Đức", "logo": "/assets/logo/hdu.jpg", "base": 21.0, "province": "Thanh Hóa", "address": "565 Quang Trung, Đông Vệ", "type": "Đại học Công lập", "website": "hdu.edu.vn"},
    {"name": "Trường Đại học Hà Tĩnh", "logo": "/assets/logo/htu.jpg", "base": 18.0, "province": "Hà Tĩnh", "address": "Cẩm Vịnh, Cẩm Xuyên", "type": "Đại học Công lập", "website": "htu.edu.vn"},
    {"name": "Trường Đại học Quảng Bình", "logo": "/assets/logo/qbu.jpg", "base": 18.0, "province": "Quảng Bình", "address": "312 Lý Thường Kiệt, TP Đồng Hới", "type": "Đại học Công lập", "website": "qbu.edu.vn"},
    {"name": "Trường Đại học Quảng Nam", "logo": "/assets/logo/qnamu.jpg", "base": 18.5, "province": "Quảng Nam", "address": "102 Hùng Vương, TP Tam Kỳ", "type": "Đại học Công lập", "website": "qnamu.edu.vn"},
    {"name": "Trường Đại học Phạm Văn Đồng", "logo": "/assets/logo/pdu.jpg", "base": 18.0, "province": "Quảng Ngãi", "address": "509 Phan Đình Phùng, TP Quảng Ngãi", "type": "Đại học Công lập", "website": "pdu.edu.vn"},
    {"name": "Trường Đại học Quy Nhơn", "logo": "/assets/logo/qnu.jpg", "base": 21.5, "province": "Bình Định", "address": "170 An Dương Vương, TP Quy Nhơn", "type": "Đại học Công lập", "website": "qnu.edu.vn"},
    {"name": "Trường Đại học Phú Yên", "logo": "/assets/logo/pyu.jpg", "base": 18.5, "province": "Phú Yên", "address": "18 Trần Phú, TP Tuy Hòa", "type": "Đại học Công lập", "website": "pyu.edu.vn"},
    {"name": "Trường Đại học Nha Trang", "logo": "/assets/logo/ntu.jpg", "base": 21.5, "province": "Khánh Hòa", "address": "02 Nguyễn Đình Chiểu, TP Nha Trang", "type": "Đại học Công lập", "website": "ntu.edu.vn"},
    {"name": "Trường Đại học Tây Nguyên", "logo": "/assets/logo/ttn.jpg", "base": 20.5, "province": "Đắk Lắk", "address": "567 Lê Duẩn, TP Buôn Ma Thuột", "type": "Đại học Công lập", "website": "ttn.edu.vn"},
    {"name": "Trường Đại học Đà Lạt", "logo": "/assets/logo/dlu.jpg", "base": 20.0, "province": "Lâm Đồng", "address": "01 Phù Đổng Thiên Vương, TP Đà Lạt", "type": "Đại học Công lập", "website": "dlu.edu.vn"},
    {"name": "Trường Đại học Duy Tân", "logo": "/assets/logo/dtu.jpg", "base": 21.5, "province": "TP. Đà Nẵng", "address": "254 Nguyễn Văn Linh, Thanh Khê", "type": "Đại học Tư thục", "website": "duytan.edu.vn"},

    # ---- MIỀN NAM & ĐBSCL ----
    {"name": "Đại học Quốc gia TP.HCM (Khối các trường)", "logo": "/assets/logo/vnuhcm.jpg", "base": 26.8, "province": "TP. Hồ Chí Minh", "address": "Khu đô thị ĐHQG, Linh Trung", "type": "Đại học Công lập", "website": "vnuhcm.edu.vn"},
    {"name": "Đại học Kinh tế TP.HCM (UEH)", "logo": "/assets/logo/ueh.jpg", "base": 26.5, "province": "TP. Hồ Chí Minh", "address": "59C Nguyễn Đình Chiểu, Quận 3", "type": "Đại học Công lập", "website": "ueh.edu.vn"},
    {"name": "Trường Đại học Y Dược TP.HCM", "logo": "/assets/logo/ump.jpg", "base": 27.5, "province": "TP. Hồ Chí Minh", "address": "217 Hồng Bàng, Quận 5", "type": "Đại học Công lập", "website": "ump.edu.vn"},
    {"name": "Trường Đại học Y khoa Phạm Ngọc Thạch", "logo": "/assets/logo/pnt.jpg", "base": 26.5, "province": "TP. Hồ Chí Minh", "address": "2 Dương Quang Trung, Quận 10", "type": "Đại học Công lập", "website": "pnt.edu.vn"},
    {"name": "Trường Đại học Tôn Đức Thắng", "logo": "/assets/logo/tdtu.jpg", "base": 24.8, "province": "TP. Hồ Chí Minh", "address": "19 Nguyễn Hữu Thọ, Quận 7", "type": "Đại học Công lập", "website": "tdtu.edu.vn"},
    {"name": "Trường Đại học Công nghiệp TP.HCM (IUH)", "logo": "/assets/logo/iuh.jpg", "base": 24.0, "province": "TP. Hồ Chí Minh", "address": "12 Nguyễn Văn Bảo, Gò Vấp", "type": "Đại học Công lập", "website": "iuh.edu.vn"},
    {"name": "Trường Đại học Thủ Dầu Một", "logo": "/assets/logo/tdmu.jpg", "base": 20.0, "province": "Bình Dương", "address": "Số 6 Trần Văn Ơn, Phú Hòa", "type": "Đại học Công lập", "website": "tdmu.edu.vn"},
    {"name": "Đại học Việt Đức (VGU)", "logo": "/assets/logo/vgu.jpg", "base": 24.5, "province": "Bình Dương", "address": "Vành Đai 4, Bến Cát, Bình Dương", "type": "Đại học Quốc tế", "website": "vgu.edu.vn"},
    {"name": "Trường Đại học Lạc Hồng", "logo": "/assets/logo/lhu.jpg", "base": 19.0, "province": "Đồng Nai", "address": "10 Huỳnh Văn Nghệ, Biên Hòa", "type": "Đại học Tư thục", "website": "lhu.edu.vn"},
    {"name": "Trường Đại học Bà Rịa - Vũng Tàu (BVU)", "logo": "/assets/logo/bvu.jpg", "base": 18.5, "province": "Bà Rịa - Vũng Tàu", "address": "80 Trương Công Định, TP Vũng Tàu", "type": "Đại học Tư thục", "website": "bvu.edu.vn"},
    {"name": "Trường Đại học Cần Thơ", "logo": "/assets/logo/ctu.jpg", "base": 23.5, "province": "TP. Cần Thơ", "address": "Khu II, Đường 3/2, Ninh Kiều", "type": "Đại học Công lập", "website": "ctu.edu.vn"},
    {"name": "Trường Đại học Y Dược Cần Thơ", "logo": "/assets/logo/ctump.jpg", "base": 25.5, "province": "TP. Cần Thơ", "address": "179 Nguyễn Văn Cừ, Ninh Kiều", "type": "Đại học Công lập", "website": "ctump.edu.vn"},
    {"name": "Trường Đại học An Giang - ĐHQG TP.HCM", "logo": "/assets/logo/agu.jpg", "base": 21.0, "province": "An Giang", "address": "18 Ung Văn Khiêm, TP Long Xuyên", "type": "Đại học Công lập", "website": "agu.edu.vn"},
    {"name": "Trường Đại học Đồng Tháp", "logo": "/assets/logo/dthu.jpg", "base": 19.5, "province": "Đồng Tháp", "address": "783 Phạm Hữu Lầu, TP Cao Lãnh", "type": "Đại học Công lập", "website": "dthu.edu.vn"},
    {"name": "Trường Đại học Tiền Giang", "logo": "/assets/logo/tgu.jpg", "base": 18.0, "province": "Tiền Giang", "address": "119 Ấp Bắc, Phường 5, TP Mỹ Tho", "type": "Đại học Công lập", "website": "tgu.edu.vn"},
    {"name": "Trường Đại học Trà Vinh", "logo": "/assets/logo/tvu.jpg", "base": 20.0, "province": "Trà Vinh", "address": "126 Nguyễn Thiện Thành, TP Trà Vinh", "type": "Đại học Công lập", "website": "tvu.edu.vn"},
    {"name": "Trường Đại học Cửu Long", "logo": "/assets/logo/mku.jpg", "base": 18.5, "province": "Vĩnh Long", "address": "Quốc lộ 1A, Phú Quới, Long Hồ", "type": "Đại học Tư thục", "website": "mku.edu.vn"},
    {"name": "Trường Đại học Kinh tế Công nghiệp Long An", "logo": "/assets/logo/dla.jpg", "base": 17.0, "province": "Long An", "address": "Quốc lộ 1A, Tân An, Long An", "type": "Đại học Tư thục", "website": "daihoclongan.edu.vn"},
    {"name": "Trường Đại học Kiên Giang", "logo": "/assets/logo/vnkgu.jpg", "base": 17.5, "province": "Kiên Giang", "address": "320A Quốc lộ 61, Châu Thành", "type": "Đại học Công lập", "website": "vnkgu.edu.vn"},
    {"name": "Trường Đại học Bạc Liêu", "logo": "/assets/logo/blu.jpg", "base": 17.0, "province": "Bạc Liêu", "address": "178 Võ Thị Sáu, TP Bạc Liêu", "type": "Đại học Công lập", "website": "blu.edu.vn"},
    {"name": "Đại học Bình Dương (Phân hiệu Cà Mau)", "logo": "/assets/logo/bdu.jpg", "base": 17.0, "province": "Cà Mau", "address": "Đường số 6, Phường 5, TP Cà Mau", "type": "Đại học Tư thục", "website": "camau.bdu.edu.vn"},
    {"name": "Trường Đại học Công nghệ TP.HCM (HUTECH)", "logo": "/assets/logo/hutech.jpg", "base": 20.5, "province": "TP. Hồ Chí Minh", "address": "475A Điện Biên Phủ, Bình Thạnh", "type": "Đại học Tư thục", "website": "hutech.edu.vn"},
    {"name": "Trường Đại học Văn Lang", "logo": "/assets/logo/vlu.jpg", "base": 20.5, "province": "TP. Hồ Chí Minh", "address": "69/68 Đặng Thùy Trâm, Bình Thạnh", "type": "Đại học Tư thục", "website": "vlu.edu.vn"},
    {"name": "Đại học RMIT Việt Nam (Nam Sài Gòn)", "logo": "/assets/logo/rmit.jpg", "base": 25.0, "province": "TP. Hồ Chí Minh", "address": "702 Nguyễn Văn Linh, Quận 7", "type": "Đại học Quốc tế", "website": "rmit.edu.vn"}
]

# ========================================================
# 2. DANH SÁCH NGÀNH (THÊM MÃ NGÀNH VÀ CÁC NGÀNH MỚI)
# ========================================================
MAJORS_CONFIG = [
    # ---- NHÓM CÔNG NGHỆ & KỸ THUẬT ----
    {"major": "Khoa học Máy tính", "code": "7480101", "blocks": ['A00', 'A01', 'A02', 'D01', 'D07'], "bonus": 1.5, "fee": "~30-35tr/năm"},
    {"major": "Trí tuệ Nhân tạo (AI)", "code": "7480107", "blocks": ['A00', 'A01', 'A09', 'D07'], "bonus": 2.2, "fee": "~35-40tr/năm"},
    {"major": "Khoa học Dữ liệu", "code": "7480109", "blocks": ['A00', 'A01', 'D01'], "bonus": 1.8, "fee": "~30-38tr/năm"}, # MỚI
    {"major": "Kỹ thuật Xây dựng", "code": "7580201", "blocks": ['A00', 'A01', 'A03', 'A04', 'D07'], "bonus": -0.8, "fee": "~24tr/năm"},
    {"major": "Kỹ thuật Ô tô", "code": "7520114", "blocks": ['A00', 'A01', 'C01', 'D90'], "bonus": 0.2, "fee": "~25tr/năm"},
    {"major": "An toàn Thông tin", "code": "7480202", "blocks": ['A00', 'A01', 'D01', 'D90'], "bonus": 1.0, "fee": "~28tr/năm"},
    
    # ---- NHÓM KINH TẾ & QUẢN TRỊ ----
    {"major": "Kinh doanh Quốc tế", "code": "7340120", "blocks": ['A00', 'A01', 'D01', 'D07'], "bonus": 1.8, "fee": "~38tr/năm"},
    {"major": "Thương mại Điện tử", "code": "7340122", "blocks": ['A00', 'A01', 'D01', 'D07'], "bonus": 1.6, "fee": "~35tr/năm"}, # MỚI
    {"major": "Logistics và Quản lý chuỗi cung ứng", "code": "7510605", "blocks": ['A00', 'A01', 'D01'], "bonus": 2.0, "fee": "~36tr/năm"}, # MỚI
    {"major": "Marketing", "code": "7340115", "blocks": ['A01', 'C00', 'C15', 'C20', 'D01', 'D07'], "bonus": 1.4, "fee": "~35tr/năm"},
    {"major": "Quản trị Kinh doanh", "code": "7340101", "blocks": ['A00', 'A01', 'C04', 'C14', 'D01'], "bonus": 0.8, "fee": "~32tr/năm"},
    {"major": "Tài chính - Ngân hàng", "code": "7340201", "blocks": ['A00', 'A01', 'C03', 'C14', 'D01'], "bonus": 0.9, "fee": "~30tr/năm"},
    {"major": "Quản trị Dịch vụ Du lịch và Lữ hành", "code": "7810103", "blocks": ['C00', 'D01', 'A01'], "bonus": 0.5, "fee": "~30tr/năm"}, # MỚI

    # ---- NHÓM NGÔN NGỮ ----
    {"major": "Ngôn ngữ Anh", "code": "7220201", "blocks": ['D01', 'D14', 'D15', 'D66', 'D78'], "bonus": 0.5, "fee": "~25tr/năm"},
    {"major": "Ngôn ngữ Trung Quốc", "code": "7220204", "blocks": ['D01', 'D04', 'C00'], "bonus": 1.2, "fee": "~25tr/năm"},
    {"major": "Ngôn ngữ Nhật Bản", "code": "7220209", "blocks": ['D01', 'D06', 'D14'], "bonus": 1.0, "fee": "~28tr/năm"},

    # ---- NHÓM XÃ HỘI, LUẬT & TRUYỀN THÔNG ----
    {"major": "Báo chí", "code": "7320101", "blocks": ['C00', 'C03', 'C04', 'C15', 'D01', 'D14'], "bonus": 1.5, "fee": "~25tr/năm"},
    {"major": "Truyền thông Đa phương tiện", "code": "7320104", "blocks": ['C00', 'C15', 'D01', 'A01'], "bonus": 1.2, "fee": "~35tr/năm"},
    {"major": "Luật Kinh tế", "code": "7380107", "blocks": ['A00', 'A01', 'C00', 'C14', 'D01'], "bonus": 0.7, "fee": "~24tr/năm"},
    {"major": "Tâm lý học", "code": "7310401", "blocks": ['B00', 'C00', 'D01', 'D14'], "bonus": 0.9, "fee": "~26tr/năm"}, # MỚI

    # ---- NHÓM Y DƯỢC & SINH HỌC ----
    {"major": "Y khoa", "code": "7720101", "blocks": ['B00', 'A00'], "bonus": 2.5, "fee": "~50-70tr/năm"},
    {"major": "Răng - Hàm - Mặt", "code": "7720501", "blocks": ['B00'], "bonus": 2.8, "fee": "~60-80tr/năm"},
    {"major": "Công nghệ Sinh học", "code": "7420201", "blocks": ['A00', 'B00', 'B03', 'B08'], "bonus": 0.2, "fee": "~25tr/năm"},

    # ---- NHÓM SƯ PHẠM & KIẾN TRÚC ----
    {"major": "Sư phạm Tiếng Anh", "code": "7140231", "blocks": ['D01', 'D14'], "bonus": 1.5, "fee": "Miễn học phí"},
    {"major": "Kiến trúc", "code": "7580101", "blocks": ['V00', 'V01', 'A01', 'D01'], "bonus": 1.0, "fee": "~30tr/năm"},
    {"major": "Thiết kế Đồ họa", "code": "7210403", "blocks": ['H00', 'H01', 'V00', 'D01'], "bonus": 1.2, "fee": "~35tr/năm"}
]

with app.app_context():
    # ---------------------------------------------------------
    # 0. TẠO BẢNG & LÀM SẠCH DỮ LIỆU CŨ (FIX LỖI 1451 Ở ĐÂY)
    # ---------------------------------------------------------
    print("🚀 Đang rà soát cấu trúc Database...")
    db.create_all()

    print("🧹 Đang làm sạch dữ liệu cũ...")
    
    # 1. Xóa 2 bảng trung gian
    db.session.execute(university_interest.delete())
    db.session.execute(university_environment.delete())

    # 2. XÓA CÁC BẢNG CON BÁM VÀO BẢNG MẸ
    db.session.query(UniversityReview).delete()  # 🚀 THÊM DÒNG NÀY ĐỂ DỌN SẠCH REVIEW
    db.session.query(UniversityDetail).delete()

    # 3. Xóa các bảng danh mục
    db.session.query(MasterInterest).delete()
    db.session.query(MasterWorkEnvironment).delete()

    # 4. Cuối cùng mới an tâm trảm bảng mẹ
    db.session.query(UniversityData).delete()

   
    # ---------------------------------------------------------
    # 1. NẠP SỞ THÍCH VÀ MÔI TRƯỜNG
    # ---------------------------------------------------------
    print("🪄 Đang nạp danh mục Sở thích và Môi trường...")
    for item in INTERESTS_DATA:
        db.session.add(MasterInterest(name=item))

    for env in ENVIRONMENTS_DATA:
        db.session.add(MasterWorkEnvironment(
            id=env["id"], icon=env["icon"], title=env["title"], description=env["desc"]
        ))
    db.session.commit()

    all_interests = {i.name: i for i in MasterInterest.query.all()}
    all_envs = {e.id: e for e in MasterWorkEnvironment.query.all()}

    generated_records = []

    print("🪄 Đang bắt đầu nạp siêu dữ liệu MindConnect phủ sóng Toàn Quốc...")
    for school in SCHOOLS:
        for m in MAJORS_CONFIG:
            
            # --- LỌC NGÀNH ĐẶC THÙ (Nới lỏng để phủ sóng các tỉnh) ---
            if any(word in m["major"] for word in ["Y khoa", "Dược", "Răng", "Điều dưỡng"]):
                valid_med = ["Y", "Dược", "Quốc gia", "Phạm Ngọc Thạch", "Duy Tân", "Trà Vinh", "Tây Nguyên", "Vinh", "Thái Bình", "Nam Định", "Hải Phòng", "Cần Thơ"]
                if not any(w in school["name"] for w in valid_med): continue
                
            if "Sư phạm" in m["major"]:
                valid_edu = ["Sư phạm", "Quốc gia", "Đà Nẵng", "Huế", "Cần Thơ", "Vinh", "Quy Nhơn", "Hồng Đức", "Đồng Tháp", "An Giang", "Tây Nguyên", "Trà Vinh", "Tiền Giang", "Bạc Liêu", "Hùng Vương", "Tây Bắc", "Quảng Bình", "Quảng Nam", "Đồng Nai", "Phú Yên"]
                if not any(w in school["name"] for w in valid_edu): continue
                
            if any(am in m["major"] for am in ["Kiến trúc", "Thiết kế"]):
                valid_art = ["Kiến trúc", "Mỹ thuật", "Bách Khoa", "Tôn Đức Thắng", "Văn Lang", "Duy Tân", "HUTECH", "FPT", "RMIT", "Hạ Long", "Quốc gia"]
                if not any(w in school["name"] for w in valid_art): continue

            # --- TẠO DỮ LIỆU ---
            for block in m["blocks"]:
                # Thêm yếu tố random để điểm các tỉnh thấp hơn Hà Nội / HCM một chút
                provincial_discount = 0.0
                if school["province"] not in ["TP. Hà Nội", "TP. Hồ Chí Minh", "TP. Đà Nẵng", "Hưng Yên"]:
                    provincial_discount = random.uniform(1.5, 3.5)

                random_factor = round(random.uniform(-0.5, 0.5), 2)
                score = school["base"] + m["bonus"] - provincial_discount + random_factor
                
                current_fee = m["fee"]
                current_admission = "1. Xét tuyển thẳng\n2. Xét điểm thi THPT\n3. Xét học bạ\n4. Đánh giá năng lực"

                if school["type"] == "Đại học Tư thục":
                    score -= 2.0
                    if "~24tr/năm" in current_fee or "~25tr/năm" in current_fee: current_fee = "~30-40tr/năm"
                elif school["type"] == "Đại học Quốc tế":
                    score -= 1.5 
                    current_fee = f"~{random.randint(250, 450)}tr/năm"
                    current_admission = "1. Tuyển thẳng\n2. Phỏng vấn\n3. Xét THPT\n4. Kỳ thi chuẩn hóa (SAT)"

                if block.startswith('C'): score += 1.5
                elif block.startswith('V') or block.startswith('H'): score += 0.8
                
                final_score = max(15.0, min(29.8, round(score, 2)))
                last_year_score = max(15.0, min(29.8, round(final_score + random.uniform(-1.0, 1.0), 2)))
                
                dgnl_score = random.randint(850, 1050) if final_score >= 26 else (random.randint(700, 850) if final_score >= 22 else random.randint(600, 700))
                
                combo_cert_val = random.choice(["IELTS 6.5", "IELTS 7.0+", "SAT 1200+"]) if school["type"] == "Đại học Quốc tế" or final_score >= 26 else random.choice(["IELTS 5.5", "IELTS 6.0", "Không yêu cầu"])
                direct_adm_val = "Xét tuyển thẳng học sinh giỏi cấp Tỉnh/Quốc gia"
                aptitude_val = "Yêu cầu thi môn Năng khiếu đạt >= 5.0" if any(k in block for k in ['V', 'H', 'M', 'N', 'T']) else "Không yêu cầu"

                smart_ranking_note = f"Chương trình chuẩn ({block}) - {school['province']}"

                # 🚀 LƯU VÀO MODEL MỚI (Thêm quota và year)
                record = UniversityData(
                    school_name=school["name"],
                    major_name=m["major"],        
                    major_code=m["code"],         
                    school_logo=school["logo"],
                    subject_block=block,
                    base_score=final_score,       
                    quota=random.randint(50, 300),   # 🚀 CHỈ TIÊU (Ngẫu nhiên 50-300)
                    year=2025,                       # 🚀 NĂM TUYỂN SINH
                    tuition_fee=current_fee,
                    ranking_note=smart_ranking_note,
                    school_type=school["type"],
                    score_thpt_last_year=last_year_score,
                    score_dgnl=dgnl_score,
                    combo_cert=combo_cert_val,
                    direct_admission=direct_adm_val,
                    aptitude_test=aptitude_val
                )

                # =========================================================
                # THUẬT TOÁN GẮN SỞ THÍCH VÀ MÔI TRƯỜNG CHO NGÀNH
                # =========================================================
                major_lower = m["major"].lower()
                
                if any(w in major_lower for w in ["máy tính", "thông tin", "ai", "trí tuệ", "dữ liệu"]):
                    if "Lập trình & Phần mềm" in all_interests: record.interests.append(all_interests["Lập trình & Phần mềm"])
                    if "doc_lap" in all_envs: record.environments.append(all_envs["doc_lap"])
                elif any(w in major_lower for w in ["kinh doanh", "marketing", "tài chính", "quốc tế", "thương mại", "logistics"]):
                    if "Khởi nghiệp & Kinh doanh" in all_interests: record.interests.append(all_interests["Khởi nghiệp & Kinh doanh"])
                    if "nang_dong" in all_envs: record.environments.append(all_envs["nang_dong"])
                elif any(w in major_lower for w in ["y khoa", "răng"]):
                    if "Chăm sóc bệnh nhân" in all_interests: record.interests.append(all_interests["Chăm sóc bệnh nhân"])
                    if "ap_luc_cao" in all_envs: record.environments.append(all_envs["ap_luc_cao"])
                elif any(w in major_lower for w in ["du lịch"]):
                    if "Giao tiếp cộng đồng" in all_interests: record.interests.append(all_interests["Giao tiếp cộng đồng"])
                    if "hien_truong" in all_envs: record.environments.append(all_envs["hien_truong"])

                # Ghép Province thẳng vào Address để giao diện detail đẹp hơn
                full_address = f"{school['address']}, {school['province']}"

                detail_record = UniversityDetail(
                    description=f"Trường {school['name']} là một cơ sở đào tạo {school['type'].lower()} uy tín tại {school['province']}. Ngành {m['major']} có chỉ tiêu dự kiến là {record.quota} sinh viên.",
                    address=full_address, 
                    website=f"https://{school['website']}",
                    phone=f"02{random.randint(4,8)} 38{random.randint(10,50)} {random.randint(1000,9999)}",
                    admission_methods=current_admission
                )

                record.details = detail_record
                generated_records.append(record)

    db.session.add_all(generated_records)
    db.session.commit()
    
    print(f"✨ HOÀN THÀNH! Đã nạp thành công {len(generated_records)} dòng dữ liệu chuẩn xác theo cấu trúc Model mới.")