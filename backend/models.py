from extensions import db
import json
from sqlalchemy.dialects.mysql import LONGTEXT

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default="user")
    otp = db.Column(db.String(6))
    otp_expire = db.Column(db.DateTime)
    verified = db.Column(db.Boolean, default=False)
    full_name = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    address = db.Column(db.Text)
    class_name = db.Column(db.String(50))
    school_name = db.Column(db.String(150))
    specialty = db.Column(db.String(255), nullable=True)
    experience_years = db.Column(db.Integer, nullable=True)
    
    # Sửa thành db.func.now()
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)
    
    # Sửa thành db.func.now()
    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'message': self.message,
            # Kiểm tra nếu có thời gian thì mới format để tránh lỗi khi dữ liệu rỗng
            'created_at': self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }
    
# ========================================================

# ========================================================
# CÁC BẢNG TRUNG GIAN (CHO TÍNH NĂNG AI GỢI Ý BƯỚC 1)
# ========================================================
university_interest = db.Table('university_interest',
    db.Column('university_id', db.Integer, db.ForeignKey('university_data.id'), primary_key=True),
    db.Column('interest_id', db.Integer, db.ForeignKey('master_interests.id'), primary_key=True)
)

university_environment = db.Table('university_environment',
    db.Column('university_id', db.Integer, db.ForeignKey('university_data.id'), primary_key=True),
    db.Column('environment_id', db.String(50), db.ForeignKey('master_work_environments.id'), primary_key=True)
)
# ========================================================
# BẢNG 1: THÔNG TIN CƠ BẢN (TRƯỜNG & NGÀNH)
# ========================================================
class UniversityData(db.Model):
    __tablename__ = 'university_data'

    id = db.Column(db.Integer, primary_key=True)
    school_name = db.Column(db.String(150), nullable=False)
    major_name = db.Column(db.String(150), nullable=False)
    major_code = db.Column(db.String(20))
    school_logo = db.Column(db.String(255))
    subject_block = db.Column(db.String(10), nullable=False)
    base_score = db.Column(db.Float, nullable=False)#học ba nè
    quota = db.Column(db.Integer, default=0)
    tuition_fee = db.Column(db.String(100))
    ranking_note = db.Column(db.String(100)) 
    
    year = db.Column(db.Integer, default=2025) # 🚀 THÊM DÒNG NÀY
    school_type = db.Column(db.String(50))
    score_thpt_last_year = db.Column(db.Float)          # Điểm năm ngoái xét tuyển Thi THPT
    score_dgnl = db.Column(db.Integer)                  # Điểm ĐGNL
    combo_cert = db.Column(db.String(100))              # Xét tuyển Kết hợp (IELTS/SAT)
    direct_admission = db.Column(db.String(255))        # Tuyển thẳng
    aptitude_test = db.Column(db.String(255))           # Năng khiếu

    # Mối quan hệ 1-1: Liên kết với bảng UniversityDetail
    details = db.relationship('UniversityDetail', backref='parent', uselist=False, cascade="all, delete-orphan")

    # Mối quan hệ N-N: Liên kết với Sở thích và Môi trường
    interests = db.relationship('MasterInterest', secondary=university_interest, lazy='subquery',
        backref=db.backref('universities', lazy=True))
    
    environments = db.relationship('MasterWorkEnvironment', secondary=university_environment, lazy='subquery',
        backref=db.backref('universities', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'school_name': self.school_name,
            'major_name': self.major_name,
            'major_code': self.major_code,
            'school_logo': self.school_logo,
            'subject_block': self.subject_block,
            'base_score': self.base_score,
            'tuition_fee': self.tuition_fee,
            'ranking_note': self.ranking_note,
            'quota': self.quota,
            'school_type': self.school_type,
            'score_thpt_last_year': self.score_thpt_last_year,
            'score_dgnl': self.score_dgnl,
            'combo_cert': self.combo_cert,
            'direct_admission': self.direct_admission,
            'aptitude_test': self.aptitude_test,
            'year':self.year,
            # Trả về các tags AI đã map với ngành học
            'ai_interests': [i.name for i in self.interests], 
            'ai_environments': [e.id for e in self.environments]
        }

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    id = db.Column(db.Integer, primary_key=True)
    action_type = db.Column(db.String(50))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.now())

# ========================================================
# BẢNG 2: THÔNG TIN CHI TIẾT (KHI ẤN VÀO "XEM THÔNG TIN")
# ========================================================
class UniversityDetail(db.Model):
    __tablename__ = 'university_details'
    
    id = db.Column(db.Integer, primary_key=True)
    # Khóa ngoại trỏ thẳng vào id của bảng university_data
    university_id = db.Column(db.Integer, db.ForeignKey('university_data.id'), nullable=False)
    
    description = db.Column(db.Text)
    address = db.Column(db.String(255))
    
    website = db.Column(db.String(150))
    phone = db.Column(db.String(20))
    admission_methods = db.Column(db.Text)

    def to_dict(self):
        return {
            "description": self.description,
            "address": self.address,
                       "website": self.website,
            "phone": self.phone,
            "admission_methods": self.admission_methods
        }






class QuizResult(db.Model):
    __tablename__ = 'quiz_results'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Cột lưu loại bài test (holland hoặc mbti)
    quiz_type = db.Column(db.String(50), default="holland")
    
    # Tên nhóm tính cách (VD: "Người Giúp Đỡ (Social)")
    personality_group = db.Column(db.String(150), nullable=False)
    
    # (Tùy chọn) Lưu mô tả ngắn về nhóm tính cách đó
    description = db.Column(db.Text)
    
    # Thời gian làm bài test
    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'quiz_type': self.quiz_type, 
            'personality_group': self.personality_group,
            'description': self.description,
            'created_at': self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }

class Career(db.Model):
    __tablename__ = 'careers'
    id = db.Column(db.Integer, primary_key=True)
    personality_keyword = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    icon = db.Column(db.String(50))
    description = db.Column(db.Text)
    is_top = db.Column(db.Boolean, default=False)

# ĐÃ THÊM: Bảng lưu trữ Ngân hàng câu hỏi
class QuestionBank(db.Model):
    __tablename__ = 'question_bank'
    
    id = db.Column(db.Integer, primary_key=True)
    quiz_type = db.Column(db.String(20), nullable=False) # 'holland' hoặc 'mbti'
    question_text = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(10), nullable=False) # R, I, A... hoặc E, I, S...

    def to_dict(self):
        return {
            "id": self.id,
            "quiz_type": self.quiz_type,
            "text": self.question_text,
            "category": self.category
        }
    
class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), default="Cuộc trò chuyện mới")
    created_at = db.Column(db.DateTime, default=db.func.now())
    is_flagged = db.Column(db.Boolean, default=False) # Thêm dòng này
    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "title": self.title, "is_flagged": self.is_flagged}

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False) # 'user' hoặc 'bot'
    content = db.Column(db.Text, nullable=False)
    image_data = db.Column(LONGTEXT)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {"id": self.id, "session_id": self.session_id, "sender": self.sender, "content": self.content, "image": self.image_data}
    


from datetime import datetime


# Nhớ đảm bảo bạn đã import datetime ở đầu file nếu dùng created_at nhé

class RoiHistory(db.Model):
    __tablename__ = 'roi_calculations'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    # --- GIAI ĐOẠN ĐI HỌC (ĐẦU TƯ) ---
    tuition_per_year = db.Column(db.Numeric(15, 2), nullable=False)
    uni_living_per_month = db.Column(db.Numeric(15, 2), default=0)       # CỘT MỚI: Trọ + Ăn lúc học
    study_years = db.Column(db.Integer, nullable=False)
    
    # --- GIAI ĐOẠN ĐI LÀM (THU HỒI VỐN) ---
    starting_salary = db.Column(db.Numeric(15, 2), nullable=False)
    post_grad_living_per_month = db.Column(db.Numeric(15, 2), default=0) # CỘT MỚI: Trọ + Ăn lúc làm
    
    # --- KẾT QUẢ PHÂN TÍCH TỪ AI ---
    calculated_roi_percent = db.Column(db.Numeric(10, 2))                # Nâng lên (10,2) cho an toàn
    real_surplus = db.Column(db.Numeric(15, 2))                          # CỘT MỚI: Lãi/Lỗ Ròng
    
    # --- THỜI GIAN LƯU ---
    created_at = db.Column(db.DateTime, default=datetime.utcnow)         # CỘT MỚI: Lưu thời gian tính

    def __repr__(self):
        return f"<RoiHistory ROI:{self.calculated_roi_percent}% Surplus:{self.real_surplus}>"



# ==========================================================
# BẢNG MASTER: TỪ KHÓA SỞ THÍCH
# ==========================================================
class MasterInterest(db.Model):
    __tablename__ = 'master_interests'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

# ==========================================================
# BẢNG MASTER: MÔI TRƯỜNG LÀM VIỆC
# ==========================================================
class MasterWorkEnvironment(db.Model):
    __tablename__ = 'master_work_environments'
    id = db.Column(db.String(50), primary_key=True)
    icon = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id, 
            'icon': self.icon, 
            'title': self.title, 
            'desc': self.description
        }

class MasterSubjectBlock(db.Model):
    __tablename__ = 'master_subject_blocks'
    
    id = db.Column(db.String(10), primary_key=True)
    subjects = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    block_type = db.Column(db.String(50))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.id, # Trả về thêm 'name' trùng với 'id' vì React của bạn đang dùng b.name
            'subjects': [s.strip() for s in self.subjects.split(',')] if self.subjects else [], # Cắt chuỗi thành mảng luôn cho xịn!
            'description': self.description or '',
            'type': self.block_type or 'Tự nhiên'
        }

# Thêm bảng này vào dưới các bảng hiện có của bạn
class UserFavorite(db.Model):
    __tablename__ = 'user_favorites'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False) # ID của User (Giả sử mặc định là 1)
    university_id = db.Column(db.Integer, db.ForeignKey('university_data.id'), nullable=False)

class OrientationProfile(db.Model):
    __tablename__ = 'orientation_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    interests = db.Column(db.JSON)  # Lưu mảng dưới dạng JSON
    work_environment = db.Column(db.String(255))
    gpa_10 = db.Column(db.Float)
    gpa_11 = db.Column(db.Float)
    gpa_12 = db.Column(db.Float)
    exam_score = db.Column(db.Float)
    dgnl_score = db.Column(db.Float)
    ielts_score = db.Column(db.String(20))
    sat_score = db.Column(db.Integer)
    prize_level = db.Column(db.String(50))
    has_portfolio = db.Column(db.Boolean)
    target_block = db.Column(db.String(20))
    study_location = db.Column(db.String(100))
    tuition_limit = db.Column(db.BigInteger)
    living_cost_monthly = db.Column(db.BigInteger)
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'interests': self.interests,
            'work_environment': self.work_environment,
            'gpa_10': self.gpa_10,
            'gpa_11': self.gpa_11,
            'gpa_12': self.gpa_12,
            'exam_score': self.exam_score,
            'dgnl_score': self.dgnl_score,
            'ielts_score': self.ielts_score,
            'sat_score': self.sat_score,
            'prize_level': self.prize_level,
            'has_portfolio': self.has_portfolio,
            'target_block': self.target_block,
            'study_location': self.study_location,
            'tuition_limit': self.tuition_limit,
            'living_cost_monthly': self.living_cost_monthly
        }
 

    # ==========================================
# 🚀 1. THÊM MODEL MỚI CHO BẢNG MENTORS
# ==========================================
class Mentor(db.Model):
    __tablename__ = 'mentors'
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    specialty = db.Column(db.String(100))
    experience_years = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Mối quan hệ: 1 Cố vấn có nhiều Giờ rảnh và nhiều Lịch hẹn
    slots = db.relationship('MentorSlot', backref='mentor_info', lazy=True, cascade="all, delete-orphan")
    bookings = db.relationship('Booking', backref='mentor_info', foreign_keys='Booking.mentor_id', lazy=True, cascade="all, delete-orphan")


# ==========================================
# 🚀 2. SỬA MODEL MENTOR_SLOT
# ==========================================
class MentorSlot(db.Model):
    __tablename__ = 'mentor_slots'
    
    id = db.Column(db.Integer, primary_key=True)
    # SỬA Ở ĐÂY: 'mentors.id' thay vì 'user.id'
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.id'), nullable=False) 
    
    date = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.String(10), nullable=False)
    is_booked = db.Column(db.Boolean, default=False)

    __table_args__ = (
        db.UniqueConstraint('mentor_id', 'date', 'start_time', name='_mentor_datetime_uc'),
    )


# ==========================================
# 🚀 3. SỬA MODEL BOOKING
# ==========================================
class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # SỬA Ở ĐÂY: 'mentors.id' thay vì 'user.id'
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.id'), nullable=False)
    slot_id = db.Column(db.Integer, db.ForeignKey('mentor_slots.id'), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Mối quan hệ để dễ query lấy tên học sinh và thông tin giờ rảnh
    student = db.relationship('User', foreign_keys=[student_id], backref='my_bookings')
    slot = db.relationship('MentorSlot', backref='booking_details')

class UserReport(db.Model):
    __tablename__ = 'user_reports'
    id = db.Column(db.Integer, primary_key=True)
    reported_user_id = db.Column(db.Integer)
    reason = db.Column(db.Text)
    status = db.Column(db.String(50), default='Pending')
    created_at = db.Column(db.DateTime, default=db.func.now())

class AITrainingLog(db.Model):
    __tablename__ = 'ai_training_logs'
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(255), nullable=False)
    source = db.Column(db.String(255))
    time_str = db.Column(db.String(100))
    status = db.Column(db.String(50))
    size = db.Column(db.String(50))
    is_running = db.Column(db.Boolean, default=False)

class MentorReview(db.Model):
    __tablename__ = 'mentor_reviews'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.id'), nullable=False)
    rating = db.Column(db.Float, nullable=False) # Số sao: 1.0 đến 5.0
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.now())