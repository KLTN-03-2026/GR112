import jwt, datetime, random, os
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
from sqlalchemy import or_
from google import genai 

from extensions import db, mail
from models import User, ContactMessage, UniversityData, StudentProfile, Score, Strength, QuizResult, Career,QuestionBank, ChatSession, ChatMessage,RoiHistory,Booking,Mentor

# ==========================================
# 1. KHAI BÁO BLUEPRINT & AI CLIENT
# ==========================================
api_bp = Blueprint('api_bp', __name__)
chat_bp = Blueprint('chat', __name__)

client = genai.Client(api_key="AIzaSyCkNE_KPI23vJrTuAshMFcaeSbvBPN6QgA")

# ==========================================
# 2. BỘ LỌC PHÂN QUYỀN ADMIN
# ==========================================
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Thiếu Token!'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            user = User.query.get(data['user_id'])
            if not user or user.role != 'admin':
                return jsonify({'message': 'Quyền truy cập bị từ chối! Bạn không phải Admin.'}), 403
        except Exception as e:
            return jsonify({'message': 'Token không hợp lệ hoặc đã hết hạn!'}), 401
        return f(*args, **kwargs)
    return decorated

# ==========================================
# 3. API KIỂM TRA MẠNG
# ==========================================
@api_bp.route('/')
def home():
    return "SERVER OK"

# ==========================================
# 4. TÀI KHOẢN (ĐĂNG KÝ, OTP, ĐĂNG NHẬP, QUÊN MK)
# ==========================================
@api_bp.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get("email")
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email đã tồn tại"}), 400

    hashed_password = generate_password_hash(data.get("password"))
    otp = str(random.randint(100000, 999999))
    expire_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)

    user = User(
        name=data.get("name"), email=email, password=hashed_password,
        otp=otp, otp_expire=expire_time, role="user"
    )
    db.session.add(user)
    db.session.commit()

    try:
        msg = Message("Mã OTP xác thực", sender=current_app.config['MAIL_USERNAME'], recipients=[email])
        msg.body = f"Mã OTP của bạn là: {otp}"
        mail.send(msg)
    except Exception as e:
        print("Lỗi gửi mail:", e)

    return jsonify({"message": "Đã gửi OTP"}), 200

@api_bp.route('/api/verify-otp', methods=['POST'])
def verify():
    data = request.json
    user = User.query.filter_by(email=data.get("email")).first()

    if not user: return jsonify({"error": "Không tìm thấy user"}), 404
    if user.otp != data.get("otp"): return jsonify({"error": "OTP sai"}), 400
    if datetime.datetime.utcnow() > user.otp_expire: return jsonify({"error": "OTP hết hạn"}), 400

    user.verified = True
    user.otp = None 
    db.session.commit()
    return jsonify({"message": "Xác thực thành công"}), 200

@api_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get("email")).first()

    if not user: return jsonify({"error": "Sai email"}), 400
    if not check_password_hash(user.password, data.get("password")): return jsonify({"error": "Sai mật khẩu"}), 400
    if not user.verified: return jsonify({"error": "Chưa xác thực OTP"}), 400

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "token": token, "message": "Đăng nhập thành công",
        "user": {
            "id": user.id, "name": user.name, "fullName": user.full_name,
            "email": user.email, "role": user.role, "phone": user.phone_number,
            "dob": str(user.date_of_birth) if user.date_of_birth else "", "address": user.address
        }
    }), 200

@api_bp.route('/api/resend-otp', methods=['POST'])
def resend():
    user = User.query.filter_by(email=request.json.get("email")).first()
    if not user: return jsonify({"error": "Không tìm thấy user"}), 404

    otp = str(random.randint(100000, 999999))
    user.otp = otp
    user.otp_expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
    db.session.commit()

    try:
        msg = Message("OTP mới", sender=current_app.config['MAIL_USERNAME'], recipients=[user.email])
        msg.body = f"OTP mới của bạn là: {otp}"
        mail.send(msg)
    except: pass
    return jsonify({"message": "Đã gửi lại OTP"}), 200

@api_bp.route('/api/change-password', methods=['POST'])
def change_password():
    data = request.json
    user = User.query.filter_by(email=data.get("email")).first()

    if not user: return jsonify({"error": "Người dùng không tồn tại"}), 404
    if not check_password_hash(user.password, data.get("old_password")): 
        return jsonify({"error": "Mật khẩu hiện tại không đúng!"}), 400

    user.password = generate_password_hash(data.get("new_password"))
    db.session.commit()
    return jsonify({"message": "Đổi mật khẩu thành công!"}), 200

@api_bp.route('/api/send-otp', methods=['POST'])
def send_forgot_password_otp():
    user = User.query.filter_by(email=request.json.get("email")).first()
    if not user: return jsonify({"message": "Email không tồn tại trong hệ thống!"}), 404

    otp = str(random.randint(100000, 999999))
    user.otp = otp
    user.otp_expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
    db.session.commit()

    try:
        msg = Message("Khôi phục mật khẩu - ConsulTing",
                      sender=current_app.config['MAIL_USERNAME'], recipients=[user.email])
        msg.body = f"Chào bạn,\n\nMã OTP để khôi phục mật khẩu của bạn là: {otp}\nMã này có hiệu lực trong 5 phút."
        mail.send(msg)
    except Exception as e:
        return jsonify({"message": "Lỗi hệ thống gửi mail"}), 500
    return jsonify({"message": "Đã gửi mã OTP đến email của bạn!"}), 200

@api_bp.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    user = User.query.filter_by(email=data.get("email")).first()

    if not user: return jsonify({"message": "Không tìm thấy tài khoản"}), 404
    if user.otp != data.get("otp"): return jsonify({"message": "Mã OTP không chính xác"}), 400
    if datetime.datetime.utcnow() > user.otp_expire: return jsonify({"message": "Mã OTP đã hết hạn"}), 400

    user.password = generate_password_hash(data.get("newPassword"))
    user.otp = None 
    db.session.commit()
    return jsonify({"message": "Đổi mật khẩu thành công!"}), 200

# =========================================================
# 5. LIÊN HỆ
# =========================================================
@api_bp.route('/api/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        message_content = data.get('message')

        if not name or not email or not message_content:
            return jsonify({'error': 'Vui lòng điền đầy đủ thông tin!'}), 400

        new_msg = ContactMessage(name=name, email=email, message=message_content)
        db.session.add(new_msg)
        db.session.commit()

        subject = f"ConsulTing - Có tin nhắn mới từ {name}!" 
        msg = Message(subject=subject, sender=current_app.config.get('MAIL_USERNAME'), recipients=['vanlinhpham03@gmail.com']) 
        msg.body = f"Tên: {name}\nEmail: {email}\nLời nhắn:\n{message_content}"
        mail.send(msg)

        return jsonify({'message': 'Gửi tin nhắn thành công!', 'data': new_msg.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# =========================================================
# 6. PHÂN TÍCH ĐIỂM (CŨ)
# =========================================================
@api_bp.route('/api/analyze-score', methods=['POST'])
def analyze_score():
    try:
        data = request.get_json()
        subject_block = data.get('block', 'A01')
        math = float(data.get('math', 0))
        physics = float(data.get('physics', 0))
        english = float(data.get('english', 0))

        total_score = round(math + physics + english, 2)
        majors = UniversityData.query.filter_by(subject_block=subject_block).all()

        safe_list, moderate_list, challenge_list = [], [], []

        for major in majors:
            diff = total_score - major.base_score
            match_percent = min(99, max(10, int(50 + (diff * 20)))) 
            school_data = major.to_dict()
            school_data['match_percent'] = match_percent

            if diff >= 0.2: safe_list.append(school_data)
            elif -1.5 <= diff < 0.2: moderate_list.append(school_data)
            elif -3.0 <= diff < -1.5: challenge_list.append(school_data)

        safe_list = sorted(safe_list, key=lambda x: x['match_percent'], reverse=True)
        moderate_list = sorted(moderate_list, key=lambda x: x['match_percent'], reverse=True)
        challenge_list = sorted(challenge_list, key=lambda x: x['match_percent'], reverse=True)

        ai_explanation = f"Dựa trên điểm số {total_score} khối {subject_block}, bạn thuộc nhóm thí sinh có điểm tốt. Tuy nhiên, thuật toán của chúng tôi phát hiện xu hướng dịch chuyển, điểm chuẩn các ngành liên quan có thể biến động nhẹ (+- 0.5 điểm)."

        return jsonify({
            'total_score': total_score,
            'results': { 'safe': safe_list[:2], 'moderate': moderate_list[:4], 'challenge': challenge_list[:1] },
            'ai_explanation': ai_explanation
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500    

# =========================================================
# 7. TƯ VẤN AI (ĐÃ SỬA LỖI TÊN & LẤY DỮ LIỆU)
# =========================================================
import time
import base64
from io import BytesIO
from PIL import Image
import google.generativeai as genai
from flask import request, jsonify

# (Đảm bảo bạn đã import User, ChatSession, ChatMessage, UniversityData ở trên cùng file nhé)

# --- 1. LẤY DANH SÁCH CÁC CUỘC TRÒ CHUYỆN ---
@chat_bp.route('/api/chat/sessions/<int:user_id>', methods=['GET'])
def get_chat_sessions(user_id):
    try:
        sessions = ChatSession.query.filter_by(user_id=user_id).order_by(ChatSession.id.desc()).all()
        return jsonify([s.to_dict() for s in sessions]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- 2. LẤY TIN NHẮN CỦA 1 CUỘC TRÒ CHUYỆN ---
@chat_bp.route('/api/chat/history/<int:session_id>', methods=['GET'])
def get_chat_history(session_id):
    try:
        messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.id.asc()).all()
        return jsonify([m.to_dict() for m in messages]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- 3. TỔNG HỢP API CHAT (Lưu DB + AI 3.1 Lite + Lấy tên thật + Chống lỗi) ---
@chat_bp.route('/api/chat', methods=['POST'])
def chat_api():
    try:
        data = request.json
        user_message = data.get('message', '')
        user_id = data.get('userId')
        session_id = data.get('sessionId') # Có thể None nếu là chat mới
        image_data = data.get('image') 

        if not user_id:
            return jsonify({"error": "Vui lòng đăng nhập"}), 401
        if not user_message and not image_data:
            return jsonify({"error": "Vui lòng nhập tin nhắn"}), 400

        # === BƯỚC A: CHUẨN BỊ DỮ LIỆU CÁ NHÂN HÓA ===
        real_name = "Bạn"
        user = User.query.get(user_id)
        if user:
            real_name = user.full_name or user.name or "Bạn"

        # Tìm trường đại học trong DB (nếu là câu hỏi văn bản)
        db_results = []
        context_text = ""
        if user_message and not image_data:
            search_term = user_message[:20] 
            db_results = UniversityData.query.filter(
                (UniversityData.major_name.like(f"%{search_term}%")) | 
                (UniversityData.school_name.like(f"%{search_term}%"))
            ).limit(5).all()

            for r in db_results:
                context_text += f"- Trường {r.school_name}, ngành {r.major_name}, điểm {r.base_score}, học phí {r.tuition_fee}.\n"

        # === BƯỚC B: QUẢN LÝ DATABASE (PHIÊN CHAT & TIN NHẮN USER) ===
        if not session_id:
            title = user_message[:30] + "..." if user_message else "Hỏi đáp bằng hình ảnh"
            new_session = ChatSession(user_id=user_id, title=title)
            db.session.add(new_session)
            db.session.commit()
            session_id = new_session.id

        user_msg_db = ChatMessage(session_id=session_id, sender='user', content=user_message, image_data=image_data)
        db.session.add(user_msg_db)
        db.session.commit()

        # === BƯỚC C: GỌI GOOGLE AI (KÈM CƠ CHẾ CHỐNG 503/429) ===
        prompt_content = f"""
        Bạn là chuyên gia tư vấn tuyển sinh thông minh UniAI.
        Tên người dùng: {real_name}.
        Dữ liệu thực tế từ Database:
        {context_text if context_text else "Không tìm thấy dữ liệu trường, hãy tư vấn dựa trên kiến thức của bạn."}

        Câu hỏi: "{user_message}"

        YÊU CẦU:
        1. Trả lời thân thiện, gọi đúng tên là {real_name}.
        2. Nếu có dữ liệu phía trên, ưu tiên dùng nó. Trình bày dễ đọc.
        """

        model = genai.GenerativeModel('gemini-2.5-flash') 
        response_text = ""
        max_retries = 3
        delay = 2

        for attempt in range(max_retries):
            try:
                if image_data:
                    image_bytes = base64.b64decode(image_data.split(',')[1]) 
                    img = Image.open(BytesIO(image_bytes))
                    # Có ảnh thì chỉ truyền ảnh và câu hỏi trực tiếp (không nhét context để AI tập trung nhìn ảnh)
                    response = model.generate_content([img, user_message if user_message else "Phân tích ảnh này."])
                else:
                    # Gửi câu hỏi văn bản kèm bối cảnh
                    response = model.generate_content(prompt_content)
                
                response_text = response.text
                break # Nếu thành công thì thoát vòng lặp
                
            except Exception as ai_e:
                error_str = str(ai_e)
                if "503" in error_str and attempt < max_retries - 1:
                    time.sleep(delay)
                    delay *= 2 # Đợi lâu hơn ở lần thử tiếp theo
                    continue
                
                if "429" in error_str:
                    response_text = "bn ơi, AI đang hết lượt sử dụng do quá tải. Đợi 1 phút rồi nhắn lại nhé! ☕"
                else:
                    response_text = "Hệ thống AI đang quá tải, bn đợi 30 giây rồi thử lại nha! 😢"
                break # Dừng vòng lặp luôn

        # === BƯỚC D: LƯU PHẢN HỒI CỦA AI VÀ TRẢ VỀ REACT ===
        bot_msg_db = ChatMessage(session_id=session_id, sender='bot', content=response_text)
        db.session.add(bot_msg_db)
        db.session.commit()

        # Format lại dữ liệu trường học để gửi qua React
        recommendations = [{
            "name": r.school_name, "major": r.major_name,
            "score": r.base_score, "logo": r.school_logo
        } for r in db_results] if db_results else []

        return jsonify({
            "sessionId": session_id,
            "text": response_text,
            "data": recommendations 
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# --- 4. XÓA CUỘC TRÒ CHUYỆN ---
@chat_bp.route('/api/chat/sessions/<int:session_id>', methods=['DELETE'])
def delete_chat_session(session_id):
    try:
        # Xóa tất cả tin nhắn trong session này trước
        ChatMessage.query.filter_by(session_id=session_id).delete()
        # Xóa session
        session = ChatSession.query.get(session_id)
        if session:
            db.session.delete(session)
            db.session.commit()
        return jsonify({"message": "Đã xóa thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# =========================================================
# 8. THÔNG TIN HỒ SƠ (CẬP NHẬT GIAO DIỆN CHATBOT)
# =========================================================
@chat_bp.route('/api/get-full-profile/<int:uid>', methods=['GET'])
def get_full_profile(uid):
    try:
        user = User.query.get(uid)
        if not user: return jsonify({"error": "Không tìm thấy user"}), 404

        profile = StudentProfile.query.filter_by(user_id=uid).first()
        db_scores = Score.query.filter_by(user_id=uid).all()
        scores_dict = {s.subject: s.score for s in db_scores}

        db_strengths = Strength.query.filter_by(user_id=uid).all()
        strengths_dict = {st.name: st.percent for st in db_strengths}

        # ==========================================
        # ĐÃ SỬA: LẤY CẢ 2 BÀI TEST HOLLAND & MBTI
        # ==========================================
        holland_quiz = QuizResult.query.filter_by(user_id=uid, quiz_type='holland').first()
        mbti_quiz = QuizResult.query.filter_by(user_id=uid, quiz_type='mbti').first()
        
        holland_personality = holland_quiz.personality_group if holland_quiz else None
        mbti_personality = mbti_quiz.personality_group if mbti_quiz else None

        # Gộp chung chuỗi tính cách lại để query tìm nghề nghiệp (Careers) cho đa dạng
        combined_personality = f"{holland_personality or ''} {mbti_personality or ''}"

        careers_data = []
        if combined_personality.strip(): # Nếu người dùng đã làm ít nhất 1 bài test
            all_careers = Career.query.all()
            for c in all_careers:
                # Tìm xem keyword của nghề có nằm trong chuỗi kết quả Holland hoặc MBTI không
                if c.personality_keyword and c.personality_keyword in combined_personality:
                    careers_data.append({
                        "title": c.title, "icon": c.icon,
                        "desc": c.description, "top": c.is_top
                    })
        
        if not careers_data:
            careers_data = [{"title": "Kỹ sư Phần mềm", "icon": "fas fa-laptop-code", "desc": "Gợi ý: Ngành đang khát nhân lực.", "top": True}]

        return jsonify({
            "name": user.full_name or user.name,
            "class": profile.class_name if profile else "",
            "school": profile.school_name if profile else "",
            "target_block": profile.target_block if profile else "Chưa chọn",
            "scores": scores_dict,
            "strengths": strengths_dict,
            
            # Trả về 2 biến mới cho giao diện Chatbot.jsx hiển thị
            "holland_personality": holland_personality,
            "mbti_personality": mbti_personality,
            
            # Vẫn giữ biến cũ đề phòng các trang khác (như Profile) đang dùng bị lỗi
            "personality": holland_personality or mbti_personality, 
            "careers": careers_data 
        }), 200
    except Exception as e:
        import traceback
        print(traceback.format_exc()) # Báo lỗi ra Terminal cho dễ fix nếu lỡ sập
        return jsonify({"error": str(e)}), 500
    
@api_bp.route('/api/update-profile', methods=['PUT'])
def update_profile_basic():
    data = request.json
    user = User.query.filter_by(email=data.get("email")).first()
    if not user: return jsonify({"error": "Không tìm thấy!"}), 404

    user.full_name = data.get("fullName")
    user.name = data.get("username") 
    user.role = data.get("role")
    user.phone_number = data.get("phone")
    user.address = data.get("address")
    user.date_of_birth = data.get("dob") if data.get("dob") else None
    db.session.commit()
    return jsonify({"message": "Cập nhật thành công"}), 200

@chat_bp.route('/api/update-profile', methods=['POST'])
def update_profile_chatbot():
    try:
        data = request.json
        uid = data.get('userId') 
        if not uid: return jsonify({"error": "Thiếu ID"}), 400

        p_info = data.get('personalInfo', {})
        s_data = data.get('scores', {}) 
        st_data = data.get('strengths', {}) 

        user = User.query.get(uid)
        user.full_name = p_info.get('fullName')
        
        profile = StudentProfile.query.filter_by(user_id=uid).first()
        if not profile:
            profile = StudentProfile(user_id=uid)
            db.session.add(profile)
        
        profile.class_name = p_info.get('className')
        profile.school_name = p_info.get('schoolName')
        profile.target_block = p_info.get('targetBlock')

        Score.query.filter_by(user_id=uid).delete()
        for subject_key, score_val in s_data.items():
            if score_val is not None and str(score_val).strip() != '':
                db.session.add(Score(user_id=uid, subject=subject_key, score=float(score_val)))

        Strength.query.filter_by(user_id=uid).delete()
        strength_names = { "logic": "Tư duy logic", "giai_quyet_van_de": "Giải quyết vấn đề", "lam_viec_nhom": "Làm việc nhóm", "giao_tiep": "Giao tiếp", "sang_tao": "Sáng tạo" }
        for key, percent_val in st_data.items():
            db.session.add(Strength(user_id=uid, name=strength_names.get(key, key), percent=int(percent_val)))

        db.session.commit()
        return jsonify({"message": "Đã lưu hồ sơ thành công!"}), 200
    except Exception as e:
        db.session.rollback() 
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/api/get-profile/<int:uid>', methods=['GET'])
def get_profile(uid):
    try:
        profile = StudentProfile.query.filter_by(user_id=uid).first()
        if not profile: return jsonify({"targetBlock": "A01"}), 200 
            
        return jsonify({
            "targetBlock": profile.target_block,
            "schoolName": profile.school_name,
            "className": profile.class_name
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================================================
# 9. LÀM BÀI TRẮC NGHIỆM VÀ LƯU TEST
# =========================================================
from sqlalchemy import or_

@chat_bp.route('/api/submit-quiz', methods=['POST'])
def submit_quiz():
    try:
        data = request.json
        answers = data.get('answers', {})
        quiz_type = data.get('quizType', 'holland') # Mặc định là holland nếu không có
        
        result_data = {}
        keywords = []
        top_trait_or_mbti = ""
        raw_scores = {}

        # ĐÃ THÊM: Tự động lấy bộ Mapping (ID câu hỏi -> Loại tính cách) từ Database
        db_questions = QuestionBank.query.filter_by(quiz_type=quiz_type).all()
        # Tạo mapping dạng: {"1": "R", "2": "I", "3": "E"...}
        dynamic_mapping = {str(q.id): q.category for q in db_questions}

        # ==========================================
        # 1. XỬ LÝ NẾU LÀ BÀI TEST HOLLAND
        # ==========================================
        if quiz_type == 'holland':
            scores = {"R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0}
            
            for q_id, score in answers.items():
                # Dùng dynamic_mapping lấy từ DB thay cho danh sách cứng
                trait = dynamic_mapping.get(str(q_id))
                if trait and trait in scores: 
                    scores[trait] += int(score)
                    
            top_trait = max(scores, key=scores.get)
            top_trait_or_mbti = top_trait
            raw_scores = scores
            
            riasec_database = {
                "R": {"name": "Người Thực Tế (Realistic)", "desc": "Bạn thích làm việc với máy móc, công cụ... Phù hợp với các ngành kỹ thuật.", "careers": ["Kỹ sư Điện tử", "Tự động hóa", "Kiến trúc sư", "Cơ khí"]},
                "I": {"name": "Nhà Nghiên Cứu (Investigative)", "desc": "Bạn là người có tư duy logic, thích phân tích dữ liệu và giải quyết bài toán phức tạp.", "careers": ["Khoa học Máy tính", "Kỹ sư AI", "Phân tích dữ liệu", "Bác sĩ"]},
                "A": {"name": "Người Sáng Tạo (Artistic)", "desc": "Bạn có trí tưởng tượng phong phú, thích tự do và thẩm mỹ cao.", "careers": ["Thiết kế Đồ họa", "Truyền thông", "Marketing", "Kiến trúc"]},
                "S": {"name": "Người Giúp Đỡ (Social)", "desc": "Bạn thích làm việc với con người, có EQ cao. Rất giỏi đồng cảm và giảng dạy.", "careers": ["Sư phạm", "Tâm lý học", "Ngôn ngữ", "Quản trị Nhân sự"]},
                "E": {"name": "Người Dẫn Dắt (Enterprising)", "desc": "Bạn có khả năng lãnh đạo, đam mê kinh doanh và có tầm nhìn chiến lược.", "careers": ["Quản trị Kinh doanh", "Marketing", "Kinh tế", "Logistics"]},
                "C": {"name": "Người Tổ Chức (Conventional)", "desc": "Bạn thích làm việc với hệ thống, quy trình và số liệu chính xác.", "careers": ["Kế toán", "Tài chính", "Kiểm toán", "Hành chính"]}
            }
            
            search_keywords = {
                "R": ["Kỹ thuật", "Cơ khí", "Tự động hóa", "Điện tử", "Xây dựng", "Ô tô"],
                "I": ["Khoa học máy tính", "Công nghệ thông tin", "Dữ liệu", "Trí tuệ nhân tạo", "Y khoa", "Dược"],
                "A": ["Thiết kế", "Đồ họa", "Truyền thông", "Báo chí", "Mỹ thuật", "Marketing"],
                "S": ["Sư phạm", "Tâm lý", "Ngôn ngữ", "Xã hội", "Nhân sự"],
                "E": ["Quản trị", "Kinh doanh", "Kinh tế", "Thương mại", "Marketing", "Logistics"],
                "C": ["Kế toán", "Tài chính", "Ngân hàng", "Kiểm toán"]
            }

            result_data = riasec_database.get(top_trait, {})
            keywords = search_keywords.get(top_trait, [])

        # ==========================================
        # 2. XỬ LÝ NẾU LÀ BÀI TEST MBTI
        # ==========================================
        elif quiz_type == 'mbti':
            scores = {"E": 0, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0}
            
            for q_id, score in answers.items():
                # Dùng dynamic_mapping lấy từ DB thay cho danh sách cứng
                trait = dynamic_mapping.get(str(q_id))
                if trait and trait in scores: 
                    scores[trait] += int(score)

            # Tính toán 4 cặp chữ cái MBTI
            e_i = "E" if scores["E"] >= scores["I"] else "I"
            s_n = "S" if scores["S"] >= scores["N"] else "N"
            t_f = "T" if scores["T"] >= scores["F"] else "F"
            j_p = "J" if scores["J"] >= scores["P"] else "P"
            
            mbti_type = e_i + s_n + t_f + j_p
            top_trait_or_mbti = mbti_type
            raw_scores = scores

            # Từ điển 16 nhóm MBTI thu gọn
            mbti_database = {
                "INTJ": {"name": "Kiến trúc sư (INTJ)", "desc": "Tư duy chiến lược, độc lập và logic.", "careers": ["Kỹ sư phần mềm", "Phân tích tài chính", "Kiến trúc sư"]},
                "INTP": {"name": "Nhà logic học (INTP)", "desc": "Sáng tạo, đam mê phân tích và khám phá.", "careers": ["Lập trình viên", "Nhà nghiên cứu khoa học", "Toán học"]},
                "ENTJ": {"name": "Người chỉ huy (ENTJ)", "desc": "Lãnh đạo táo bạo, quyết đoán và tài năng.", "careers": ["Quản trị doanh nghiệp", "Luật sư", "Khởi nghiệp"]},
                "ENTP": {"name": "Người tranh luận (ENTP)", "desc": "Thông minh, thích thử thách và tranh luận.", "careers": ["Marketing", "Luật sư", "Quan hệ công chúng"]},
                "INFJ": {"name": "Người che chở (INFJ)", "desc": "Sâu sắc, có lý tưởng và nguyên tắc vững vàng.", "careers": ["Tâm lý học", "Nhà văn", "Sư phạm"]},
                "INFP": {"name": "Người hòa giải (INFP)", "desc": "Tốt bụng, vị tha và giàu lòng trắc ẩn.", "careers": ["Thiết kế", "Viết lách", "Nghệ thuật"]},
                "ENFJ": {"name": "Người chỉ dẫn (ENFJ)", "desc": "Lãnh đạo truyền cảm hứng, thấu hiểu người khác.", "careers": ["Quản lý nhân sự", "Giáo viên", "Truyền thông"]},
                "ENFP": {"name": "Người truyền cảm hứng (ENFP)", "desc": "Nhiệt huyết, sáng tạo và luôn lạc quan.", "careers": ["Báo chí", "Giải trí", "Marketing"]},
                "ISTJ": {"name": "Nhà kho vận (ISTJ)", "desc": "Thực tế, có trách nhiệm và đề cao sự thật.", "careers": ["Kế toán", "Quản trị mạng", "Logistics"]},
                "ISFJ": {"name": "Người bảo vệ (ISFJ)", "desc": "Tận tụy, ấm áp và luôn sẵn sàng bảo vệ người thân.", "careers": ["Y tá", "Giáo viên mầm non", "Hành chính"]},
                "ESTJ": {"name": "Người điều hành (ESTJ)", "desc": "Thực tiễn, quản lý tốt con người và sự vật.", "careers": ["Quản lý dự án", "Ngân hàng", "Kinh doanh"]},
                "ESFJ": {"name": "Người chăm sóc (ESFJ)", "desc": "Hòa đồng, thích giúp đỡ và tận tâm.", "careers": ["Chăm sóc khách hàng", "Y tế", "Sự kiện"]},
                "ISTP": {"name": "Người thợ thủ công (ISTP)", "desc": "Táo bạo, thực tế và giỏi sử dụng công cụ.", "careers": ["Kỹ sư cơ khí", "Kỹ thuật viên", "IT"]},
                "ISFP": {"name": "Nghệ sĩ (ISFP)", "desc": "Linh hoạt, quyến rũ và yêu cái đẹp.", "careers": ["Thiết kế thời trang", "Nhiếp ảnh", "Nghệ sĩ"]},
                "ESTP": {"name": "Người khởi xướng (ESTP)", "desc": "Thông minh, năng lượng và thích mạo hiểm.", "careers": ["Bán hàng", "Doanh nhân", "Thể thao"]},
                "ESFP": {"name": "Người trình diễn (ESFP)", "desc": "Nhiệt tình, ngẫu hứng và đầy sức sống.", "careers": ["Diễn viên", "Tổ chức sự kiện", "Du lịch"]}
            }

            mbti_keywords = {
                "INTJ": ["Máy tính", "Phần mềm", "Tài chính", "Dữ liệu", "Kỹ thuật"],
                "INTP": ["Phần mềm", "Nghiên cứu", "Công nghệ", "Toán", "Khoa học"],
                "ENTJ": ["Quản trị", "Kinh doanh", "Kinh tế", "Luật", "Tài chính"],
                "ENTP": ["Marketing", "Thương mại", "Kinh doanh", "Truyền thông", "Luật"],
                "INFJ": ["Tâm lý", "Sư phạm", "Xã hội", "Ngôn ngữ", "Văn học"],
                "INFP": ["Thiết kế", "Mỹ thuật", "Báo chí", "Truyền thông", "Nghệ thuật"],
                "ENFJ": ["Nhân sự", "Sư phạm", "Quan hệ công chúng", "Quản trị", "Tâm lý"],
                "ENFP": ["Marketing", "Truyền thông", "Báo chí", "Du lịch", "Sự kiện"],
                "ISTJ": ["Kế toán", "Tài chính", "Ngân hàng", "Hành chính", "Logistics"],
                "ISFJ": ["Y khoa", "Dược", "Sư phạm", "Hành chính", "Điều dưỡng"],
                "ESTJ": ["Quản trị", "Kinh tế", "Tài chính", "Quản lý", "Ngân hàng"],
                "ESFJ": ["Nhà hàng", "Khách sạn", "Y tế", "Du lịch", "Sự kiện"],
                "ISTP": ["Cơ khí", "Kỹ thuật", "Điện tử", "Tự động hóa", "Giao thông"],
                "ISFP": ["Thiết kế", "Mỹ thuật", "Kiến trúc", "Thời trang", "Nghệ thuật"],
                "ESTP": ["Kinh doanh", "Thương mại", "Quản trị", "Thể thao", "Du lịch"],
                "ESFP": ["Sự kiện", "Du lịch", "Truyền thông", "Khách sạn", "Giải trí"]
            }
            
            result_data = mbti_database.get(mbti_type, {"name": f"Nhóm {mbti_type}", "desc": "Đang phân tích...", "careers": []})
            keywords = mbti_keywords.get(mbti_type, [])

        # ==========================================
        # 3. TÌM TRƯỜNG ĐẠI HỌC (Chung cho cả 2 loại Test)
        # ==========================================
        matching_unis = []
        if keywords:
            filters = [UniversityData.major_name.contains(kw) for kw in keywords]
            db_unis = UniversityData.query.filter(or_(*filters)).limit(10).all()
            
            seen_schools = set()
            match_percentages = [98, 95, 92, 89] 
            for uni in db_unis:
                if uni.school_name not in seen_schools and len(matching_unis) < 3:
                    matching_unis.append({
                        "name": f"{uni.school_name} ({uni.major_name})",
                        "match": f"{match_percentages[len(matching_unis)]}%"
                    })
                    seen_schools.add(uni.school_name)

        if not matching_unis:
            matching_unis = [{"name": "Đang cập nhật...", "match": "90%"}]

        result_data["unis"] = matching_unis

        return jsonify({"success": True, "top_trait": top_trait_or_mbti, "result": result_data, "raw_scores": raw_scores}), 200
    except Exception as e:
        import traceback
        print(traceback.format_exc()) # In lỗi ra console server để dễ debug
        return jsonify({"error": str(e)}), 500


@chat_bp.route('/api/save-quiz-result', methods=['POST'])
def save_quiz_result():
    try:
        data = request.json
        user_id = data.get('userId')
        personality = data.get('personality')
        desc = data.get('desc', '') 
        
        # Nhận thêm quiz_type từ React để lưu cho đúng
        quiz_type = data.get('quizType', 'holland')

        if not user_id or not personality: 
            return jsonify({"error": "Thiếu dữ liệu"}), 400

        # Sửa query: Lọc theo cả user_id VÀ quiz_type
        # Nhờ vậy user có thể có 1 kết quả Holland và 1 kết quả MBTI song song
        existing_result = QuizResult.query.filter_by(user_id=user_id, quiz_type=quiz_type).first()
        
        if existing_result:
            existing_result.personality_group = personality
            existing_result.description = desc
        else:
            # Ghi nhớ thêm quiz_type lúc tạo record mới
            new_result = QuizResult(
                user_id=user_id, 
                quiz_type=quiz_type, 
                personality_group=personality, 
                description=desc
            )
            db.session.add(new_result)

        db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        db.session.rollback() 
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/api/get-quiz-result/<int:user_id>', methods=['GET'])
def get_quiz_result(user_id):
    try:
        # Lấy tham số type từ URL do React gửi lên (VD: ?type=mbti), mặc định là holland
        quiz_type = request.args.get('type', 'holland')

        # Truy vấn Database theo cả user_id và quiz_type
        existing_result = QuizResult.query.filter_by(user_id=user_id, quiz_type=quiz_type).first()

        if existing_result:
            # Format lại dữ liệu trả về cho Frontend
            result_data = {
                "name": existing_result.personality_group,
                "desc": existing_result.description,
                # Trả về mảng giả để giao diện React không bị lỗi .map() khi load lại kết quả cũ
                "careers": ["Vui lòng làm lại bài test để xem chi tiết ngành nghề..."], 
                "unis": [{"name": "Vui lòng làm lại bài test để xem trường", "match": ""}] 
            }
            return jsonify({"exists": True, "result": result_data}), 200
        else:
            return jsonify({"exists": False}), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
# =========================================================
# 10. API RIÊNG CHO ADMIN (QUẢN LÝ USER TỪ BẢNG ĐIỀU KHIỂN)
# =========================================================
@api_bp.route('/users/', methods=['POST'])
@admin_required
def create_user_from_dashboard():
    try:
        data = request.json
        if User.query.filter_by(email=data.get("email")).first():
            return jsonify({"detail": "Email này đã được sử dụng"}), 400
            
        new_user = User(
            full_name=data.get("full_name"), name=data.get("username"), 
            email=data.get("email"), password=generate_password_hash("123456"),
            role=data.get("role", "user"), phone_number=data.get("phone_number"),
            date_of_birth=data.get("date_of_birth"), address=data.get("address"), verified=True 
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Lưu thành công", "id": new_user.id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"detail": "Lỗi hệ thống: Vui lòng thử lại"}), 500
    
    #admin 
    from models import QuestionBank

# 1. API Lấy danh sách câu hỏi
@chat_bp.route('/api/admin/questions', methods=['GET'])
def get_questions():
    try:
        q_type = request.args.get('type')
        questions = QuestionBank.query.filter_by(quiz_type=q_type).all()
        return jsonify([q.to_dict() for q in questions]), 200
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# 2. API Thêm hoặc Sửa câu hỏi
@chat_bp.route('/api/admin/questions', methods=['POST'])
def save_question():
    try:
        data = request.json
        q_id = data.get('id')
        
        if q_id: # Sửa câu hỏi cũ
            q = QuestionBank.query.get(q_id)
            if q:
                q.question_text = data['text']
                q.category = data['category']
        else: # Thêm câu hỏi mới
            q = QuestionBank(
                quiz_type=data['quiz_type'],
                question_text=data['text'],
                category=data['category']
            )
            db.session.add(q)
        
        db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 3. API Xóa câu hỏi
@chat_bp.route('/api/admin/questions/<int:id>', methods=['DELETE'])
def delete_question(id):
    try:
        q = QuestionBank.query.get(id)
        if q:
            db.session.delete(q)
            db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# 4. API Đếm tổng số câu hỏi hiện có
@chat_bp.route('/api/admin/questions-count', methods=['GET'])
def get_questions_count():
    try:
        # Đếm tổng số dòng trong bảng QuestionBank
        total = QuestionBank.query.count()
        return jsonify({"total": total}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# API 1: Lấy danh sách Mentor từ MySQL hiển thị lên React
@api_bp.route('/api/mentors', methods=['GET'])
def get_mentors():
    try:
        mentors = Mentor.query.all()
        result = []
        for m in mentors:
            result.append({
                "id": m.id,
                "name": m.name,
                "role": m.role,
                "company": m.company,
                "img": m.img_url
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API 2: Nhận dữ liệu Đặt lịch từ form và lưu vào Database
@api_bp.route('/api/booking', methods=['POST'])
def create_booking():
    try:
        data = request.json
        new_booking = Booking(
            student_name=data['name'],
            student_email=data['email'],
            mentor_id=data['mentorId'],
            booking_date=data['date'],
            booking_time=data['time']
        )
        db.session.add(new_booking)
        db.session.commit()
        return jsonify({'message': 'Đặt lịch thành công! Chuyên gia sẽ liên hệ bạn sớm.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Lỗi hệ thống: {str(e)}'}), 500

# API 3: Tính toán ROI và lưu lịch sử vào Database
@api_bp.route('/api/roi', methods=['POST'])
def calculate_roi():
    try:
        data = request.json
        tuition_per_year = float(data.get('tuition', 0))
        years = int(data.get('years', 4))
        starting_salary = float(data.get('salary', 0))
        
        # Công thức mô phỏng tính ROI
        total_cost = tuition_per_year * years
        # Tính lương 10 năm (tăng 10% mỗi năm)
        ten_year_earnings = sum([starting_salary * 12 * (1.1 ** i) for i in range(10)])
        roi_percentage = ((ten_year_earnings - total_cost) / total_cost) * 100 if total_cost > 0 else 0

        # Lưu lịch sử tính toán vào Database
        history_record = RoiHistory(
            tuition_per_year=tuition_per_year,
            study_years=years,
            starting_salary=starting_salary,
            calculated_roi_percent=roi_percentage
        )
        db.session.add(history_record)
        db.session.commit()

        return jsonify({
            'total_cost': f"{total_cost:,.0f} VNĐ",
            'ten_year_earnings': f"{ten_year_earnings:,.0f} VNĐ",
            'roi_percentage': f"{roi_percentage:,.1f}%",
            'message': "Khoản đầu tư tuyệt vời!" if roi_percentage > 200 else "Bạn nên cân nhắc thêm nhé!"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500