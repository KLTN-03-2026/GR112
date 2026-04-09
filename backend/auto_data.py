from app import create_app
from extensions import db
from models import UniversityData
import random

app = create_app()

# ========================================================
# 1. DANH SÁCH 50 TRƯỜNG ĐẠI HỌC TRỌNG ĐIỂM (BẮC - TRUNG - NAM)
# ========================================================
SCHOOLS = [
    # MIỀN BẮC 
    {"name": "Đại học Bách Khoa Hà Nội", "logo": "/assets/logo/dhbkhn.jpg", "base": 27.0},
    {"name": "Đại học Công nghệ - ĐHQGHN", "logo": "/assets/logo/dhcn_dhqghn.jpg", "base": 26.5},
    {"name": "Đại học Kinh tế Quốc dân (NEU)", "logo": "/assets/logo/neu.jpg", "base": 26.5},
    {"name": "Đại học Ngoại thương (FTU)", "logo": "/assets/logo/ftu.jpg", "base": 27.5},
    {"name": "Đại học Y Hà Nội", "logo": "/assets/logo/dhyhn.jpg", "base": 27.8},
    {"name": "Học viện Công nghệ Bưu chính Viễn thông", "logo": "/assets/logo/hvcnbcvt.jpg", "base": 25.5},
    {"name": "Học viện Tài chính", "logo": "/assets/logo/hvtc.jpg", "base": 25.0},
    {"name": "Học viện Ngân hàng", "logo": "/assets/logo/hvnh.jpg", "base": 25.0},
    {"name": "Đại học Thương mại", "logo": "/assets/logo/dhtm.jpg", "base": 25.0},
    {"name": "Đại học Sư phạm Hà Nội", "logo": "/assets/logo/dhsphn.jpg", "base": 26.0},
    {"name": "Đại học Giao thông Vận tải", "logo": "/assets/logo/dhgtvthn.jpg", "base": 23.5},
    {"name": "Đại học Công nghiệp Hà Nội", "logo": "/assets/logo/dhcnhn.jpg", "base": 23.5},
    {"name": "Đại học Thủy Lợi", "logo": "/assets/logo/dhtl.jpg", "base": 23.0},
    {"name": "Đại học Mở Hà Nội", "logo": "/assets/logo/dhmhn.jpg", "base": 23.0},
    {"name": "Đại học Xây dựng Hà Nội", "logo": "/assets/logo/dhxdhn.jpg", "base": 23.5},
    {"name": "Đại học Luật Hà Nội", "logo": "/assets/logo/dhlhn.jpg", "base": 26.0},
    {"name": "Học viện Báo chí và Tuyên truyền", "logo": "/assets/logo/hvbcvtt.jpg", "base": 26.0},
    {"name": "Đại học Hà Nội (HANU)", "logo": "/assets/logo/hanu.jpg", "base": 25.5},
    {"name": "Đại học Mỏ - Địa chất", "logo": "/assets/logo/humg.jpg", "base": 21.5},
    {"name": "Đại học Kinh tế Kỹ thuật Công nghiệp", "logo": "/assets/logo/uneti.jpg", "base": 22.0},

    # MIỀN TRUNG
    {"name": "Đại học Bách Khoa - ĐH Đà Nẵng", "logo": "/assets/logo/dhbkdn.jpg", "base": 25.0},
    {"name": "Đại học Kinh tế - ĐH Đà Nẵng", "logo": "/assets/logo/due.jpg", "base": 24.5},
    {"name": "Đại học Sư phạm - ĐH Đà Nẵng", "logo": "/assets/logo/ued.jpg", "base": 23.5},
    {"name": "Đại học Ngoại ngữ - ĐH Đà Nẵng", "logo": "/assets/logo/ufl.jpg", "base": 24.0},
    {"name": "Đại học Y Dược - ĐH Huế", "logo": "/assets/logo/huemed.jpg", "base": 26.0},
    {"name": "Đại học Kinh tế - ĐH Huế", "logo": "/assets/logo/hce.jpg", "base": 22.0},
    {"name": "Đại học Vinh", "logo": "/assets/logo/vinh.jpg", "base": 22.5},
    {"name": "Đại học Nha Trang", "logo": "/assets/logo/ntu.jpg", "base": 22.0},
    {"name": "Đại học Quy Nhơn", "logo": "/assets/logo/qnu.jpg", "base": 21.5},
    {"name": "Đại học Tây Nguyên", "logo": "/assets/logo/ttn.jpg", "base": 21.0},

    # MIỀN NAM
    {"name": "Đại học Bách Khoa TP.HCM", "logo": "/assets/logo/dhbkhcm.jpg", "base": 26.8},
    {"name": "Đại học Kinh tế TP.HCM (UEH)", "logo": "/assets/logo/ueh.jpg", "base": 26.5},
    {"name": "Đại học Y Dược TP.HCM", "logo": "/assets/logo/ump.jpg", "base": 27.5},
    {"name": "Đại học CNTT - ĐHQG TP.HCM (UIT)", "logo": "/assets/logo/uit.jpg", "base": 26.5},
    {"name": "Đại học Sư phạm Kỹ thuật TP.HCM", "logo": "/assets/logo/ute.jpg", "base": 25.5},
    {"name": "Đại học Công nghiệp TP.HCM", "logo": "/assets/logo/iuh.jpg", "base": 24.0},
    {"name": "Đại học Tôn Đức Thắng", "logo": "/assets/logo/tdtu.jpg", "base": 24.8},
    {"name": "Đại học Sài Gòn", "logo": "/assets/logo/sgu.jpg", "base": 24.5},
    {"name": "Đại học Tài chính - Marketing", "logo": "/assets/logo/ufm.jpg", "base": 24.0},
    {"name": "Đại học Ngoại thương (CS2 TPHCM)", "logo": "/assets/logo/ftuu.jpg", "base": 27.2},
    {"name": "Đại học FPT", "logo": "/assets/logo/fpt.jpg", "base": 24.0},
    {"name": "Đại học Mở TP.HCM", "logo": "/assets/logo/ou.jpg", "base": 23.5},
    {"name": "Đại học Nông Lâm TP.HCM", "logo": "/assets/logo/hcmuaf.jpg", "base": 22.5},
    {"name": "Đại học Luật TP.HCM", "logo": "/assets/logo/hcmulaw.jpg", "base": 25.5},
    {"name": "Đại học Y khoa Phạm Ngọc Thạch", "logo": "/assets/logo/pnt.jpg", "base": 26.0},
    {"name": "Đại học Cần Thơ", "logo": "/assets/logo/ctu.jpg", "base": 23.5},
    {"name": "Đại học Y Dược Cần Thơ", "logo": "/assets/logo/ctump.jpg", "base": 25.5},
    {"name": "Đại học Tiền Giang", "logo": "/assets/logo/tgu.jpg", "base": 20.0},
    {"name": "Đại học Trà Vinh", "logo": "/assets/logo/tvu.jpg", "base": 20.5},
    {"name": "Đại học Cửu Long", "logo": "/assets/logo/mku.jpg", "base": 19.5},
]

# Phần MAJORS_CONFIG và vòng lặp bên dưới giữ nguyên...
# (Nhớ chạy: python auto_data.py sau khi lưu file)

# ========================================================
# 2. DANH SÁCH NGÀNH KHỦNG (35+ NGÀNH) VÀ KHỐI THI
# ========================================================
MAJORS_CONFIG = [
    # ---- NHÓM CÔNG NGHỆ & KỸ THUẬT ----
    {"major": "Khoa học Máy tính", "blocks": ['A00', 'A01', 'D01'], "bonus": 1.5, "fee": "~30-35tr/năm"},
    {"major": "Trí tuệ Nhân tạo (AI)", "blocks": ['A00', 'A01'], "bonus": 2.2, "fee": "~35-40tr/năm"},
    {"major": "Kỹ thuật Phần mềm", "blocks": ['A00', 'A01', 'D01'], "bonus": 1.3, "fee": "~30tr/năm"},
    {"major": "Khoa học Dữ liệu", "blocks": ['A00', 'A01', 'D01'], "bonus": 1.8, "fee": "~35tr/năm"},
    {"major": "An toàn Thông tin", "blocks": ['A00', 'A01'], "bonus": 1.0, "fee": "~28tr/năm"},
    {"major": "Kỹ thuật Điện - Điện tử", "blocks": ['A00', 'A01'], "bonus": 0.5, "fee": "~26tr/năm"},
    {"major": "Kỹ thuật Cơ điện tử", "blocks": ['A00', 'A01'], "bonus": 0.8, "fee": "~27tr/năm"},
    {"major": "Kỹ thuật Ô tô", "blocks": ['A00', 'A01'], "bonus": 0.2, "fee": "~25tr/năm"},
    {"major": "Kỹ thuật Xây dựng", "blocks": ['A00', 'A01'], "bonus": -0.5, "fee": "~24tr/năm"},
    
    # ---- NHÓM KINH TẾ & QUẢN TRỊ ----
    {"major": "Kinh doanh Quốc tế", "blocks": ['A00', 'A01', 'D01'], "bonus": 1.8, "fee": "~38tr/năm"},
    {"major": "Marketing", "blocks": ['A01', 'D01', 'C00', 'D07'], "bonus": 1.4, "fee": "~35tr/năm"},
    {"major": "Thương mại điện tử", "blocks": ['A00', 'A01', 'D01'], "bonus": 1.3, "fee": "~30tr/năm"},
    {"major": "Logistics & Chuỗi cung ứng", "blocks": ['A00', 'A01', 'D01'], "bonus": 1.6, "fee": "~33tr/năm"},
    {"major": "Tài chính - Ngân hàng", "blocks": ['A00', 'A01', 'D01', 'D07'], "bonus": 0.9, "fee": "~30tr/năm"},
    {"major": "Kế toán", "blocks": ['A00', 'A01', 'D01'], "bonus": 0.6, "fee": "~28tr/năm"},
    {"major": "Quản trị Kinh doanh", "blocks": ['A00', 'A01', 'D01', 'D07'], "bonus": 0.8, "fee": "~32tr/năm"},
    {"major": "Quản trị Khách sạn & Du lịch", "blocks": ['C00', 'D01', 'A01'], "bonus": 0.5, "fee": "~32tr/năm"},
    {"major": "Kinh tế học", "blocks": ['A00', 'A01', 'D01'], "bonus": 0.7, "fee": "~28tr/năm"},

    # ---- NHÓM NGÔN NGỮ ----
    {"major": "Ngôn ngữ Anh", "blocks": ['D01', 'D14', 'D15'], "bonus": 0.5, "fee": "~25tr/năm"},
    {"major": "Ngôn ngữ Trung Quốc", "blocks": ['D01', 'D04', 'C00'], "bonus": 1.2, "fee": "~25tr/năm"},
    {"major": "Ngôn ngữ Nhật Bản", "blocks": ['D01', 'D06', 'D14'], "bonus": 1.0, "fee": "~28tr/năm"},
    {"major": "Ngôn ngữ Hàn Quốc", "blocks": ['D01', 'D14', 'D78'], "bonus": 1.1, "fee": "~28tr/năm"},

    # ---- NHÓM XÃ HỘI, LUẬT & TRUYỀN THÔNG ----
    {"major": "Truyền thông Đa phương tiện", "blocks": ['C00', 'D01', 'D14', 'A01'], "bonus": 1.2, "fee": "~35tr/năm"},
    {"major": "Báo chí", "blocks": ['C00', 'D01', 'D14', 'D78'], "bonus": 1.5, "fee": "~25tr/năm"},
    {"major": "Quan hệ Công chúng (PR)", "blocks": ['C00', 'D01', 'D78'], "bonus": 1.4, "fee": "~30tr/năm"},
    {"major": "Luật Kinh tế", "blocks": ['A00', 'A01', 'C00', 'D01'], "bonus": 0.7, "fee": "~24tr/năm"},
    {"major": "Tâm lý học", "blocks": ['C00', 'D01', 'B00'], "bonus": 0.6, "fee": "~22tr/năm"},
    {"major": "Xã hội học", "blocks": ['C00', 'D01'], "bonus": 0.1, "fee": "~20tr/năm"},

    # ---- NHÓM Y DƯỢC & SINH HỌC ----
    {"major": "Y khoa", "blocks": ['B00', 'A00'], "bonus": 2.5, "fee": "~50-70tr/năm"},
    {"major": "Răng - Hàm - Mặt", "blocks": ['B00'], "bonus": 2.8, "fee": "~60-80tr/năm"},
    {"major": "Dược học", "blocks": ['A00', 'B00'], "bonus": 1.5, "fee": "~40-50tr/năm"},
    {"major": "Công nghệ Sinh học", "blocks": ['B00', 'A00'], "bonus": 0.4, "fee": "~25tr/năm"},
    {"major": "Công nghệ Thực phẩm", "blocks": ['A00', 'B00'], "bonus": 0.2, "fee": "~24tr/năm"},

    # ---- NHÓM SƯ PHẠM ----
    {"major": "Sư phạm Tiếng Anh", "blocks": ['D01', 'D14'], "bonus": 1.5, "fee": "Miễn học phí"},
    {"major": "Sư phạm Toán học", "blocks": ['A00', 'A01'], "bonus": 1.6, "fee": "Miễn học phí"},
    {"major": "Sư phạm Ngữ văn", "blocks": ['C00', 'D01'], "bonus": 1.7, "fee": "Miễn học phí"}
]

with app.app_context():
    print("🚀 Đang làm sạch dữ liệu cũ...")
    db.session.query(UniversityData).delete()
    
    generated_records = []

    print("🪄 Đang bắt đầu 'phù phép' dữ liệu...")
    for school in SCHOOLS:
        for m in MAJORS_CONFIG:
            
            # --- 1. LOGIC LỌC NGÀNH Y DƯỢC ---
            is_medical_major = any(word in m["major"] for word in ["Y khoa", "Dược", "Răng"])
            is_medical_school = any(word in school["name"] for word in ["Y", "Quốc gia", "Kinh tế Kỹ thuật"]) 
            if is_medical_major and not is_medical_school:
                continue
                
            # --- 2. LOGIC LỌC NGÀNH SƯ PHẠM ---
            is_edu_major = "Sư phạm" in m["major"]
            is_edu_school = any(word in school["name"] for word in ["Sư phạm", "Quốc gia", "Đà Nẵng", "Huế", "Cần Thơ", "Vinh", "Sài Gòn"])
            if is_edu_major and not is_edu_school:
                continue
            
            # --- TẠO DỮ LIỆU CHO CÁC KHỐI THI ---
            for block in m["blocks"]:
                # Tính điểm chuẩn có độ lệch ngẫu nhiên
                random_factor = round(random.uniform(-0.4, 0.4), 2)
                score = school["base"] + m["bonus"] + random_factor
                
                # Khối C00 thường điểm rất cao, cộng thêm 1.5 điểm
                if block == 'C00':
                    score += 1.5
                
                # Điểm tối đa không vượt 29.8
                final_score = min(29.8, round(score, 2))

                record = UniversityData(
                    school_name=school["name"],
                    major_name=m["major"],
                    school_logo=school["logo"],
                    subject_block=block,
                    base_score=final_score,
                    tuition_fee=m["fee"],
                    ranking_note=f"Chương trình đào tạo uy tín ({block})"
                )
                generated_records.append(record)

    db.session.add_all(generated_records)
    db.session.commit()
    
    print(f"✨ HOÀN THÀNH! Đã nạp thành công {len(generated_records)} dòng dữ liệu siêu đa dạng vào MySQL.")