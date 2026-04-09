from extensions import db

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
    
class UniversityData(db.Model):
    __tablename__ = 'university_data'

    id = db.Column(db.Integer, primary_key=True)
    school_name = db.Column(db.String(150), nullable=False)
    major_name = db.Column(db.String(150), nullable=False)
    school_logo = db.Column(db.String(255)) # Link ảnh logo
    subject_block = db.Column(db.String(10), nullable=False) # Khối thi (VD: A01)
    base_score = db.Column(db.Float, nullable=False) # Điểm chuẩn năm trước
    tuition_fee = db.Column(db.String(100)) # Học phí (VD: ~40tr/năm)
    ranking_note = db.Column(db.String(100)) # Ghi chú xếp hạng

    def to_dict(self):
        return {
            'id': self.id,
            'school_name': self.school_name,
            'major_name': self.major_name,
            'school_logo': self.school_logo,
            'subject_block': self.subject_block,
            'base_score': self.base_score,
            'tuition_fee': self.tuition_fee,
            'ranking_note': self.ranking_note
        }
    

class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    class_name = db.Column(db.String(50))
    school_name = db.Column(db.String(150))
    target_block = db.Column(db.String(10))

class Score(db.Model):
    __tablename__ = 'scores'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Float, nullable=False)

class Strength(db.Model):
    __tablename__ = 'strengths'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    percent = db.Column(db.Integer, nullable=False)

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

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "title": self.title}

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False) # 'user' hoặc 'bot'
    content = db.Column(db.Text, nullable=False)
    image_data = db.Column(db.Text) # Lưu ảnh base64 nếu có
    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {"id": self.id, "session_id": self.session_id, "sender": self.sender, "content": self.content, "image": self.image_data}
    
class Mentor(db.Model):
    __tablename__ = 'mentors'
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(150), nullable=False)
    company = db.Column(db.String(150), nullable=False)
    img_url = db.Column(db.Text)

class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_name = db.Column(db.String(100), nullable=False)
    student_email = db.Column(db.String(120), nullable=False)
    mentor_id = db.Column(db.String(50), db.ForeignKey('mentors.id'), nullable=False)
    booking_date = db.Column(db.Date, nullable=False)
    booking_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default='Pending')

class RoiHistory(db.Model):
    __tablename__ = 'roi_history'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tuition_per_year = db.Column(db.Numeric(15, 2), nullable=False)
    study_years = db.Column(db.Integer, nullable=False)
    starting_salary = db.Column(db.Numeric(15, 2), nullable=False)
    calculated_roi_percent = db.Column(db.Numeric(8, 2))