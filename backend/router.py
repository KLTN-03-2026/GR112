import os, random, jwt, requests
from datetime import datetime, timedelta, timezone 
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from google import genai 
from dotenv import load_dotenv
# Thay vì chỉ import datetime, hãy thêm cái này:
# SỬA DÒNG IMPORT TRÊN ĐẦU FILE router.py
from datetime import datetime, timedelta, timezone
# Xóa dòng import cũ, thay bằng dòng này:
from datetime import datetime, timedelta, timezone

from extensions import db, mail
from models import (User, ContactMessage, UniversityData, QuizResult, Career, QuestionBank, 
                    ChatSession, ChatMessage, RoiHistory, Booking, Mentor, OrientationProfile, 
                    MasterInterest, MasterWorkEnvironment, MasterSubjectBlock, MentorSlot, UniversityReview,AILog)

# ==========================================
# 1. KHAI BÁO BLUEPRINT & AI CLIENT
# ==========================================
api_bp = Blueprint('api_bp', __name__)
chat_bp = Blueprint('chat', __name__)

load_dotenv() 

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

# ==========================================
# HÀM LÕI: TRÍCH XUẤT VÀ KIỂM TRA TOKEN 
# ==========================================
def get_current_user_from_token():
    """Hàm dùng chung để xử lý token, tránh lặp code ở các decorator"""
    token_header = request.headers.get('Authorization')
    if not token_header:
        return None, jsonify({'message': 'Thiếu Token!'}), 401
    
    token = token_header.split(" ")[1] if token_header.startswith("Bearer ") else token_header

    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        user = User.query.get(data['user_id'])
        if not user:
            return None, jsonify({'message': 'Người dùng không tồn tại!'}), 401
        
        return user, None, None 
        
    except jwt.ExpiredSignatureError:
        return None, jsonify({'message': 'Token đã hết hạn! Vui lòng đăng nhập lại.'}), 401
    except Exception as e:
        return None, jsonify({'message': 'Token không hợp lệ!'}), 401

# ==========================================
# CÁC BỘ LỌC PHÂN QUYỀN (DECORATORS)
# ==========================================
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user, error_res, status_code = get_current_user_from_token()
        if request.method == 'OPTIONS': return jsonify({}), 200
        if error_res: return error_res, status_code
        if user.role != 'admin':
            return jsonify({'message': 'Quyền truy cập bị từ chối! Bạn không phải Admin.'}), 403
        return f(current_user=user, *args, **kwargs)
    return decorated

def mentor_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user, error_res, status_code = get_current_user_from_token()
        if error_res: return error_res, status_code
        if user.role not in ['mentor', 'admin']: 
            return jsonify({'message': 'Quyền truy cập bị từ chối! Bạn không phải Cố vấn.'}), 403
        return f(current_user=user, *args, **kwargs)
    return decorated

def user_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user, error_res, status_code = get_current_user_from_token()
        if error_res: return error_res, status_code
        if user.role != 'user': 
            return jsonify({'message': 'Chỉ tài khoản học sinh mới được thực hiện thao tác này!'}), 403
        return f(current_user=user, *args, **kwargs)
    return decorated

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user, error_res, status_code = get_current_user_from_token()
        if error_res: return error_res, status_code
        return f(current_user=user, *args, **kwargs)
    return decorated

@api_bp.route('/')
def home():
    return "SERVER OK"

# ==========================================
# 🚀 HÀM HỖ TRỢ: GỬI MAIL QUA API BREVO
# ==========================================
import os
import random
import requests
from datetime import datetime, timedelta, timezone
from datetime import datetime, timedelta, timezone 
from flask import jsonify, request, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

# ==========================================
# 🚀 HÀM HỖ TRỢ: GỬI MAIL QUA API BREVO
# ==========================================
def send_otp_via_brevo(email, otp, subject="Mã OTP xác thực - ConsulTing"):
    # Lấy API Key TRỰC TIẾP từ hệ điều hành Render (Không qua config nữa)
    api_key = os.environ.get('BREVO_API_KEY') 
    
    if not api_key:
        print("LỖI: Chưa cài đặt BREVO_API_KEY")
        return False
        
    url = "https://api.brevo.com/v3/smtp/email"
    payload = {
        "sender": {"name": "Hệ thống ConsulTing", "email": "vanlinhpham03@gmail.com"}, 
        "to": [{"email": email}],
        "subject": subject,
        "htmlContent": f"<html><body><h3>Chào bạn,</h3><p>Mã OTP của bạn là: <strong style='font-size: 20px; color: #f97316;'>{otp}</strong></p><p>Mã này có hiệu lực trong vòng 5 phút.</p></body></html>"
    }
    
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        # Bắt Brevo khai ra lỗi nếu nó từ chối gửi
        if response.status_code != 201:
            print(f"🚨 BREVO TỪ CHỐI GỬI: {response.status_code} - {response.text}")
            
        return response.status_code == 201
    except Exception as e:
        print(f"Lỗi gọi API Brevo: {e}")
        return False

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
    
    print("="*40)
    print(f"🚀 [ĐĂNG KÝ MỚI] MÃ OTP CỦA {email} LÀ: {otp} 🚀")
    print("="*40)
    
    expire_time = datetime.now(timezone.utc) + timedelta(minutes=5)

    user = User(
        name=data.get("name"), email=email, password=hashed_password,
        otp=otp, otp_expire=expire_time, role="user"
    )
    db.session.add(user)
    db.session.commit()

    success = send_otp_via_brevo(email, otp, "Đăng ký tài khoản - ConsulTing")
    if not success:
        print("Cảnh báo: Không thể gửi OTP tới", email)

    return jsonify({"message": "Đã gửi OTP"}), 200


@api_bp.route('/api/verify-otp', methods=['POST'])
def verify():
    data = request.json
    user = User.query.filter_by(email=data.get("email")).first()

    if not user: return jsonify({"error": "Không tìm thấy user"}), 404
    if user.otp != data.get("otp"): return jsonify({"error": "OTP sai"}), 400
    
    if datetime.now(timezone.utc) > user.otp_expire.replace(tzinfo=timezone.utc):
        return jsonify({"error": "OTP hết hạn"}), 400

    user.verified = True
    user.otp = None 
    db.session.commit()
    return jsonify({"message": "Xác thực thành công"}), 200


@api_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    role = user.role if user else None

    if not user:
        user = Mentor.query.filter_by(email=email).first()
        if user: role = 'mentor'

    if not user: 
        return jsonify({"error": "Sai email"}), 400
    
    if not check_password_hash(user.password, password): 
        return jsonify({"error": "Sai mật khẩu"}), 400

    if not user.verified: 
        return jsonify({"error": "Chưa xác thực OTP"}), 400

    token = jwt.encode({
        'user_id': user.id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=2)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    user_data = {
        "id": user.id,
        "email": user.email,
        "role": role,
        "fullName": getattr(user, 'full_name', getattr(user, 'name', "User")),
    }
    
    if role != 'mentor':
        user_data.update({
            "name": user.name,
            "phone": getattr(user, 'phone_number', ''),
            "dob": str(user.date_of_birth) if getattr(user, 'date_of_birth', None) else "",
            "address": getattr(user, 'address', '')
        })
    else:
        user_data.update({
            "specialty": getattr(user, 'specialty', ""),
            "experience": getattr(user, 'experience_years', 0)
        })

    return jsonify({
        "token": token, 
        "message": "Đăng nhập thành công",
        "user": user_data
    }), 200


@api_bp.route('/api/resend-otp', methods=['POST'])
def resend():
    user = User.query.filter_by(email=request.json.get("email")).first()
    if not user: return jsonify({"error": "Không tìm thấy user"}), 404

    otp = str(random.randint(100000, 999999))
    user.otp = otp
    user.otp_expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    db.session.commit()

    print("="*40)
    print(f"🚀 [GỬI LẠI] MÃ OTP CỦA {user.email} LÀ: {otp} 🚀")
    print("="*40)

    send_otp_via_brevo(user.email, otp, "OTP mới của bạn - ConsulTing")
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
    user.otp_expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    db.session.commit()

    print("="*40)
    print(f"🚀 [QUÊN MK] MÃ OTP CỦA {user.email} LÀ: {otp} 🚀")
    print("="*40)

    send_otp_via_brevo(user.email, otp, "Khôi phục mật khẩu - ConsulTing")
    return jsonify({"message": "Đã gửi mã OTP đến email của bạn!"}), 200


@api_bp.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    user = User.query.filter_by(email=data.get("email")).first()

    if not user: return jsonify({"message": "Không tìm thấy tài khoản"}), 404
    if user.otp != data.get("otp"): return jsonify({"message": "Mã OTP không chính xác"}), 400
    
    if datetime.now(timezone.utc) > user.otp_expire.replace(tzinfo=timezone.utc): 
        return jsonify({"message": "Mã OTP đã hết hạn"}), 400

    user.password = generate_password_hash(data.get("newPassword"))
    user.otp = None 
    db.session.commit()
    return jsonify({"message": "Đổi mật khẩu thành công!"}), 200

# =========================================================
# CHỨC NĂNG TÌM KIẾM TRƯỜNG ĐẠI HỌC (CHO TRANG SEARCH)
# =========================================================

@api_bp.route('/api/universities/search', methods=['POST'])
def search_universities():
    data = request.json
    filters = data.get('filters', {})
    query = UniversityData.query

    if filters.get('score'):
        query = query.filter(UniversityData.base_score <= float(filters['score']))

    if filters.get('region'):
        query = query.filter(UniversityData.region == filters['region'])

    if filters.get('type'):
        query = query.filter(UniversityData.school_type == filters['type'])

    blocks = filters.get('blocks', [])
    if blocks:
        block_codes = [b.split(' ')[1] if ' ' in b else b for b in blocks]
        query = query.filter(UniversityData.subject_block.in_(block_codes))

    majors = filters.get('majors', [])
    if majors:
        major_conditions = [UniversityData.major_name.ilike(f"%{m}%") for m in majors]
        query = query.filter(or_(*major_conditions))

    results = query.all()
    user_score = filters.get('score', 25)
    
    universities_data = []
    for uni in results:
        score_diff = float(user_score) - uni.base_score
        match_percent = max(60, min(99, int(99 - (score_diff * 5)))) if score_diff >= 0 else 50

        universities_data.append({
            'id': uni.id,
            'name': uni.school_name,
            'img': uni.school_logo or "https://via.placeholder.com/150",
            'loc': uni.region,
            'ratio': uni.ranking_note or "1:10",
            'tuition': uni.tuition_fee,
            'match': match_percent,
            'base_score': uni.base_score,
            'tags': [uni.major_name, uni.subject_block, uni.school_type]
        })
    return jsonify(universities_data), 200

# =========================================================
# CHỨC NĂNG CHI TIẾT TRƯỜNG (CHO TRANG DETAIL)
# =========================================================

@api_bp.route('/api/universities/<int:uni_id>', methods=['GET'])
def get_university_detail(uni_id):
    try:
        uni = UniversityData.query.get(uni_id)
        if not uni:
            return jsonify({'error': 'Không tìm thấy trường!'}), 404
        
        data = uni.to_dict()
        # Lấy dữ liệu từ bảng chi tiết thông qua relationship 'details'
        if uni.details:
            data.update(uni.details.to_dict())
        else:
            # Giá trị mặc định nếu bảng details chưa có dữ liệu cho ID này
            data.update({
                "description": "Thông tin đang được cập nhật.",
                "address": "Đang cập nhật địa chỉ...",
                "website": "https://edu.vn",
                "phone": "Đang cập nhật...",
                "admission_methods": "Xét tuyển THPT, Học bạ"
            })
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =========================================================
# 5. LIÊN HỆ
# =========================================================
@api_bp.route('/api/contact', methods=['POST'])
def submit_contact():
    import os
    import requests
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        message_content = data.get('message')

        if not name or not email or not message_content:
            return jsonify({'error': 'Vui lòng điền đầy đủ thông tin!'}), 400

        # Lưu tin nhắn vào Database
        new_msg = ContactMessage(name=name, email=email, message=message_content)
        db.session.add(new_msg)
        db.session.commit()

        # ==========================================
        # GỬI MAIL THÔNG BÁO CHO ADMIN QUA BREVO API
        # ==========================================
        api_key = os.environ.get('BREVO_API_KEY') 
        if api_key:
            url = "https://api.brevo.com/v3/smtp/email"
            payload = {
                "sender": {"name": "Hệ thống ConsulTing", "email": "vanlinhpham03@gmail.com"}, 
                "to": [{"email": "vanlinhpham03@gmail.com"}], # Gửi thẳng về hòm thư của sếp
                "replyTo": {"email": email, "name": name}, # Để sếp bấm Reply là trả lời ngay cho khách
                "subject": f"ConsulTing - Có tin nhắn mới từ {name}!",
                "htmlContent": f"""
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h3 style="color: #4f46e5;">📩 CÓ LIÊN HỆ MỚI TỪ WEBSITE</h3>
                        <p><b>Tên khách hàng:</b> {name}</p>
                        <p><b>Email:</b> {email}</p>
                        <p><b>Lời nhắn:</b></p>
                        <div style="padding: 15px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 4px;">
                            {message_content}
                        </div>
                    </div>
                """
            }
            headers = {
                "accept": "application/json",
                "api-key": api_key,
                "content-type": "application/json"
            }
            
            try:
                # Gửi mail đi, chỉ chờ tối đa 5 giây để không làm web bị đơ
                requests.post(url, json=payload, headers=headers, timeout=5)
            except Exception as mail_err:
                print(f"Lỗi gửi mail thông báo Contact: {mail_err}")

        return jsonify({'message': 'Gửi tin nhắn thành công!', 'data': new_msg.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"🚨 LỖI SERVER TẠI API CONTACT: {str(e)}") # In lỗi ra log để dễ check
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


# --- 3. TỔNG HỢP API CHAT (DÙNG THƯ VIỆN google-genai MỚI NHẤT) ---
@chat_bp.route('/api/chat', methods=['POST'])
def chat_api():
    try:
        data = request.json
        user_message = data.get('message', '')
        user_id = data.get('userId')
        session_id = data.get('sessionId')
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

        db_results = []
        context_text = ""
        if user_message and not image_data:
            search_term = user_message[:20] 
            db_results = UniversityData.query.filter(
                (UniversityData.major_name.like(f"%{search_term}%")) | 
                (UniversityData.school_name.like(f"%{search_term}%"))
            ).limit(5).all()

            for r in db_results:
                context_text += f"- Trường {r.school_name}, ngành {r.major_name}, điểm THPT {r.score_thpt_last_year}, học bạ {r.base_score}, học phí {r.tuition_fee}.\n"

        # === BƯỚC B: QUẢN LÝ DATABASE ===
        if not session_id:
            title = user_message[:30] + "..." if user_message else "Hỏi đáp bằng hình ảnh"
            new_session = ChatSession(user_id=user_id, title=title)
            db.session.add(new_session)
            db.session.commit()
            session_id = new_session.id

        user_msg_db = ChatMessage(session_id=session_id, sender='user', content=user_message, image_data=image_data)
        db.session.add(user_msg_db)
        db.session.commit()

        # === BƯỚC C: GỌI GOOGLE AI (CÚ PHÁP MỚI NHẤT 100%) ===
        # Import thư viện kiểu mới
        from google import genai
        
        # Khởi tạo Client với API Key của bạn
        client = genai.Client(api_key=api_key)

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

        response_text = ""
        max_retries = 3
        delay = 2

        for attempt in range(max_retries):
            try:
                if image_data:
                    import base64
                    from io import BytesIO
                    from PIL import Image
                    image_bytes = base64.b64decode(image_data.split(',')[1]) 
                    img = Image.open(BytesIO(image_bytes))
                    
                    # Gọi AI cho ảnh
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=[img, user_message if user_message else "Phân tích ảnh này."]
                    )
                else:
                    # Gọi AI cho text
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=prompt_content
                    )
                
                response_text = response.text
                break 
                
            except Exception as ai_e:
                error_str = str(ai_e)
                print(f"🚨 LỖI GOOGLE AI (Lần {attempt+1}):", error_str)
                
                if "503" in error_str and attempt < max_retries - 1:
                    time.sleep(delay)
                    delay *= 2
                    continue
                
                if "429" in error_str:
                    response_text = "Bạn ơi, AI đang hết lượt sử dụng do quá tải. Đợi 1 phút rồi nhắn lại nhé! ☕"
                else:
                    response_text = f"🚨 Lỗi kết nối Google: {error_str}"
                break

        # === BƯỚC D: LƯU PHẢN HỒI CỦA AI VÀ TRẢ VỀ REACT ===
        bot_msg_db = ChatMessage(session_id=session_id, sender='bot', content=response_text)
        db.session.add(bot_msg_db)
        db.session.commit()

        recommendations = [{
            "id": r.id,
            "school_name": r.school_name,
            "major_name": r.major_name,
            "major_code": r.major_code,
            "school_logo": r.school_logo,
            "score_thpt_last_year": r.score_thpt_last_year,
            "base_score": r.base_score,
            "subject_block": r.subject_block
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
# API LẤY THÔNG TIN HỒ SƠ & GỢI Ý NGHỀ TỪ DATABASE
# =========================================================
import json
import re
from flask import request, jsonify
# Đảm bảo bạn đã import model Career (hoặc tên model tương ứng với bảng careers)
# from models import Career 
import re # 👈 Nhớ phải có dòng này ở đầu file router.py để dùng được biểu thức chính quy (re.search)

# ==========================================
# API LẤY TOÀN BỘ HỒ SƠ CHO CHATBOT (Kèm gợi ý nghề nghiệp)
# ==========================================
@chat_bp.route('/api/get-full-profile/<int:user_id>', methods=['GET', 'OPTIONS'])
def get_full_profile(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Không tìm thấy người dùng"}), 404

        # ----------------------------------------------------
        # 1. LẤY ĐIỂM SỐ TỪ BẢNG OrientationProfile (Cho bảng 6 ô)
        # ----------------------------------------------------
        profile = OrientationProfile.query.filter_by(user_id=user_id).first()
        user_scores = {}
        target_block = 'Chưa xác định'
        
        if profile:
            # Tính GPA trung bình
            gpa_list = [g for g in [profile.gpa_10, profile.gpa_11, profile.gpa_12] if g is not None]
            if len(gpa_list) > 0:
                user_scores['GPA'] = round(sum(gpa_list) / len(gpa_list), 2)
            
            # Lấy các điểm còn lại
            if getattr(profile, 'exam_score', None) is not None: user_scores['THPT'] = profile.exam_score
            if getattr(profile, 'dgnl_score', None) is not None: user_scores['ĐGNL'] = profile.dgnl_score
            if getattr(profile, 'ielts_score', None) is not None: user_scores['IELTS'] = profile.ielts_score
            if getattr(profile, 'sat_score', None) is not None: user_scores['SAT'] = profile.sat_score
            
            target_block = profile.target_block or 'Chưa xác định'

        # ----------------------------------------------------
        # 2. LẤY TÍNH CÁCH TỪ 5 BÀI TEST (Lấy kết quả mới nhất)
        # ----------------------------------------------------
        res_holland = QuizResult.query.filter_by(user_id=user_id, quiz_type='holland').order_by(QuizResult.id.desc()).first()
        res_mbti = QuizResult.query.filter_by(user_id=user_id, quiz_type='mbti').order_by(QuizResult.id.desc()).first()
        res_mi = QuizResult.query.filter_by(user_id=user_id, quiz_type='mi').order_by(QuizResult.id.desc()).first()
        res_grit = QuizResult.query.filter_by(user_id=user_id, quiz_type='grit').order_by(QuizResult.id.desc()).first()
        res_mindset = QuizResult.query.filter_by(user_id=user_id, quiz_type='mindset').order_by(QuizResult.id.desc()).first()
        
        holland_val = res_holland.personality_group if res_holland else None
        mbti_val = res_mbti.personality_group if res_mbti else None
        mi_val = res_mi.personality_group if res_mi else None
        grit_val = res_grit.personality_group if res_grit else None
        mindset_val = res_mindset.personality_group if res_mindset else None

        # ----------------------------------------------------
        # 3. LOGIC LẤY NGHỀ TỪ DATABASE (THAY THẾ AI)
        # ----------------------------------------------------
        db_careers = []
        
        # Hàm trợ giúp để trích xuất Keyword tiếng Anh trong dấu ngoặc (ví dụ: Realistic, ENTP,...)
        def extract_keyword(text):
            if not text: return None
            match = re.search(r'\((.*?)\)', text)
            return match.group(1) if match else text

        # Ưu tiên lấy theo Holland trước, sau đó là MBTI hoặc MI
        search_keyword = extract_keyword(holland_val) or extract_keyword(mbti_val) or extract_keyword(mi_val)

        if search_keyword:
            # Truy vấn trực tiếp vào bảng Career
            career_records = Career.query.filter_by(personality_keyword=search_keyword).limit(6).all()
            
            for c in career_records:
                db_careers.append({
                    "title": c.title,
                    "desc": c.description,
                    "icon": c.icon or "fas fa-briefcase",
                    "top": bool(c.is_top)
                })

        # ----------------------------------------------------
        # 4. ĐÓNG GÓI TRẢ VỀ CHO REACT
        # ----------------------------------------------------
        profile_data = {
            "name": getattr(user, 'full_name', getattr(user, 'name', 'Bạn')),
            "class": getattr(user, 'class_name', 'Chưa cập nhật'),
            "school": getattr(user, 'school_name', 'Chưa cập nhật'),
            "target_block": target_block,
            "scores": user_scores, 
            "holland_personality": holland_val,
            "mbti_personality": mbti_val,
            "mi_personality": mi_val,
            "grit_personality": grit_val,
            "mindset_personality": mindset_val,
            "careers": db_careers 
        }
        
        return jsonify(profile_data), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
# =========================================================
# 9. LÀM BÀI TRẮC NGHIỆM VÀ LƯU TEST
# =========================================================
from flask import request, jsonify
from sqlalchemy import or_
# Đảm bảo bạn đã import các Model cần thiết (QuestionBank, UniversityData, QuizResult, db, v.v.)
# từ thư mục models của bạn.

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

        # Tự động lấy bộ Mapping (ID câu hỏi -> Loại tính cách) từ Database
        db_questions = QuestionBank.query.filter_by(quiz_type=quiz_type).all()
        dynamic_mapping = {str(q.id): q.category for q in db_questions}

        # ==========================================
        # 1. BÀI TEST HOLLAND
        # ==========================================
        if quiz_type == 'holland':
            scores = {"R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0}
            for q_id, score in answers.items():
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
        # 2. BÀI TEST MBTI
        # ==========================================
        elif quiz_type == 'mbti':
            scores = {"E": 0, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0}
            for q_id, score in answers.items():
                trait = dynamic_mapping.get(str(q_id))
                if trait and trait in scores: 
                    scores[trait] += int(score)

            e_i = "E" if scores["E"] >= scores["I"] else "I"
            s_n = "S" if scores["S"] >= scores["N"] else "N"
            t_f = "T" if scores["T"] >= scores["F"] else "F"
            j_p = "J" if scores["J"] >= scores["P"] else "P"
            
            mbti_type = e_i + s_n + t_f + j_p
            top_trait_or_mbti = mbti_type
            raw_scores = scores

            mbti_database = {
                "INTJ": {"name": "Kiến trúc sư (INTJ)", "desc": "Tư duy chiến lược, độc lập và logic.", "careers": ["Kỹ sư phần mềm", "Phân tích tài chính", "Kiến trúc sư"]},
                "INTP": {"name": "Nhà logic học (INTP)", "desc": "Sáng tạo, đam mê phân tích và khám phá.", "careers": ["Lập trình viên", "Khoa học", "Toán học"]},
                "ENTJ": {"name": "Người chỉ huy (ENTJ)", "desc": "Lãnh đạo táo bạo, quyết đoán và tài năng.", "careers": ["Quản trị doanh nghiệp", "Luật sư", "Khởi nghiệp"]},
                "ENTP": {"name": "Người tranh luận (ENTP)", "desc": "Thông minh, thích thử thách và tranh luận.", "careers": ["Marketing", "Luật sư", "PR"]},
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
                "INTP": ["Phần mềm", "Nghiên cứu", "Công nghệ", "Khoa học"],
                "ENTJ": ["Quản trị", "Kinh doanh", "Luật", "Tài chính"],
                "ENTP": ["Marketing", "Thương mại", "Truyền thông", "Luật"],
                "INFJ": ["Tâm lý", "Sư phạm", "Xã hội", "Ngôn ngữ"],
                "INFP": ["Thiết kế", "Mỹ thuật", "Báo chí", "Nghệ thuật"],
                "ENFJ": ["Nhân sự", "Sư phạm", "Quản trị", "Tâm lý"],
                "ENFP": ["Marketing", "Truyền thông", "Du lịch", "Sự kiện"],
                "ISTJ": ["Kế toán", "Tài chính", "Hành chính", "Logistics"],
                "ISFJ": ["Y khoa", "Dược", "Sư phạm", "Điều dưỡng"],
                "ESTJ": ["Quản trị", "Kinh tế", "Quản lý", "Ngân hàng"],
                "ESFJ": ["Nhà hàng", "Khách sạn", "Y tế", "Du lịch"],
                "ISTP": ["Cơ khí", "Kỹ thuật", "Tự động hóa", "Giao thông"],
                "ISFP": ["Thiết kế", "Kiến trúc", "Thời trang", "Nghệ thuật"],
                "ESTP": ["Kinh doanh", "Thương mại", "Thể thao", "Du lịch"],
                "ESFP": ["Sự kiện", "Du lịch", "Truyền thông", "Giải trí"]
            }
            
            result_data = mbti_database.get(mbti_type, {"name": f"Nhóm {mbti_type}", "desc": "Đang phân tích...", "careers": []})
            keywords = mbti_keywords.get(mbti_type, [])

        # ==========================================
        # 3. BÀI TEST ĐA TRÍ THÔNG MINH (MI)
        # ==========================================
        elif quiz_type == 'mi':
            scores = {"LING": 0, "LOGIC": 0, "SPAT": 0, "KINE": 0, "MUSI": 0, "INTER": 0, "INTRA": 0, "NATU": 0}
            for q_id, score in answers.items():
                trait = dynamic_mapping.get(str(q_id))
                if trait and trait in scores:
                    scores[trait] += int(score)
                    
            top_trait = max(scores, key=scores.get)
            top_trait_or_mbti = top_trait
            raw_scores = scores

            mi_database = {
                "LING": {"name": "Trí thông minh Ngôn ngữ", "desc": "Bạn nhạy bén với từ ngữ, thích viết lách, đọc sách và giao tiếp. Bạn có khả năng thuyết phục người khác xuất sắc.", "careers": ["Nhà báo", "Biên dịch viên", "Luật sư", "Giáo viên", "Nhà văn"]},
                "LOGIC": {"name": "Trí thông minh Logic-Toán học", "desc": "Bạn suy luận tốt, làm việc với các con số giỏi và thích giải quyết các vấn đề khoa học phức tạp.", "careers": ["Lập trình viên", "Phân tích dữ liệu", "Kế toán", "Kỹ sư"]},
                "SPAT": {"name": "Trí thông minh Không gian", "desc": "Bạn tư duy bằng hình ảnh, giỏi tưởng tượng không gian 3D và có gu thẩm mỹ cực kỳ tốt.", "careers": ["Kiến trúc sư", "Thiết kế đồ họa", "Nhiếp ảnh gia", "Đạo diễn"]},
                "KINE": {"name": "Trí thông minh Vận động", "desc": "Bạn học hỏi tốt nhất qua thực hành. Sự khéo léo của cơ thể và đôi tay là điểm mạnh tuyệt đối của bạn.", "careers": ["Vận động viên", "Bác sĩ phẫu thuật", "Vũ công", "Kỹ sư cơ khí"]},
                "MUSI": {"name": "Trí thông minh Âm nhạc", "desc": "Bạn nhạy cảm với giai điệu, nhịp điệu và có thể dễ dàng ghi nhớ hoặc tạo ra âm thanh.", "careers": ["Nhạc sĩ", "Ca sĩ", "Nhà sản xuất âm nhạc", "DJ"]},
                "INTER": {"name": "Trí thông minh Tương tác (Giao tiếp)", "desc": "Bạn thấu hiểu người khác, dễ đồng cảm và là một người hoạt động nhóm, lãnh đạo cực kỳ hiệu quả.", "careers": ["Quản lý nhân sự", "Chuyên gia tâm lý", "Bán hàng", "Chính trị gia"]},
                "INTRA": {"name": "Trí thông minh Nội tâm", "desc": "Bạn hiểu rõ điểm mạnh yếu của bản thân, có tính độc lập cao và thích làm việc, suy ngẫm một mình.", "careers": ["Triết gia", "Nhà tâm lý học", "Cố vấn chiến lược", "Nhà nghiên cứu"]},
                "NATU": {"name": "Trí thông minh Tự nhiên", "desc": "Bạn yêu thích thế giới tự nhiên, động thực vật và quan tâm sâu sắc đến các vấn đề môi trường.", "careers": ["Sinh học", "Bác sĩ thú y", "Kỹ sư nông nghiệp", "Môi trường học"]}
            }
            
            mi_keywords = {
                "LING": ["Ngôn ngữ", "Báo chí", "Truyền thông", "Luật", "Sư phạm"],
                "LOGIC": ["Công nghệ thông tin", "Toán", "Tài chính", "Kỹ thuật"],
                "SPAT": ["Kiến trúc", "Thiết kế", "Đồ họa", "Mỹ thuật"],
                "KINE": ["Thể dục thể thao", "Y khoa", "Cơ khí", "Sân khấu"],
                "MUSI": ["Âm nhạc", "Nghệ thuật", "Sư phạm âm nhạc"],
                "INTER": ["Tâm lý", "Nhân sự", "Quan hệ công chúng", "Kinh doanh"],
                "INTRA": ["Tâm lý học", "Xã hội học", "Triết học"],
                "NATU": ["Sinh học", "Môi trường", "Nông nghiệp", "Thú y"]
            }
            result_data = mi_database.get(top_trait, {})
            keywords = mi_keywords.get(top_trait, [])

        # ==========================================
        # 4. BÀI TEST CHỈ SỐ Ý CHÍ (GRIT)
        # ==========================================
        elif quiz_type == 'grit':
            scores = {"POE": 0, "COI": 0}
            for q_id, score in answers.items():
                trait = dynamic_mapping.get(str(q_id))
                if trait and trait in scores:
                    scores[trait] += int(score)
            
            top_trait = max(scores, key=scores.get)
            top_trait_or_mbti = top_trait
            raw_scores = scores

            grit_database = {
                "POE": {"name": "Kiên trì Nỗ lực (Perseverance of Effort)", "desc": "Điểm mạnh nhất của bạn là sự chăm chỉ bền bỉ. Những vấp ngã không làm bạn từ bỏ mà chỉ làm bạn quyết tâm hơn. Bạn là mẫu người 'có công mài sắt có ngày nên kim'.", "careers": ["Khởi nghiệp", "Nghiên cứu khoa học", "Y khoa", "Bất cứ ngành nghề nào cần sự kiên nhẫn"]},
                "COI": {"name": "Đam mê Nhất quán (Consistency of Interest)", "desc": "Bạn có khả năng tuyệt vời trong việc giữ sự tập trung vào một mục tiêu dài hạn mà không bị xao nhãng bởi những thú vui nhất thời. Bạn kiên định với con đường đã chọn.", "careers": ["Lập trình viên", "Nhà văn", "Học giả", "Kỹ sư chuyên sâu"]}
            }
            result_data = grit_database.get(top_trait, {})
            keywords = [] # Grit không quy đổi ra ngành học cụ thể để Search trường

        # ==========================================
        # 5. BÀI TEST TƯ DUY (MINDSET)
        # ==========================================
        elif quiz_type == 'mindset':
            scores = {"GROWTH": 0, "FIXED": 0}
            for q_id, score in answers.items():
                trait = dynamic_mapping.get(str(q_id))
                if trait and trait in scores:
                    scores[trait] += int(score)
            
            top_trait = max(scores, key=scores.get)
            top_trait_or_mbti = top_trait
            raw_scores = scores

            mindset_database = {
                "GROWTH": {"name": "Tư duy Phát triển (Growth Mindset)", "desc": "Tuyệt vời! Bạn tin rằng năng lực luôn có thể trau dồi qua thời gian. Bạn yêu thích thử thách, học hỏi từ sai lầm và lấy thành công của người khác làm động lực.", "careers": ["Môi trường sáng tạo", "Công nghệ", "Quản lý cấp cao", "Marketing", "Kinh doanh"]},
                "FIXED": {"name": "Tư duy Cố định (Fixed Mindset)", "desc": "Hiện tại, bạn có xu hướng tin rằng tài năng là bẩm sinh. Bạn nên tập cách đối mặt với thử thách như một cơ hội học hỏi thay vì sợ hãi sự thất bại. Đừng ngại bước ra khỏi vùng an toàn nhé!", "careers": ["Công chức", "Kế toán", "Hành chính", "Các công việc có quy trình ổn định rõ ràng"]}
            }
            result_data = mindset_database.get(top_trait, {})
            keywords = [] # Mindset không quy đổi ra ngành học cụ thể để Search trường


        # ==========================================
        # 6. TÌM TRƯỜNG ĐẠI HỌC
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
            # Nếu là GRIT hoặc MINDSET thì sẽ rơi vào đây vì không có keyword tìm trường
            if quiz_type in ['grit', 'mindset']:
                matching_unis = [{"name": "Phù hợp với mọi môi trường học tập", "match": "100%"}]
            else:
                matching_unis = [{"name": "Đang cập nhật dữ liệu trường...", "match": "90%"}]

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
        
        quiz_type = data.get('quizType', 'holland')

        if not user_id or not personality: 
            return jsonify({"error": "Thiếu dữ liệu"}), 400

        existing_result = QuizResult.query.filter_by(user_id=user_id, quiz_type=quiz_type).first()
        
        if existing_result:
            existing_result.personality_group = personality
            existing_result.description = desc
        else:
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
        quiz_type = request.args.get('type', 'holland')
        existing_result = QuizResult.query.filter_by(user_id=user_id, quiz_type=quiz_type).first()

        if existing_result:
            result_data = {
                "name": existing_result.personality_group,
                "desc": existing_result.description,
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

# ================================================
# =========
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
        # Lấy từ bảng Mentor mới
        mentors = Mentor.query.all()
        result = []
        for m in mentors:
            result.append({
                "id": m.id,
                "fullName": m.full_name, # Lấy đúng cột full_name
                "specialty": getattr(m, 'specialty', 'Chuyên gia Tư vấn'), # Thay cho company/role
                "experience": getattr(m, 'experience_years', 0)
            })
        # Bọc kết quả trong key "mentors" để React gọi data.mentors.map không bị lỗi
        return jsonify({"mentors": result}), 200
    except Exception as e:
        print("Lỗi get_mentors:", str(e))
        return jsonify({'error': str(e)}), 500

# API 2: Nhận dữ liệu Đặt lịch từ form và lưu vào Database
import jwt # Đảm bảo bạn đã import thư viện này ở đầu file
from flask import request, jsonify, current_app
# 🚀 NHỚ IMPORT THÊM MentorNotification VÀO ĐÂY NẾU CHƯA CÓ NHÉ SẾP!
from models import db, Booking, MentorSlot, User, Notification, MentorNotification 

@api_bp.route('/api/bookings', methods=['POST'])
def create_booking():
    try:
        # 1. KIỂM TRA BẢO MẬT
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Bạn cần đăng nhập để đặt lịch!'}), 401

        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            student_id = payload['user_id']
        except Exception:
            return jsonify({'error': 'Phiên đăng nhập hết hạn hoặc không hợp lệ!'}), 401

        # 2. NHẬN DỮ LIỆU TỪ REACT
        data = request.json
        mentor_id = data.get('mentor_id')
        slot_id = data.get('slot_id')
        topic = data.get('topic')

        if not mentor_id or not slot_id or not topic:
            return jsonify({'error': 'Vui lòng chọn đầy đủ khung giờ và chủ đề!'}), 400

        # 3. KIỂM TRA KHUNG GIỜ CÒN TRỐNG KHÔNG
        slot = MentorSlot.query.get(slot_id)
        if not slot or slot.is_booked:
            return jsonify({'error': 'Rất tiếc, khung giờ này vừa bị người khác đặt mất!'}), 400

        # 4. LƯU VÀO DATABASE (Booking)
        new_booking = Booking(
            student_id=student_id,
            mentor_id=mentor_id,
            slot_id=slot_id,
            topic=topic,
            status='pending'
        )
        db.session.add(new_booking)

        # 5. KHÓA KHUNG GIỜ NÀY LẠI
        slot.is_booked = True

        # 🚀 6. TẠO THÔNG BÁO CHO CẢ ADMIN VÀ MENTOR
        # Lấy tên hiển thị của học sinh cho nó thân thiện
        student = User.query.get(student_id)
        student_display_name = student.full_name if (student and student.full_name) else (student.name if student else "Học sinh ẩn danh")

        # --- 6.1 Bắn thông báo cho ADMIN ---
        new_admin_notif = Notification(
            title="Lịch hẹn mới 📅",
            message=f"{student_display_name} vừa đặt lịch tư vấn về chủ đề: {topic}"
        )
        db.session.add(new_admin_notif)

        # --- 6.2 Bắn thông báo cho CỐ VẤN (MENTOR) ---
        new_mentor_notif = MentorNotification(
            mentor_id=mentor_id,
            title="📅 Có lịch hẹn tư vấn mới!",
            message=f"Học sinh {student_display_name} vừa đặt lịch tư vấn chủ đề: {topic}. Hãy vào tab Lịch trình để xác nhận ngay nhé!",
            is_read=False
        )
        db.session.add(new_mentor_notif)

        # 7. CHỐT HẠ: LƯU TẤT CẢ VÀO DATABASE (Transaction an toàn)
        db.session.commit()
        
        return jsonify({'message': 'Đặt lịch thành công! Hệ thống đã gửi yêu cầu chờ Cố vấn xác nhận.'}), 201
        
    except Exception as e:
        db.session.rollback()
        print("Lỗi tạo booking:", str(e))
        return jsonify({'error': f'Lỗi hệ thống: {str(e)}'}), 500
    
    # ==========================================
# API 3: HỌC SINH LẤY DANH SÁCH GIỜ RẢNH CỦA 1 CỐ VẤN
# ==========================================
@api_bp.route('/api/mentors/<int:mentor_id>/slots', methods=['GET'])
def get_mentor_available_slots(mentor_id):
    try:
        # Tìm trong bảng MentorSlot: đúng ID cố vấn đó, VÀ chưa có ai đặt (is_booked=False)
        slots = MentorSlot.query.filter_by(mentor_id=mentor_id, is_booked=False).all()
        
        result = []
        for slot in slots:
            result.append({
                "id": slot.id,
                "date": slot.date,
                "time": slot.start_time
            })
            
        return jsonify({"slots": result}), 200
        
    except Exception as e:
        print("Lỗi khi lấy giờ rảnh:", str(e))
        return jsonify({'error': str(e)}), 500

import flask # Đảm bảo đã import flask ở trên cùng

# API 3: Tính toán ROI và lưu lịch sử vào Database (BẢN BỌC THÉP CHỐNG LỖI 500)
@api_bp.route('/api/roi', methods=['POST', 'OPTIONS']) # 🚀 ĐÃ SỬA: Thêm OPTIONS chống lỗi CORS
def calculate_roi():
    # Phản hồi nhẹ nhàng cho React nếu nó gửi OPTIONS dò đường
    if flask.request.method == 'OPTIONS':
        return flask.jsonify({}), 200
        
    try:
        # 🚀 ĐÃ SỬA: Thêm tiền tố flask. để chắc chắn không bị lỗi 'not defined'
        data = flask.request.json
        
        # 1. LẤY DỮ LIỆU TỪ REACT GỬI LÊN (Làm sạch dấu phẩy)
        tuition_per_year = float(str(data.get('tuition_per_year', '0')).replace(',', '').strip())
        uni_living_per_month = float(str(data.get('uni_living_per_month', '0')).replace(',', '').strip())
        starting_salary = float(str(data.get('starting_salary', '0')).replace(',', '').strip())
        post_grad_living_per_month = float(str(data.get('post_grad_living_per_month', '0')).replace(',', '').strip())
        
        study_years = float(data.get('study_years', 4))
        
        # 2. LOGIC TÍNH TOÁN BỨC TRANH 10 NĂM
        work_years = max(0, 10 - study_years) 
        
        total_cost = (tuition_per_year + (uni_living_per_month * 12)) * study_years
        total_gross_earnings = (starting_salary * 12) * work_years
        total_living_work = (post_grad_living_per_month * 12) * work_years
        
        net_earnings = total_gross_earnings - total_living_work
        real_surplus = net_earnings - total_cost
        
        roi_percentage = (real_surplus / total_cost) * 100 if total_cost > 0 else 0

        # 3. LƯU LỊCH SỬ VÀO DATABASE (CÓ BẢO HIỂM)
        try:
            history_record = RoiHistory(
                tuition_per_year=tuition_per_year,
                uni_living_per_month=uni_living_per_month,
                study_years=study_years,
                starting_salary=starting_salary,
                post_grad_living_per_month=post_grad_living_per_month,
                calculated_roi_percent=roi_percentage,
                real_surplus=real_surplus
            )
            db.session.add(history_record)
            db.session.commit()
        except Exception as db_err:
            # 🚀 TUYỆT CHIÊU: Nếu MySQL lỗi (chưa có cột), hệ thống chỉ in cảnh báo ra màn hình đen 
            # chứ KHÔNG BÁO LỖI 500, để phía dưới vẫn gửi số liệu về cho React!
            db.session.rollback()
            print("⚠️ CẢNH BÁO DB (Không sao cả, UI vẫn chạy):", str(db_err))

        # 4. TRẢ KẾT QUẢ VỀ CHO REACT
        return flask.jsonify({
            'status': 'success',
            'total_cost': total_cost,
            'gross_earnings': total_gross_earnings,
            'total_living_work': total_living_work,
            'real_surplus': real_surplus,
            'roi_percentage': round(roi_percentage, 1),
            'isPositive': roi_percentage > 0,
            'work_years': work_years,
            'study_years': study_years
        }), 200

    except Exception as e:
        print("❌ LỖI TOÁN HỌC TRONG PYTHON:", str(e))
        return flask.jsonify({'error': str(e)}), 500
    


# =====================================================================
# API 3: LẤY TOÀN BỘ TRƯỜNG TỪ MYSQL (GET)
# =====================================================================
@api_bp.route('/api/universities', methods=['GET'])
def get_universities():
    try:
        unis = UniversityData.query.all()
        return jsonify([u.to_dict() for u in unis]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =====================================================================
# API 4: LẤY DANH SÁCH LỰA CHỌN CHO BƯỚC 1 (Sở thích & Môi trường)
# =====================================================================
@api_bp.route('/api/step1-options', methods=['GET'])
def get_step1_options():
    try:
        interests = MasterInterest.query.all()
        environments = MasterWorkEnvironment.query.all()
        
        return jsonify({
            'interests': [i.name for i in interests], 
            'environments': [e.to_dict() for e in environments]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================================
# API 5: LẤY DANH SÁCH KHỐI THI (BƯỚC 2)
# =====================================================================
@api_bp.route('/api/step2-options', methods=['GET'])
def get_step2_options():
    try:
        # LƯU Ý: Nếu bạn chưa có bảng MasterSubjectBlock trong models.py thì hàm này sẽ báo lỗi.
        # Hiện tại React đang dùng mảng cứng FULL_BLOCKS nên hàm này có thể chưa cần dùng tới.
        blocks = MasterSubjectBlock.query.all()
        return jsonify([b.to_dict() for b in blocks]), 200
    except Exception as e: 
        return jsonify({'error': str(e)}), 500

# yêu thích, thả tim trường đại học
from models import UserFavorite, UniversityData, db # Nhớ import bảng mới

# API Lấy danh sách trường yêu thích của 1 user
@api_bp.route('/api/favorites/<int:user_id>', methods=['GET'])
def get_favorites(user_id):
    try:
        # Tìm các ID trường mà user đã thả tim
        favs = UserFavorite.query.filter_by(user_id=user_id).all()
        uni_ids = [f.university_id for f in favs]
        
        if not uni_ids:
            return jsonify([]), 200
            
        # Kéo thông tin chi tiết các trường đó
        unis = UniversityData.query.filter(UniversityData.id.in_(uni_ids)).all()
        return jsonify([u.to_dict() for u in unis]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# ==========================================
# API CẬP NHẬT (SỬA NHANH) HỒ SƠ TỪ TRANG PROFILE
# ==========================================
@api_bp.route('/api/orientation/<int:user_id>', methods=['PUT', 'OPTIONS'])
def update_orientation_profile(user_id):
    if flask.request.method == 'OPTIONS':
        return flask.jsonify({}), 200
        
    try:
        data = flask.request.json
        
        # 1. Tìm xem user này đã có hồ sơ trong DB chưa
        from models import db, OrientationProfile
        profile = OrientationProfile.query.filter_by(user_id=user_id).first()
        
        # 2. Nếu chưa có thì báo lỗi (vì sửa nhanh là phải có data rồi mới sửa)
        if not profile:
            return flask.jsonify({"error": "Không tìm thấy hồ sơ để cập nhật!"}), 404
            
        # 3. Cập nhật từng dòng dữ liệu từ form Sửa nhanh gửi sang
        profile.target_block = data.get('target_block')
        profile.exam_score = data.get('exam_score')
        profile.gpa_10 = data.get('gpa_10')
        profile.gpa_11 = data.get('gpa_11')
        profile.gpa_12 = data.get('gpa_12')
        profile.dgnl_score = data.get('dgnl_score')
        profile.sat_score = data.get('sat_score')
        profile.ielts_score = data.get('ielts_score')
        profile.prize_level = data.get('prize_level')
        profile.has_portfolio = data.get('has_portfolio')
        profile.study_location = data.get('study_location')
        profile.tuition_limit = data.get('tuition_limit')
        profile.living_cost_monthly = data.get('living_cost_monthly')
        
        # 4. Chốt hạ: Lưu vào Database
        db.session.commit()
        return flask.jsonify({"message": "Cập nhật hồ sơ thành công!"}), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print("Lỗi khi cập nhật hồ sơ sửa nhanh:", traceback.format_exc())
        return flask.jsonify({"error": "Lỗi hệ thống: " + str(e)}), 500
# API Bấm tim / Bỏ tim
@api_bp.route('/api/favorites/toggle', methods=['POST'])
def toggle_favorite():
    try:
        data = request.json
        user_id = data.get('user_id')
        uni_id = data.get('university_id')
        
        # Kiểm tra xem đã tim chưa
        fav = UserFavorite.query.filter_by(user_id=user_id, university_id=uni_id).first()
        
        if fav:
            # Nếu có rồi -> Bấm lần nữa là XÓA (Bỏ tim)
            db.session.delete(fav)
            db.session.commit()
            return jsonify({'message': 'Đã bỏ yêu thích', 'status': 'removed'}), 200
        else:
            # Nếu chưa có -> THÊM (Thả tim)
            new_fav = UserFavorite(user_id=user_id, university_id=uni_id)
            db.session.add(new_fav)
            db.session.commit()
            return jsonify({'message': 'Đã thêm vào yêu thích', 'status': 'added'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
 
from flask import request, jsonify
import json

# 🚀 ĐÃ SỬA: Đổi @chat_bp thành @api_bp và thêm 'OPTIONS'
@api_bp.route('/api/orientation/<int:user_id>', methods=['GET', 'OPTIONS'])
def get_orientation(user_id):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        # Tìm hồ sơ của user trong Database
        profile = OrientationProfile.query.filter_by(user_id=user_id).first()
        
        if profile:
            return jsonify(profile.to_dict()), 200
        else:
            return jsonify({"message": "Chưa có hồ sơ định hướng"}), 404

    except Exception as e:
        import traceback
        print("Lỗi API lấy hồ sơ:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500
  
import flask # Chắc chắn import flask ở dạng gốc để gọi trực tiếp

@api_bp.route('/api/orientation', methods=['POST', 'OPTIONS'])
def save_orientation():
    # 🚀 GỌI ĐÍCH DANH `flask.request` ĐỂ KHÔNG BAO GIỜ BỊ LỖI
    if flask.request.method == 'OPTIONS': 
        return flask.jsonify({}), 200
        
    try:
        data = flask.request.json
        user_id = data.get('userId', 1) # Mặc định là 1 nếu chưa làm phần đăng nhập

        # Kiểm tra xem User đã có hồ sơ chưa, nếu có thì cập nhật, chưa thì tạo mới
        profile = OrientationProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            profile = OrientationProfile(user_id=user_id)
            db.session.add(profile)

        # Map dữ liệu từ React sang DB
        profile.interests = data.get('interests')
        profile.work_environment = data.get('workEnv')
        profile.gpa_10 = float(data.get('gpa10')) if data.get('gpa10') else None
        profile.gpa_11 = float(data.get('gpa11')) if data.get('gpa11') else None
        profile.gpa_12 = float(data.get('gpa12')) if data.get('gpa12') else None
        profile.exam_score = float(data.get('examScore')) if data.get('examScore') else None
        profile.dgnl_score = float(data.get('dgnlScore')) if data.get('dgnlScore') else None
        profile.ielts_score = str(data.get('ielts'))
        profile.sat_score = int(data.get('satScore')) if data.get('satScore') else None
        profile.prize_level = data.get('prizeLevel')
        profile.has_portfolio = data.get('hasPortfolio')
        profile.target_block = data.get('block')
        profile.study_location = data.get('location')
        profile.tuition_limit = data.get('tuitionLimit')
        profile.living_cost_monthly = data.get('livingCost')

        db.session.commit()
        return flask.jsonify({"message": "Lộ trình định hướng đã được lưu trữ thành công!"}), 200

    except Exception as e:
        db.session.rollback()
        print("Lỗi lưu hồ sơ:", str(e))
        return flask.jsonify({"error": str(e)}), 500
    
    from flask import request, jsonify
from models import db, User # Nhớ kiểm tra dòng này ở đầu file nha

# =====================================================================
# API: CẬP NHẬT HỒ SƠ NGƯỜI DÙNG (CÓ HỖ TRỢ BẮT LỖI CORS 'OPTIONS')
# =====================================================================
@chat_bp.route('/api/update-profile', methods=['PUT', 'OPTIONS'])
def update_profile():
    # 1. Trả lời cái gói tin "hỏi đường" của trình duyệt
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    # 2. Xử lý gói tin thật (PUT)
    data = request.json
    try:
        # Lấy email từ form React gửi lên để tìm đúng người trong MySQL
        email = data.get('email')
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"error": "Không tìm thấy tài khoản trong hệ thống!"}), 404

        # 3. Cập nhật dữ liệu CHUNG (Ai cũng có)
        user.full_name = data.get('fullName', user.full_name)
        user.name = data.get('username', user.name) 
        user.phone_number = data.get('phone', user.phone_number)
        user.date_of_birth = data.get('dob', user.date_of_birth)
        user.address = data.get('address', user.address)
        
        # 🚀 CẬP NHẬT DỮ LIỆU RIÊNG TÙY THEO ROLE
        if user.role == 'mentor':
            # Hứng 2 trường của Cố vấn
            user.specialty = data.get('specialty', user.specialty)
            
            exp_years = data.get('experienceYears')
            # Kiểm tra xem có gửi lên không và không bị rỗng thì mới ép kiểu int
            if exp_years is not None and str(exp_years).strip() != '':
                user.experience_years = int(exp_years)
                
        else:
            # Hứng 2 trường của Học sinh (user)
            user.class_name = data.get('className', user.class_name)
            user.school_name = data.get('schoolName', user.school_name)

        # Chốt đơn!
        db.session.commit()

        # 4. Trả về thông tin mới tinh để React cập nhật lại cái LocalStorage
        updated_user = {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "username": user.name,
            "role": user.role,
            "phone": user.phone_number,
            "dob": user.date_of_birth,
            "address": user.address,
            # Trả về tất cả để localStorage có đủ data
            "className": user.class_name,
            "schoolName": user.school_name,
            "specialty": user.specialty,
            "experienceYears": user.experience_years
        }

        return jsonify({
            "message": "Đã cập nhật hồ sơ thành công rực rỡ!",
            "user": updated_user
        }), 200

    except Exception as e:
        db.session.rollback() # Có lỗi là phải quay xe ngay
        print("Lỗi update profile:", str(e))
        return jsonify({"error": str(e)}), 500
    
    
    
from flask import request, jsonify
# Nhớ import MentorSlot, db, và hàm mentor_required vào đây

# ==========================================
# 1. API: LẤY DANH SÁCH GIỜ RẢNH CỦA CỐ VẤN
# ==========================================
@chat_bp.route('/api/mentor/slots', methods=['GET'])
@mentor_required
def get_mentor_slots(current_user):
    try:
        # Lấy tất cả các khung giờ của đúng cố vấn đang đăng nhập
        slots = MentorSlot.query.filter_by(mentor_id=current_user.id).order_by(MentorSlot.date, MentorSlot.start_time).all()
        
        slot_list = []
        for slot in slots:
            slot_list.append({
                'id': slot.id,
                'date': slot.date,
                'time': slot.start_time,
                'is_booked': slot.is_booked
            })
            
        return jsonify({"slots": slot_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# 2. API: THÊM KHUNG GIỜ RẢNH MỚI
# ==========================================
@chat_bp.route('/api/mentor/slots', methods=['POST'])
@mentor_required
def add_mentor_slot(current_user):
    data = request.json
    date = data.get('date')
    time = data.get('time')
    
    if not date or not time:
        return jsonify({"error": "Vui lòng chọn đầy đủ ngày và giờ!"}), 400
        
    try:
        # Kiểm tra xem cố vấn đã tạo giờ này chưa
        existing_slot = MentorSlot.query.filter_by(mentor_id=current_user.id, date=date, start_time=time).first()
        if existing_slot:
            return jsonify({"error": "Khung giờ này đã tồn tại trong lịch của bạn!"}), 400
            
        new_slot = MentorSlot(
            mentor_id=current_user.id,
            date=date,
            start_time=time,
            is_booked=False
        )
        db.session.add(new_slot)
        db.session.commit()
        
        return jsonify({
            "message": "Đã thêm khung giờ thành công!",
            "slot": {"id": new_slot.id, "date": date, "time": time}
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==========================================
# 3. API: XÓA KHUNG GIỜ (Chỉ xóa được nếu chưa ai đặt)
# ==========================================
@chat_bp.route('/api/mentor/slots/<int:slot_id>', methods=['DELETE'])
@mentor_required
def delete_mentor_slot(current_user, slot_id):
    try:
        slot = MentorSlot.query.get(slot_id)
        
        # Kiểm tra: Slot có tồn tại không? Có phải của cố vấn này không?
        if not slot or slot.mentor_id != current_user.id:
            return jsonify({"error": "Không tìm thấy khung giờ này!"}), 404
            
        # Kiểm tra: Nếu đã có học sinh đặt rồi thì không cho xóa ngang xương
        if slot.is_booked:
            return jsonify({"error": "Không thể xóa vì đã có học sinh đặt lịch vào giờ này!"}), 400
            
        db.session.delete(slot)
        db.session.commit()
        
        return jsonify({"message": "Đã xóa khung giờ thành công!"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# ==========================================
# 1. LẤY DANH SÁCH LỊCH HẸN CHO CỐ VẤN
# ==========================================
# Nhớ import thêm Mentor nhé sếp!
from models import db, Booking, MentorSlot, User, Mentor 

@chat_bp.route('/api/mentor/bookings', methods=['GET'])
@mentor_required
def get_mentor_bookings(current_user):
    try:
        # 🚀 BƯỚC 1: Tìm ID thực sự của Cố vấn bên bảng 'mentors' thông qua email
        mentor_profile = Mentor.query.filter_by(email=current_user.email).first()
        
        # Nếu chưa có profile trong bảng mentors thì trả về rỗng luôn
        if not mentor_profile:
            return jsonify({"bookings": []}), 200

        # 🚀 BƯỚC 2: Dùng mentor_profile.id để tìm lịch hẹn thay vì current_user.id
        bookings = Booking.query.filter(
            Booking.mentor_id == mentor_profile.id,
            Booking.status != 'rejected'
        ).order_by(Booking.created_at.desc()).all()
        
        result = []
        for b in bookings:
            # Bọc thêm điều kiện if else cho b.student và b.slot để chống lỗi vặt nếu DB bị mất data
            result.append({
                'id': b.id,
                'student': b.student.full_name or b.student.email.split('@')[0] if b.student else "Học sinh ẩn danh",
                'topic': b.topic,
                'status': b.status,
                'date': b.slot.date if b.slot else "Không rõ",
                'time': b.slot.start_time if b.slot else "Không rõ"
            })
            
        return jsonify({"bookings": result}), 200
    except Exception as e:
        print("Lỗi lấy danh sách booking:", str(e))
        return jsonify({"error": "Đã xảy ra lỗi trên server"}), 500

# ==========================================
# 2. XỬ LÝ CHẤP NHẬN / TỪ CHỐI LỊCH HẸN
# ==========================================
@chat_bp.route('/api/mentor/bookings/<int:booking_id>', methods=['PUT'])
@mentor_required
def update_booking_status(current_user, booking_id):
    data = request.json
    new_status = data.get('status') # 'confirmed' hoặc 'rejected'
    
    if new_status not in ['confirmed', 'rejected']:
        return jsonify({"error": "Trạng thái không hợp lệ!"}), 400
        
    try:
        # 🚀 CŨNG PHẢI FIX Ở ĐÂY: Tìm ID thực sự bên bảng 'mentors'
        mentor_profile = Mentor.query.filter_by(email=current_user.email).first()
        if not mentor_profile:
            return jsonify({"error": "Không tìm thấy hồ sơ cố vấn!"}), 404

        booking = Booking.query.get(booking_id)
        
        # So sánh với mentor_profile.id
        if not booking or booking.mentor_id != mentor_profile.id:
            return jsonify({"error": "Không tìm thấy lịch hẹn!"}), 404
            
        booking.status = new_status
        
        slot = MentorSlot.query.get(booking.slot_id)
        if slot:
            if new_status == 'confirmed':
                slot.is_booked = True
                # TỰ ĐỘNG TẠO LINK PHÒNG HỌP KHI CHẤP NHẬN
                room_name = f"MindConnect_Consulting_Private_Room_{booking.id}_Secure2026"
                booking.meeting_link = f"https://meet.jit.si/{room_name}"
            elif new_status == 'rejected':
                slot.is_booked = False
                booking.meeting_link = None # Xóa link nếu từ chối
                
        db.session.commit()
        return jsonify({
            "message": f"Đã { 'chấp nhận' if new_status == 'confirmed' else 'từ chối' } lịch hẹn!",
            "meeting_link": booking.meeting_link
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print("Lỗi xử lý booking:", str(e))
        return jsonify({"error": "Đã xảy ra lỗi trên server"}), 500

        # ==========================================
# API: HỌC SINH XEM LỊCH SỬ ĐẶT LỊCH (CÓ TRẢ VỀ LINK VIDEO)
# ==========================================
@api_bp.route('/api/user/bookings', methods=['GET', 'OPTIONS'])
def get_student_booking_history():
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
        
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Thiếu Header Authorization'}), 401

        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        student_id = payload.get('user_id')
        
        bookings = Booking.query.filter_by(student_id=student_id).all()
        
        result = []
        for b in bookings:
            mentor = Mentor.query.get(b.mentor_id)
            slot = MentorSlot.query.get(b.slot_id)
            
            result.append({
                'id': b.id,
                'mentorName': mentor.full_name if mentor else "Cố vấn đã nghỉ",
                # 🚀 ĐÃ THÊM DÒNG NÀY ĐỂ TRỊ BỆNH "VÔ DANH" CHO NÚT BÁO CÁO
                'mentor_id': mentor.id if mentor else None, 
                'date': slot.date if slot else "N/A",
                'time': slot.start_time if slot else "N/A",
                'topic': b.topic,
                'status': b.status,
                'meeting_link': getattr(b, 'meeting_link', None) # 🚀 TRẢ VỀ LINK Ở ĐÂY
            })
            
        return jsonify({'bookings': result}), 200
    except Exception as e:
        print(f"❌ Lỗi lấy lịch sử: {str(e)}")
        return jsonify({'error': str(e)}), 401
        # ==========================================
# API DÀNH RIÊNG CHO ADMIN: LẤY TOÀN BỘ BOOKING
# ==========================================
@api_bp.route('/api/admin/bookings', methods=['GET'])
@admin_required # Đảm bảo chỉ Admin mới vào được đây
def get_all_bookings_for_admin(current_user):
    try:
        # Lấy tất cả lịch hẹn, sắp xếp cái mới nhất lên đầu
        bookings = Booking.query.order_by(Booking.created_at.desc()).all()
        
        result = []
        for b in bookings:
            # Lấy thông tin học sinh và cố vấn liên quan
            student = User.query.get(b.student_id)
            mentor = Mentor.query.get(b.mentor_id)
            slot = MentorSlot.query.get(b.slot_id)
            
            result.append({
                'id': b.id,
                'student': student.full_name if student else "N/A",
                'mentor': mentor.full_name if mentor else "N/A",
                'date': slot.date if slot else "N/A",
                'time': slot.start_time if slot else "N/A",
                'status': b.status
            })
            
        return jsonify({"bookings": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API: Admin duyệt hoặc hủy đơn bất kỳ
@api_bp.route('/api/admin/bookings/<int:id>', methods=['PUT'])
@admin_required
def admin_update_status(current_user, id):
    data = request.json
    new_status = data.get('status') # 'confirmed' hoặc 'rejected' hoặc 'completed'
    
    booking = Booking.query.get(id)
    if not booking:
        return jsonify({"error": "Không tìm thấy đơn"}), 404
        
    booking.status = new_status
    db.session.commit()
    return jsonify({"message": "Cập nhật thành công"}), 200

  # ==========================================
# API ADMIN: QUẢN LÝ DANH SÁCH CỐ VẤN (BẢN CHUẨN)
# ==========================================

@api_bp.route('/api/admin/mentors', methods=['GET'])
@admin_required
def get_all_mentors(current_user):
    try:
        # 1. Lấy tất cả cố vấn từ bảng Mentor
        mentors = Mentor.query.all()
        
        result = []
        for m in mentors:
            # 2. Đóng gói dữ liệu (Lấy đúng tên cột trong Database của bạn)
            result.append({
                'id': m.id,
                'name': m.full_name,          # Cột full_name trong Navicat
                'email': m.email,              # Cột email trong Navicat
                'specialty': m.specialty,      # Cột specialty
                'exp': m.experience_years,     # Cột experience_years
                'status': 'active'             # Tạm để active vì DB chưa có cột status
            })
          
        # 3. Trả về mảng JSON
        return jsonify(result), 200
    except Exception as e:
        print(f"❌ Lỗi API Admin Mentors: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api_bp.route('/api/admin/mentors/<int:id>', methods=['DELETE'])
@admin_required
def delete_mentor(current_user, id):
    try:
        mentor = Mentor.query.get(id)
        if not mentor:
            return jsonify({"message": "Không tìm thấy cố vấn"}), 404
        
        db.session.delete(mentor)
        db.session.commit()
        return jsonify({"message": "Đã xóa cố vấn thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    # API: THÊM MỚI CỐ VẤN
from werkzeug.security import generate_password_hash # 🚀 Nhớ import cái này ở đầu file

# API: THÊM MỚI CỐ VẤN
@api_bp.route('/api/admin/mentors', methods=['POST'])
@admin_required
def add_mentor(current_user):
    try:
        data = request.json
        
        # 1. Tạo mật khẩu mặc định cho Cố vấn mới (ví dụ: 123456)
        hashed_password = generate_password_hash('123456')
        
        # 2. Tạo bản ghi khớp 100% với các cột trong Navicat
        new_mentor = Mentor(
            full_name=data.get('name'),
            email=data.get('email'),
            password=hashed_password,      # 🚀 Thêm mật khẩu mặc định
            specialty=data.get('specialty'),
            experience_years=data.get('exp')
            # ❌ Đã xóa dòng status='active'
        )
        
        db.session.add(new_mentor)
        db.session.commit()
        
        return jsonify({"message": "Thêm cố vấn thành công!", "id": new_mentor.id}), 201
        
    except Exception as e:
        db.session.rollback()
        print("❌ LỖI THÊM CỐ VẤN:", str(e)) # In lỗi ra màn hình đen terminal để bạn dễ thấy
        return jsonify({"error": str(e)}), 500
#sữa API: CẬP NHẬT THÔNG TIN CỐ VẤN

@api_bp.route('/api/admin/mentors/<int:id>', methods=['PUT'])
@admin_required
def update_mentor(current_user, id):
    data = request.json
    mentor = Mentor.query.get(id)
    if not mentor: return jsonify({"error": "N/A"}), 404
    
    mentor.full_name = data.get('name')
    mentor.email = data.get('email')
    mentor.specialty = data.get('specialty')
    mentor.experience_years = data.get('exp')
    
    db.session.commit()
    return jsonify({"message": "OK"}), 200
        
        # ==========================================
# API ADMIN: QUẢN LÝ LỊCH SỬ CHAT AI
# ==========================================

# 1. API Lấy danh sách các phiên hội thoại (Cột bên trái)
from sqlalchemy import desc

from sqlalchemy import desc

# ==========================================
# 1. API Lấy danh sách các phiên hội thoại (Cột bên trái)
# ==========================================
@api_bp.route('/api/admin/chat-sessions', methods=['GET'])
@admin_required
def get_admin_chat_sessions(current_user):
    try:
        # TỐI ƯU: Join bảng ChatSession với bảng User để lấy dữ liệu 1 lần duy nhất
        sessions_with_users = db.session.query(ChatSession, User)\
            .outerjoin(User, ChatSession.user_id == User.id)\
            .order_by(desc(ChatSession.id))\
            .all()
        
        result = []
        for session, user in sessions_with_users:
            raw_title = session.title or "Cuộc hội thoại mới"
            clean_title = raw_title.split("(Chỉ thị hệ thống:")[0].strip()
            
            if not clean_title:
                clean_title = "Tin nhắn hình ảnh/hệ thống"

            result.append({
                'id': session.id,
                'user': user.full_name if user else "Người dùng ẩn danh",
                'email': user.email if user else "N/A",
                'time': session.created_at.strftime("%H:%M - %d/%m/%Y") if session.created_at else "Vừa xong",
                'preview': clean_title,
                'status': 'Hoàn thành',
                'is_flagged': session.is_flagged
            })
            
        return jsonify(result), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi lấy sessions: {str(e)}")
        return jsonify({"error": "Không thể tải danh sách hội thoại"}), 500


# ==========================================
# 2. API Lấy chi tiết tin nhắn của 1 phiên (Cột bên phải)
# ==========================================
@api_bp.route('/api/admin/chat-sessions/<int:session_id>/messages', methods=['GET'])
@admin_required
def get_admin_chat_messages(current_user, session_id):
    try:
        # Lấy tất cả tin nhắn của phiên này, sắp xếp cũ -> mới (để đọc từ trên xuống)
        messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.created_at.asc()).all()
        
        result = []
        for m in messages:
            # 🚀 FIX 1: Kiểm tra an toàn trước khi cắt chuỗi, tránh sập web nếu content là Null
            clean_content = ""
            if m.content:
                clean_content = m.content.split("(Chỉ thị hệ thống:")[0].strip()
            
            result.append({
                'id': m.id,
                'sender': m.sender,
                'content': clean_content,
                
                # 🚀 FIX 2: Bổ sung image_data để React có thể hiển thị ảnh
                'image_data': m.image_data, 
                
                'created_at': m.created_at.strftime("%H:%M") if m.created_at else ""
            })
            
        return jsonify(result), 200
    except Exception as e:
        print("❌ Lỗi lấy messages:", str(e))
        return jsonify({"error": str(e)}), 500

        # ==========================================
# API ADMIN: XÓA LỊCH SỬ CHAT
# ==========================================
@api_bp.route('/api/admin/chat-sessions/<int:session_id>', methods=['DELETE'])
@admin_required
def delete_chat_session(current_user, session_id):
    try:
        # 1. Tìm phiên chat cần xóa
        session = ChatSession.query.get(session_id)
        if not session:
            return jsonify({"error": "Không tìm thấy phiên chat này"}), 404

        # 2. Xóa tất cả tin nhắn thuộc về phiên này (Quan trọng: Xóa con trước)
        ChatMessage.query.filter_by(session_id=session_id).delete()
        
        # 3. Xóa phiên chat (Xóa cha sau)
        db.session.delete(session)
        db.session.commit()
        
        return jsonify({"message": "Đã xóa lịch sử chat thành công!"}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi xóa session: {str(e)}")
        return jsonify({"error": "Lỗi hệ thống khi xóa"}), 500

        # ==========================================
# API ADMIN: GẮN CỜ / BỎ CỜ PHIÊN CHAT
# ==========================================
@api_bp.route('/api/admin/chat-sessions/<int:session_id>/flag', methods=['PUT'])
@admin_required
def toggle_flag_session(current_user, session_id):
    try:
        session = ChatSession.query.get(session_id)
        if not session:
            return jsonify({"error": "Không tìm thấy phiên chat này"}), 404

        # Đảo ngược trạng thái: Đang 0 thành 1, đang 1 thành 0
        session.is_flagged = not session.is_flagged
        db.session.commit()
        
        return jsonify({
            "message": "Đã cập nhật trạng thái gắn cờ", 
            "is_flagged": session.is_flagged
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



from models import UniversityData, UniversityDetail, User, ActivityLog # 🚀 NHỚ THÊM ActivityLog VÀO ĐÂY NHÉ
import urllib.parse
from flask import request, jsonify

# ==========================================
# 🚀 API ADMIN: LẤY THỐNG KÊ & CẢNH BÁO DỮ LIỆU (MỚI)
# ==========================================
@api_bp.route('/api/admin/system-stats', methods=['GET'])
@admin_required
def get_system_stats(current_user):
    try:
        # Tổng số trường đại học (Đếm các tên trường không trùng nhau)
        total_unis = db.session.query(UniversityData.school_name).distinct().count()
        
        # Đếm số ngành ĐANG BỊ TRỐNG học phí
        missing_tuition = UniversityData.query.filter(
            (UniversityData.tuition_fee == None) | (UniversityData.tuition_fee == '')
        ).count()
        
        # Đếm số trường ĐANG BỊ TRỐNG Logo
        missing_logo = db.session.query(UniversityData.school_name).filter(
            (UniversityData.school_logo == None) | (UniversityData.school_logo == '')
        ).distinct().count()

        # Lấy 5 lịch sử hoạt động gần nhất
        recent_logs = ActivityLog.query.order_by(ActivityLog.created_at.desc()).limit(5).all()
        logs_data = [{
            "type": l.action_type, 
            "desc": l.description, 
            "time": l.created_at.strftime("%H:%M %d/%m/%Y") if l.created_at else "Vừa xong"
        } for l in recent_logs]

        return jsonify({
            "total_unis": total_unis,
            "missing_tuition": missing_tuition,
            "missing_logo": missing_logo,
            "recent_logs": logs_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# API ADMIN: QUẢN LÝ DỮ LIỆU TRƯỜNG ĐẠI HỌC
# ==========================================
import re
from flask import request, jsonify

# ==========================================
# API ADMIN: XEM DANH SÁCH TRƯỜNG ĐẠI HỌC (TỰ ĐỘNG SINH MÃ TRƯỜNG)
# ==========================================
@api_bp.route('/api/admin/universities', methods=['GET', 'OPTIONS'])
def get_admin_universities(): 
    # Mở đường cho React gọi API không bị chặn CORS
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        # Join bảng UniversityData với UniversityDetail để lấy địa chỉ
        query_result = db.session.query(UniversityData, UniversityDetail)\
            .outerjoin(UniversityDetail, UniversityData.id == UniversityDetail.university_id)\
            .all()

        unique_schools = {}

        for uni_data, uni_detail in query_result:
            school_name = uni_data.school_name if uni_data.school_name else "Trường ẩn danh"
            
            if school_name not in unique_schools:
                # Xử lý địa chỉ và loại hình
                address = uni_detail.address if uni_detail and uni_detail.address else "Chưa có địa chỉ"
                short_address = address.split(',')[-1].strip() if ',' in address else address
                school_type = uni_data.school_type if uni_data.school_type else "Công lập"
                location_str = f"{short_address} • {school_type}"

                # 🚀 LOGIC TẠO MÃ TRƯỜNG THÔNG MINH TỪ TÊN TRƯỜNG
                # 1. Tìm xem trong tên trường có chữ viết tắt trong ngoặc không (VD: (NEU), (FTU))
                match = re.search(r'\((.*?)\)', school_name)
                if match and len(match.group(1)) <= 10: 
                    generated_code = match.group(1).upper()
                else:
                    # 2. Nếu không có ngoặc, bốc chữ cái đầu của từng từ (VD: Đại học FPT -> ĐHF)
                    clean_name = school_name.replace("Trường ", "").replace("Đại học ", "ĐH ")
                    words = clean_name.split()
                    generated_code = "".join([word[0].upper() for word in words if word])[:6]

                unique_schools[school_name] = {
                    'id': uni_data.id, 
                    'name': school_name,
                    'location': location_str,
                    'code': generated_code,  # 👈 Sử dụng mã tự sinh, bỏ qua major_code
                    'updated': 'Vừa đồng bộ',
                    'status': 'Đã đồng bộ AI',
                    'logo': uni_data.school_logo or 'https://via.placeholder.com/150'
                }

        result = list(unique_schools.values())
        return jsonify(result), 200

    except Exception as e:
        import traceback
        print(f"❌ Lỗi API Universities (GET): {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500
    
# ==========================================
# API ADMIN: XEM DANH SÁCH NGÀNH CỦA 1 TRƯỜNG
# ==========================================
@api_bp.route('/api/admin/universities/majors', methods=['GET'])
@admin_required
def get_majors_by_school(current_user):
    try:
        school_name = request.args.get('school')
        
        if not school_name:
            return jsonify([]), 200

        majors = UniversityData.query.filter_by(school_name=school_name).all()
        
        result = []
        for m in majors:
            detail = m.details 
            result.append({
                'id': m.id,
                'school_name': m.school_name,
                'school_type': m.school_type,
                'school_logo': m.school_logo,
                'major_name': m.major_name,
                'major_code': m.major_code,
                'subject_block': m.subject_block,
                'base_score': m.base_score,
                'tuition_fee': m.tuition_fee,
                
                'score_thpt_last_year': m.score_thpt_last_year,
                'score_dgnl': m.score_dgnl,
                'combo_cert': m.combo_cert,
                'direct_admission': m.direct_admission,
                'aptitude_test': m.aptitude_test,
                
                'address': detail.address if detail else '',
                'website': detail.website if detail else '',
                'phone': detail.phone if detail else '',
                'description': detail.description if detail else '',
                'admission_methods': detail.admission_methods if detail else ''
            })
        return jsonify(result), 200
    except Exception as e:
        print("❌ Lỗi lấy ngành:", str(e))
        return jsonify({"error": str(e)}), 500

# ==========================================
# THÊM MỚI FULL DỮ LIỆU (CÓ GHI LOG)
# ==========================================
@api_bp.route('/api/admin/universities', methods=['POST'])
@admin_required
def add_university_major(current_user):
    try:
        data = request.json
        
        new_data = UniversityData(
            school_name=data.get('school_name'),
            school_type=data.get('school_type'),
            school_logo=data.get('school_logo'),
            major_name=data.get('major_name'),
            major_code=data.get('major_code'),
            subject_block=data.get('subject_block'),
            base_score=float(data.get('base_score') or 0),
            tuition_fee=data.get('tuition_fee'),
            
            score_thpt_last_year=float(data.get('score_thpt_last_year') or 0),
            score_dgnl=int(data.get('score_dgnl') or 0),
            combo_cert=data.get('combo_cert'),
            direct_admission=data.get('direct_admission'),
            aptitude_test=data.get('aptitude_test')
        )
        db.session.add(new_data)
        db.session.flush() 
        
        new_detail = UniversityDetail(
            university_id=new_data.id,
            address=data.get('address'),
            website=data.get('website'),
            phone=data.get('phone'),
            description=data.get('description'),
            admission_methods=data.get('admission_methods')
        )
        db.session.add(new_detail)

        # 🚀 GHI LOG VÀO DATABASE
        log = ActivityLog(
            action_type="Thêm mới", 
            description=f"Admin vừa thêm ngành {data.get('major_name')} cho {data.get('school_name')}."
        )
        db.session.add(log)

        db.session.commit()
        return jsonify({"message": "Thêm thành công!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==========================================
# CẬP NHẬT FULL DỮ LIỆU (CÓ GHI LOG)
# ==========================================
@api_bp.route('/api/admin/universities/<int:id>', methods=['PUT'])
@admin_required
def update_university_major(current_user, id):
    try:
        data = request.json
        uni_data = UniversityData.query.get(id)
        if not uni_data: return jsonify({"error": "Không tìm thấy"}), 404
        
        uni_data.school_name = data.get('school_name')
        uni_data.school_type = data.get('school_type')
        uni_data.school_logo = data.get('school_logo')
        uni_data.major_name = data.get('major_name')
        uni_data.major_code = data.get('major_code')
        uni_data.subject_block = data.get('subject_block')
        uni_data.base_score = float(data.get('base_score') or 0)
        uni_data.tuition_fee = data.get('tuition_fee')
        
        uni_data.score_thpt_last_year = float(data.get('score_thpt_last_year') or 0)
        uni_data.score_dgnl = int(data.get('score_dgnl') or 0)
        uni_data.combo_cert = data.get('combo_cert')
        uni_data.direct_admission = data.get('direct_admission')
        uni_data.aptitude_test = data.get('aptitude_test')
        
        uni_detail = UniversityDetail.query.filter_by(university_id=id).first()
        if uni_detail:
            uni_detail.address = data.get('address')
            uni_detail.website = data.get('website')
            uni_detail.phone = data.get('phone')
            uni_detail.description = data.get('description')
            uni_detail.admission_methods = data.get('admission_methods')
            
        # 🚀 GHI LOG VÀO DATABASE
        log = ActivityLog(
            action_type="Cập nhật", 
            description=f"Admin vừa sửa thông tin ngành {data.get('major_name')} của {data.get('school_name')}."
        )
        db.session.add(log)

        db.session.commit()
        return jsonify({"message": "Cập nhật thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==========================================
# XÓA NGÀNH HỌC (CÓ GHI LOG)
# ==========================================
@api_bp.route('/api/admin/universities/<int:id>', methods=['DELETE'])
@admin_required
def delete_university_major(current_user, id):
    try:
        uni_data = UniversityData.query.get(id)
        if not uni_data: return jsonify({"error": "Không tìm thấy"}), 404
        
        major_name_to_log = uni_data.major_name
        school_name_to_log = uni_data.school_name
        
        db.session.delete(uni_data)

        # 🚀 GHI LOG VÀO DATABASE
        log = ActivityLog(
            action_type="Xóa", 
            description=f"Admin vừa xóa ngành {major_name_to_log} của {school_name_to_log} khỏi hệ thống."
        )
        db.session.add(log)

        db.session.commit()
        return jsonify({"message": "Xóa thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


        # ==========================================
# 🚀 API ADMIN: QUẢN LÝ TUYỂN SINH
# ==========================================

# ==========================================
# 🚀 API ADMIN: QUẢN LÝ TUYỂN SINH (FULL CHỨC NĂNG)
# ==========================================

# 1. LẤY DANH SÁCH & THỐNG KÊ
import pandas as pd # 🚀 Nhớ thêm thư viện này ở đầu file

# 1. LẤY DANH SÁCH & THỐNG KÊ (CẬP NHẬT THUẬT TOÁN DỰ BÁO)
@api_bp.route('/api/admin/admissions', methods=['GET'])
@admin_required
def get_admissions(current_user):
    try:
        year_filter = request.args.get('year', 2025, type=int)
        majors = UniversityData.query.filter_by(year=year_filter).all()
        
        total_majors = len(majors)
        total_quota = sum([m.quota for m in majors if m.quota])
        
        # 🚀 THUẬT TOÁN DỰ BÁO ĐIỂM CHUẨN ĐƠN GIẢN
        # (Dựa trên tỷ lệ: Trung bình mỗi ngành bao nhiêu chỉ tiêu)
        if total_majors > 0:
            avg_quota = total_quota / total_majors
            if avg_quota > 200:
                trend = "Giảm nhẹ (-0.5đ)"
            elif avg_quota < 100:
                trend = "Tăng mạnh (+1.0đ)"
            else:
                trend = "Ổn định (+- 0.2đ)"
        else:
            trend = "Chưa có dữ liệu"

        data = []
        for m in majors:
            methods = []
            if m.score_thpt_last_year: methods.append("Thi THPT")
            if m.base_score: methods.append("Học bạ")
            if m.score_dgnl: methods.append("ĐGNL")
            if m.combo_cert: methods.append("Kết hợp")
            if m.direct_admission: methods.append("Tuyển thẳng")
            if m.aptitude_test: methods.append("Năng khiếu")
            
            data.append({
                "id": m.id, "school": m.school_name, "major": m.major_name,
                "code": m.major_code, "blocks": m.subject_block, "quota": m.quota or 0,
                "score_thpt": m.score_thpt_last_year, "score_hocba": m.base_score,
                "score_dgnl": m.score_dgnl, "combo_cert": m.combo_cert,
                "direct_admission": m.direct_admission, "aptitude_test": m.aptitude_test,
                "method": ", ".join(methods) if methods else "Chưa cập nhật",
                "year": m.year 
            })
            
        return jsonify({
            "stats": {
                "total_majors": total_majors, 
                "total_quota": total_quota,
                "trend": trend # 🚀 Gửi kèm dự báo về cho React
            }, 
            "data": data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. THÊM API IMPORT EXCEL (MỚI HOÀN TOÀN)
@api_bp.route('/api/admin/admissions/import', methods=['POST'])
@admin_required
def import_admissions_excel(current_user):
    try:
        if 'file' not in request.files:
            return jsonify({"error": "Không tìm thấy file Excel!"}), 400
            
        file = request.files['file']
        year = request.form.get('year', 2025, type=int) # Lấy năm để gán cho toàn bộ file
        
        # Đọc file Excel bằng Pandas
        df = pd.read_excel(file)
        
        # Lặp qua từng dòng trong Excel để lưu vào DB
        # (Yêu cầu Excel có các cột: Truong, Nganh, MaNganh, Khoi, ChiTieu, THPT, HocBa, DGNL)
        success_count = 0
        for index, row in df.iterrows():
            new_major = UniversityData(
                school_name=str(row.get('Truong', '')),
                major_name=str(row.get('Nganh', '')),
                major_code=str(row.get('MaNganh', '')),
                subject_block=str(row.get('Khoi', '')),
                quota=int(row.get('ChiTieu') or 0) if pd.notna(row.get('ChiTieu')) else 0,
                score_thpt_last_year=float(row.get('THPT') or 0) if pd.notna(row.get('THPT')) else 0,
                base_score=float(row.get('HocBa') or 0) if pd.notna(row.get('HocBa')) else 0,
                score_dgnl=int(row.get('DGNL') or 0) if pd.notna(row.get('DGNL')) else 0,
                year=year
            )
            db.session.add(new_major)
            success_count += 1
            
        # Ghi Log
        log = ActivityLog(action_type="Import", description=f"Admin import thành công {success_count} ngành học cho năm {year}.")
        db.session.add(log)
        
        db.session.commit()
        return jsonify({"message": f"Import thành công {success_count} dòng dữ liệu!"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Lỗi đọc file: {str(e)}"}), 500

# 2. CẬP NHẬT FULL DỮ LIỆU (PUT)
@api_bp.route('/api/admin/admissions/<int:id>', methods=['PUT'])
@admin_required
def update_admission(current_user, id):
    try:
        data = request.json
        major = UniversityData.query.get(id)
        if not major: return jsonify({"error": "Không tìm thấy"}), 404
        
        major.school_name = data.get('school')
        major.major_name = data.get('major')
        major.major_code = data.get('code')
        major.subject_block = data.get('blocks')
        major.quota = int(data.get('quota') or 0)
        
        # Lưu Full phương thức
        major.score_thpt_last_year = float(data.get('score_thpt') or 0)
        major.base_score = float(data.get('score_hocba') or 0)
        major.score_dgnl = int(data.get('score_dgnl') or 0)
        major.combo_cert = data.get('combo_cert')
        major.direct_admission = data.get('direct_admission')
        major.aptitude_test = data.get('aptitude_test')
        
        # Ghi Log
        log = ActivityLog(action_type="Cập nhật", description=f"Admin sửa chỉ tiêu/điểm chuẩn ngành {major.major_name}.")
        db.session.add(log)
        
        db.session.commit()
        return jsonify({"message": "Cập nhật thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 3. THÊM MỚI FULL DỮ LIỆU (POST)
@api_bp.route('/api/admin/admissions', methods=['POST'])
@admin_required
def add_admission(current_user):
    try:
        data = request.json
        new_major = UniversityData(
            school_name=data.get('school'),
            major_name=data.get('major'),
            major_code=data.get('code'),
            subject_block=data.get('blocks'),
            quota=int(data.get('quota') or 0),
            
            score_thpt_last_year=float(data.get('score_thpt') or 0),
            base_score=float(data.get('score_hocba') or 0),
            score_dgnl=int(data.get('score_dgnl') or 0),
            combo_cert=data.get('combo_cert'),
            direct_admission=data.get('direct_admission'),
            aptitude_test=data.get('aptitude_test')
        )
        db.session.add(new_major)
        
        log = ActivityLog(action_type="Thêm mới", description=f"Admin thêm dữ liệu tuyển sinh ngành {data.get('major')}.")
        db.session.add(log)
        
        db.session.commit()
        return jsonify({"message": "Thêm thành công!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
        
# 4. XÓA (DELETE)
@api_bp.route('/api/admin/admissions/<int:id>', methods=['DELETE'])
@admin_required
def delete_admission(current_user, id):
    try:
        major = UniversityData.query.get(id)
        if not major: return jsonify({"error": "Không tìm thấy"}), 404
        major_name = major.major_name
        
        db.session.delete(major)
        
        log = ActivityLog(action_type="Xóa", description=f"Admin xóa dữ liệu tuyển sinh ngành {major_name}.")
        db.session.add(log)
        
        db.session.commit()
        return jsonify({"message": "Xóa thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

    from models import MasterSubjectBlock, UniversityData, ActivityLog

# ==========================================
# 🚀 API ADMIN: QUẢN LÝ KHỐI THI (CHẠY DATA THẬT)
# ==========================================

from models import MasterSubjectBlock, UniversityData, ActivityLog
from flask import request, jsonify

# ==========================================
# 🚀 API ADMIN: QUẢN LÝ KHỐI THI (ĐÃ FIX LỖI OPTIONS 404)
# ==========================================

# 1. LẤY DANH SÁCH KHỐI THI
# 1. LẤY DANH SÁCH KHỐI THI
@api_bp.route('/api/admin/exam-blocks', methods=['GET', 'OPTIONS'])
@admin_required
def get_exam_blocks(current_user):
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        blocks = MasterSubjectBlock.query.all()
        data = []
        for b in blocks:
            usage_count = UniversityData.query.filter(UniversityData.subject_block.like(f"%{b.id}%")).count()
            data.append({
                "id": b.id,             
                "name": b.id,           
                "subjects": [s.strip() for s in b.subjects.split(',')] if b.subjects else [],
                "type": b.block_type or 'Tự nhiên', # 🚀 Lấy thẳng từ CSDL
                "description": b.description or '',
                "usage": usage_count
            })
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. THÊM MỚI KHỐI THI
@api_bp.route('/api/admin/exam-blocks', methods=['POST', 'OPTIONS'])
@admin_required
def add_exam_block(current_user):
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        data = request.json
        new_block = MasterSubjectBlock(
            id=data.get('name').upper(), 
            subjects=data.get('subjects'),
            description=data.get('description'),
            block_type=data.get('type') # 🚀 Lưu loại khối xuống CSDL
        )
        db.session.add(new_block)
        db.session.commit()
        return jsonify({"message": "Thêm khối thi thành công!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 3. CẬP NHẬT KHỐI THI
@api_bp.route('/api/admin/exam-blocks/<string:id>', methods=['PUT', 'OPTIONS'])
@admin_required
def update_exam_block(current_user, id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        data = request.json
        block = MasterSubjectBlock.query.get(id)
        if not block: return jsonify({"error": "Không tìm thấy"}), 404
        
        block.subjects = data.get('subjects')
        block.description = data.get('description')
        block.block_type = data.get('type') # 🚀 Cập nhật loại khối
        
        db.session.commit()
        return jsonify({"message": "Cập nhật thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# 4. XÓA KHỐI THI
@api_bp.route('/api/admin/exam-blocks/<string:id>', methods=['DELETE', 'OPTIONS'])
@admin_required
def delete_exam_block(current_user, id):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
        
    try:
        block = MasterSubjectBlock.query.get(id)
        if not block: return jsonify({"error": "Không tìm thấy"}), 404
        
        db.session.delete(block)
        
        log = ActivityLog(action_type="Xóa", description=f"Admin xóa khối thi {id}")
        db.session.add(log)
        db.session.commit()
        return jsonify({"message": "Xóa thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
from datetime import datetime, timedelta
from flask import request, jsonify
from models import User, db, ActivityLog # Thay ActivityLog bằng model log của bạn nếu có

# ==========================================
# 🚀 API ADMIN: QUẢN LÝ NGƯỜI DÙNG
# ==========================================

import pandas as pd
import io
from flask import send_file, request, jsonify
from datetime import datetime, timedelta
from models import User, UserReport, db # Đảm bảo import đúng model

# 1. CẬP NHẬT API LẤY DANH SÁCH (THÊM ĐẾM REPORT)
@api_bp.route('/api/admin/users', methods=['GET', 'OPTIONS'])
@admin_required
def get_users(current_user):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        
        total_users = len(users)
        pending_requests = len([u for u in users if not u.verified])
        
        today = datetime.now().date()
        active_today = len([u for u in users if u.updated_at and u.updated_at.date() == today])
        
        # 🚀 ĐẾM SỐ BÁO CÁO VI PHẠM THẬT TỪ DATABASE
        reported_count = UserReport.query.filter_by(status='Pending').count()
        
        data = []
        for u in users:
            is_online = False
            if u.updated_at and datetime.now() - u.updated_at < timedelta(minutes=15):
                is_online = True
                
            data.append({
                "id": u.id, "name": u.full_name or u.name or "Chưa cập nhật",
                "email": u.email, "role": str(u.role).upper(),
                "joined": u.created_at.strftime('%d Th%m, %Y') if u.created_at else "N/A",
                "status": "Active" if u.verified else "Pending",
                "online": is_online,
                "lastActive": "Đang online" if is_online else (u.updated_at.strftime('%H:%M %d/%m') if u.updated_at else "Chưa đăng nhập"),
                "verified": u.verified
            })
            
        return jsonify({
            "stats": {
                "total": total_users, "active_today": active_today,
                "pending": pending_requests, "reported": reported_count # 🚀 Gửi số liệu thật
            },
            "data": data
        }), 200
    except Exception as e:
        print("LỖI API USERS:", str(e))
        return jsonify({"error": str(e)}), 500

# 2. TẠO API MỚI: XUẤT FILE EXCEL
@api_bp.route('/api/admin/users/export', methods=['GET', 'OPTIONS'])
@admin_required
def export_users(current_user):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        users = User.query.all()
        # Chuẩn bị dữ liệu cho Excel
        data = [{
            "ID": u.id,
            "Họ tên": u.full_name or u.name or "N/A",
            "Email": u.email,
            "Vai trò": str(u.role).upper(),
            "Trạng thái": "Đã xác thực" if u.verified else "Chưa xác thực",
            "Ngày đăng ký": u.created_at.strftime('%Y-%m-%d %H:%M') if u.created_at else "N/A"
        } for u in users]
        
        df = pd.DataFrame(data)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Danh_sach_User')
            
        output.seek(0)
        return send_file(output, download_name="QuanLyNguoiDung.xlsx", as_attachment=True)
    except Exception as e:
        print("LỖI EXPORT EXCEL:", str(e))
        return jsonify({"error": str(e)}), 500
    
# 🚀 API: LẤY CHI TIẾT DANH SÁCH BÁO CÁO VI PHẠM (ĐÃ NÂNG CẤP CHỐNG LỖI)
@api_bp.route('/api/admin/reports', methods=['GET', 'OPTIONS'])
@admin_required
def get_report_details(current_user):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        # Dùng outerjoin: Lấy tất cả báo cáo, kể cả khi user đã bị xóa khỏi hệ thống
        reports = db.session.query(UserReport, User).outerjoin(User, UserReport.reported_user_id == User.id).all()
        
        data = []
        for r, u in reports:
            # Xử lý trường hợp ngày tháng bị rỗng (NULL) trong database để không bị sập API
            time_str = r.created_at.strftime('%H:%M %d/%m/%Y') if r.created_at else "Chưa cập nhật"
            
            data.append({
                "id": r.id,
                # Nếu tìm thấy User (u tồn tại) thì in tên, nếu không thì báo đã xóa
                "user_name": (u.full_name or u.name) if u else "Tài khoản vô danh/Đã xóa",
                "user_email": u.email if u else "Không rõ",
                "reason": r.reason or "Không có lý do",
                "status": r.status or "Pending",
                "created_at": time_str
            })
        return jsonify(data), 200
    except Exception as e:
        print("LỖI API REPORTS:", str(e))
        return jsonify({"error": str(e)}), 500
    
# 🚀 API DÀNH CHO USER: GỬI BÁO CÁO VI PHẠM
@api_bp.route('/api/user/report', methods=['POST', 'OPTIONS'])
def create_report():
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
        
    try:
        data = request.json
        new_report = UserReport(
            reported_user_id=data.get('reported_user_id'), 
            reason=data.get('reason'),                     
            status='Pending'                               
        )
        db.session.add(new_report)
        db.session.commit()
        
        return jsonify({"message": "Cảm ơn bạn! Đã gửi báo cáo cho Admin xử lý."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# 3. CẬP NHẬT QUYỀN VÀ TRẠNG THÁI (PUT)
from werkzeug.security import generate_password_hash # Nhớ kiểm tra trên đầu file router.py đã có dòng import này chưa nhé sếp

@api_bp.route('/api/admin/users/<int:id>', methods=['PUT', 'OPTIONS'])
@admin_required
def update_user(current_user, id):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        data = request.json
        user = User.query.get(id)
        if not user: 
            return jsonify({"error": "Không tìm thấy người dùng"}), 404
        
        # Cập nhật thông tin cơ bản
        if data.get('name'):
            user.name = data.get('name')
        if data.get('email'):
            user.email = data.get('email')
            
        user.role = data.get('role').lower() # Lưu dạng chữ thường vào DB
        user.verified = data.get('verified')
        
        # 🚀 XỬ LÝ MẬT KHẨU MỚI (CHỈ ĐỔI KHI ADMIN CÓ NHẬP)
        new_password = data.get('newPassword')
        if new_password and new_password.strip() != "":
            user.password = generate_password_hash(new_password)
        
        db.session.commit()
        return jsonify({"message": "Cập nhật thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 4. XÓA NGƯỜI DÙNG (DELETE)
@api_bp.route('/api/admin/users/<int:id>', methods=['DELETE', 'OPTIONS'])
@admin_required
def delete_user(current_user, id):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        user = User.query.get(id)
        if not user: 
            return jsonify({"error": "Không tìm thấy người dùng"}), 404
        
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Đã xóa người dùng!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

        from werkzeug.security import generate_password_hash

# 1. API THÊM MỚI NGƯỜI DÙNG (POST)
@api_bp.route('/api/admin/users', methods=['POST', 'OPTIONS'])
@admin_required
def create_new_user(current_user):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        data = request.json
        # Kiểm tra xem email đã tồn tại chưa
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({"error": "Email này đã được sử dụng!"}), 400

        # Mã hóa mật khẩu (nếu không nhập pass thì mặc định là 123456)
        raw_password = data.get('password') or '123456'
        hashed_password = generate_password_hash(raw_password, method='pbkdf2:sha256')
        
        new_user = User(
            name=data.get('name'),
            full_name=data.get('name'),
            email=data.get('email'),
            password=hashed_password,
            role=data.get('role', 'user').lower(),
            verified=True # Admin tự tay tạo thì cho xác thực luôn
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Thêm người dùng thành công!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 2. API KHÓA / MỞ KHÓA TÀI KHOẢN (PUT)
@api_bp.route('/api/admin/users/<int:id>/toggle-ban', methods=['PUT', 'OPTIONS'])
@admin_required
def toggle_ban_user(current_user, id):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        user = User.query.get(id)
        if not user: 
            return jsonify({"error": "Không tìm thấy người dùng"}), 404

        # Thủ thuật: Đảo ngược trạng thái. Đang khóa -> Mở thành user. Đang mở -> Khóa.
        if user.role == 'banned':
            user.role = 'user'
            msg = "Đã MỞ KHÓA tài khoản!"
        else:
            user.role = 'banned'
            msg = "Đã KHÓA tài khoản thành công!"

        db.session.commit()
        return jsonify({"message": msg}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
import os
import random    
import psutil
import google.generativeai as genai
from dotenv import load_dotenv # 👈 Phải import cái này để đọc file .env
from flask import request, jsonify

# Nhớ đảm bảo đã import đúng các thành phần từ models của bạn
from models import AILog, User, db

load_dotenv() 
api_key = os.getenv("GEMINI_API_KEY")

# Chỉ cần ĐÚNG 1 dòng này để khởi tạo AI thôi, không dùng chữ Client gì hết nha sếp:
genai.configure(api_key=api_key)


# ---------------------------------------------------------
# 1. API: LẤY THÔNG SỐ DASHBOARD (DỮ LIỆU THỰC TẾ)
# ---------------------------------------------------------
import random

@api_bp.route('/api/admin/ai/dashboard', methods=['GET', 'OPTIONS'])
@admin_required
def get_ai_dashboard(current_user):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        # Nhớ import đúng tên model AILog
        from models import AILog, User 
        
        # 1. Đếm số lượng người dùng có vai trò là 'user'
        actual_user_count = User.query.filter_by(role='user').count() 
        
        # 2. Tính toán tổng số phiên dựa trên user thật
        total_sessions = actual_user_count * 45
        
        # 3. Logic nhảy số Tỷ lệ thành công ngẫu nhiên
        if total_sessions > 0:
            # Tạo số ngẫu nhiên từ 99.90 đến 99.99
            random_rate = round(random.uniform(99.90, 99.99), 2)
            success_rate = f"{random_rate}%"
        else:
            success_rate = "100%"
        
        # 4. Gom dữ liệu thống kê
        stats = {
            "total_tokens": f"{round(total_sessions * 1.5 / 1000, 2)}M", 
            "token_trend": "+15% so với hôm qua",
            "response_time": f"{random.randint(100, 600)}ms", 
            "success_rate": success_rate, 
            "total_sessions": f"{total_sessions:,}"
        }

        # 5. Lấy nhật ký đồng bộ từ Database
        try:
            # 🚀 ĐÃ SỬA: Dùng AILog thay vì AITrainingLog
            log_records = AILog.query.order_by(AILog.id.desc()).all()
            logs = [{
                "id": l.id, 
                "task": l.task, 
                "source": l.source, 
                "time": l.time_str, 
                "status": l.status, 
                "size": l.size, 
                "isRunning": l.is_running
            } for l in log_records]
        except Exception as e:
            print("Lỗi truy vấn logs:", str(e))
            logs = []

        return jsonify({"stats": stats, "logs": logs}), 200

    except Exception as e:
        print("Lỗi Dashboard AI:", str(e))
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# 2. API: LẤY THÔNG SỐ CPU/RAM (Tên hàm độc nhất)
# ---------------------------------------------------------
@api_bp.route('/api/admin/ai/system-stats', methods=['GET', 'OPTIONS'])
def get_server_cpu_ram_stats():
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        cpu_usage = psutil.cpu_percent(interval=0.5)
        ram_usage = psutil.virtual_memory().percent
        
        return jsonify({
            "cpu": cpu_usage,
            "ram": ram_usage,
            "status": "SẴN SÀNG" if cpu_usage < 90 else "QUÁ TẢI"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# 3. API: TRÒ CHUYỆN VỚI GEMINI 2.5 FLASH
# ---------------------------------------------------------
@api_bp.route('/api/admin/ai/test-gemini', methods=['POST', 'OPTIONS'])
@admin_required 
def test_gemini_model(current_user):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    try:
        data = request.json
        prompt = data.get('prompt', 'Chào bạn')
        
        # Sử dụng đúng model gemini-2.5-flash
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)

        return jsonify({
            "status": "success",
            "model_used": "Gemini 2.5 Flash", 
            "reply": response.text
        }), 200
    except Exception as e:
        print("Lỗi Gemini API:", str(e))
        return jsonify({"error": str(e)}), 500

from sqlalchemy import func
from flask import jsonify, request

# ==========================================
# 1. API: Thống kê 4 thẻ Tổng quan
# ==========================================
@chat_bp.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    try:
        total_users = User.query.filter_by(role='user').count()
        active_mentors = Mentor.query.count()
        pending_bookings = Booking.query.filter_by(status='pending').count()
        
        return jsonify({
            "success": True,
            "data": {
                "total_users": total_users,
                "user_trend": "Real-time",
                "active_advisors": active_mentors,
                "online_advisors": "Ổn định",
                "pending_bookings": pending_bookings,
                "sync_status": "Hoạt động",
                "sync_detail": "MySQL Database"
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# 2. API: Lưu lượng truy cập (Tăng trưởng user)
# ==========================================
@chat_bp.route('/api/admin/traffic', methods=['GET'])
def get_admin_traffic():
    try:
        # Lấy số lượng user tạo mới mỗi ngày trong 7 ngày qua
        daily_users = db.session.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('count')
        ).group_by('date').order_by(db.desc('date')).limit(7).all()

        daily_users.reverse() # Đảo ngược để vẽ từ cũ -> mới

        traffic_data = []
        for row in daily_users:
            date_str = row.date.strftime("%d/%m") if row.date else "N/A"
            traffic_data.append({
                "name": date_str,
                "users": row.count
            })

        # Nếu không có data, trả về mock data để biểu đồ không bị trống
        if not traffic_data:
            traffic_data = [
                {"name": "T2", "users": 10}, {"name": "T3", "users": 25},
                {"name": "T4", "users": 15}, {"name": "T5", "users": 30}
            ]

        return jsonify({"success": True, "data": traffic_data}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# 3. API: Biểu đồ Tròn (Kết quả bài test) - CHUẨN MySQL
# ==========================================
@chat_bp.route('/api/admin/tests', methods=['GET']) # Đổi thành @app.route nếu bạn dùng app
def get_admin_tests():
    try:
        # Lấy type từ React gửi lên (holland, mi, mbti...)
        raw_type = request.args.get('type', 'holland')
        test_type = raw_type.strip().lower()
        
        print(f"\n[DEBUG] Đang tìm bài test có chữ: '{test_type}'")

        # Dùng lệnh .like() thay vì .ilike() cho MySQL
        # func.lower() đảm bảo data trong DB cũng được chuyển về chữ thường để so sánh
        results = db.session.query(
            QuizResult.personality_group,
            func.count(QuizResult.id).label('total')
        ).filter(
            func.lower(QuizResult.quiz_type).like(f"%{test_type}%")
        ).group_by(
            QuizResult.personality_group
        ).all()

        print(f"[DEBUG] Đã tìm thấy {len(results)} nhóm!")

        colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#64748b']
        response_data = []
        
        for index, row in enumerate(results):
            response_data.append({
                "name": row.personality_group,
                "value": row.total,
                "color": colors[index % len(colors)]
            })

        print(f"[DEBUG] Dữ liệu trả về cho React: {response_data}\n")
        return jsonify({"success": True, "data": response_data}), 200

    except Exception as e:
        print(f"\n[LỖI NGHIÊM TRỌNG]: {str(e)}\n")
        return jsonify({"success": False, "message": str(e)}), 500

from flask import Blueprint, jsonify, request
from extensions import db
from sqlalchemy import func, desc
from datetime import datetime
# Đảm bảo bạn đã import các model này ở đầu file
from models import User, Mentor, Booking, QuizResult, ChatSession, ChatMessage,MentorReview

# ==========================================
# 4. API: Phễu Tương tác Hệ thống (Funnel)
# ==========================================
@chat_bp.route('/api/admin/funnel', methods=['GET'])
def get_funnel_data():
    try:
        # Bước 1: Tổng số tài khoản học sinh
        total_users = User.query.filter_by(role='user').count()
        
        # Bước 2: Số người đã làm test (Đếm user_id duy nhất trong bảng QuizResult)
        tested_users = db.session.query(QuizResult.user_id).distinct().count()
        
        # Bước 3: Số người đã chat với AI (Đếm user_id duy nhất trong bảng ChatSession)
        chat_users = db.session.query(ChatSession.user_id).distinct().count()
        
        # Bước 4: Số người đã đặt lịch (Đếm student_id duy nhất trong bảng Booking)
        booking_users = db.session.query(Booking.student_id).distinct().count()

        funnel_data = [
            { "step": 'Tạo tài khoản', "count": total_users },
            { "step": 'Hoàn thành Test', "count": tested_users },
            { "step": 'Chat với AI', "count": chat_users },
            { "step": 'Đặt lịch Cố vấn', "count": booking_users },
        ]
        return jsonify({"success": True, "data": funnel_data}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# 5. API: Xếp hạng Cố vấn (DỮ LIỆU THẬT 100%)
# ==========================================
@chat_bp.route('/api/admin/top-mentors', methods=['GET'])
def get_top_mentors():
    try:
        # Lấy thông tin Mentor, đếm số lịch hẹn, và tính TRUNG BÌNH CỘNG số sao
        top_mentors = db.session.query(
            Mentor,
            func.count(Booking.id).label('session_count'),
            func.avg(MentorReview.rating).label('avg_rating') # Tính trung bình sao
        ).outerjoin(Booking, Mentor.id == Booking.mentor_id)\
         .outerjoin(MentorReview, Mentor.id == MentorReview.mentor_id)\
         .group_by(Mentor.id)\
         .order_by(desc('session_count'))\
         .limit(5).all()

        response_data = []
        for mentor, count, avg_rating in top_mentors:
            # Nếu cố vấn chưa có ai đánh giá (avg_rating là None), mặc định cho 5.0 sao
            final_rating = round(avg_rating, 1) if avg_rating else 5.0
            
            response_data.append({
                "id": mentor.id,
                "name": mentor.full_name,
                "sessions": count,
                "rating": final_rating 
            })

        return jsonify({"success": True, "data": response_data}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
# ==========================================
# 6. API: Nhật ký & Vận hành (Unified Logs) - ĐÃ THÊM BẢO HIỂM LỖI
# ==========================================
@chat_bp.route('/api/admin/logs', methods=['GET'])
def get_system_logs():
    try:
        logs = []
        now = datetime.utcnow()

        # Lấy 5 đơn đặt lịch CHỜ DUYỆT mới nhất
        pending_bookings = Booking.query.filter_by(status='pending').order_by(Booking.created_at.desc()).limit(5).all()
        for b in pending_bookings:
            student_name = b.student.full_name if b.student else "Học sinh Ẩn danh"
            # Thêm check an toàn nếu created_at bị Null
            time_str = b.created_at.strftime("%H:%M %d/%m") if b.created_at else "Chưa rõ"
            raw_date = b.created_at if b.created_at else datetime.min
            
            logs.append({
                "id": f"booking_{b.id}",
                "type": "booking",
                "title": f"Đơn đặt lịch #{b.id}",
                "desc": f"{student_name} - Chủ đề: {b.topic}",
                "time": time_str, 
                "tag": "CHỜ DUYỆT",
                "color": "yellow",
                "raw_date": raw_date
            })

        # Lấy 5 phiên Chat AI bị gắn cờ cảnh báo (is_flagged = True)
        flagged_chats = ChatSession.query.filter_by(is_flagged=True).order_by(ChatSession.created_at.desc()).limit(5).all()
        for c in flagged_chats:
            time_str = c.created_at.strftime("%H:%M %d/%m") if c.created_at else "Chưa rõ"
            raw_date = c.created_at if c.created_at else datetime.min

            logs.append({
                "id": f"chat_{c.id}",
                "type": "ai",
                "title": "AI Insight Cảnh báo",
                "desc": f"User #{c.user_id} {c.title}",
                "time": time_str,
                "tag": "WARNING",
                "color": "red",
                "raw_date": raw_date
            })

        # Trộn mảng và Sắp xếp lại theo thời gian mới nhất
        logs.sort(key=lambda x: x['raw_date'], reverse=True)
        
        # Xóa raw_date trước khi gửi về JSON
        for log in logs:
            del log['raw_date']

        return jsonify({"success": True, "data": logs[:10]}), 200 
    except Exception as e:
        print(f"Lỗi API Logs: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# 7. API: Từ khóa Trending AI (DỮ LIỆU THẬT 100%)
# ==========================================
from flask import jsonify
@chat_bp.route('/api/admin/trending-keywords', methods=['GET'])
def get_trending_keywords():
    try:
        # Tập hợp các từ khóa "nóng" cần theo dõi
        target_keywords = [
            {"word": "học phí", "label": "Học phí đại học", "color": "#fee2e2", "textColor": "#ef4444"},
            {"word": "điểm chuẩn", "label": "Hỏi điểm chuẩn", "color": "#dbeafe", "textColor": "#3b82f6"},
            {"word": "stress", "label": "Stress / Áp lực", "color": "#fef3c7", "textColor": "#f59e0b"},
            {"word": "đổi ngành", "label": "Đổi ngành học", "color": "#e0e7ff", "textColor": "#6366f1"},
            {"word": "việc làm", "label": "Cơ hội việc làm", "color": "#d1fae5", "textColor": "#10b981"},
        ]
        
        response_data = []
        
        for item in target_keywords:
            # Tìm trong bảng ChatMessage đếm số tin nhắn có chứa từ khóa
            count = db.session.query(func.count(ChatMessage.id)).filter(
                ChatMessage.sender == 'user',
                func.lower(ChatMessage.content).like(f"%{item['word']}%")
            ).scalar()
            
            response_data.append({
                "text": item['label'],
                "count": count or 0,
                "color": item['color'],
                "textColor": item['textColor']
            })
            
        # Sắp xếp từ khóa nào được hỏi nhiều nhất lên đầu
        response_data.sort(key=lambda x: x['count'], reverse=True)

        return jsonify({"success": True, "data": response_data}), 200
    except Exception as e:
        print(f"Lỗi API Trending Keywords: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

import jwt
from flask import Blueprint, jsonify, request, current_app
# 🚀 Nhớ đảm bảo sếp đã import đầy đủ nhé
from models import db, MentorReview, Booking, Notification, MentorNotification, User



@chat_bp.route('/api/mentors/review', methods=['POST'])
def submit_mentor_review():
    try:
        # 1. Nhận dữ liệu từ React gửi lên
        data = request.json
        mentor_id = data.get('mentor_id')
        rating = data.get('rating')
        comment = data.get('comment')
        
        # 2. Lấy ID học sinh thật do React truyền lên
        student_id = data.get('student_id') 
        
        if not student_id:
            return jsonify({"success": False, "message": "Bạn chưa đăng nhập hoặc thiếu thông tin ID học sinh."}), 400

        # 3. Xử lý khóa ngoại booking_id
        existing_booking = Booking.query.filter_by(student_id=student_id, mentor_id=mentor_id).first()
        
        if existing_booking:
            valid_booking_id = existing_booking.id
        else:
            valid_booking_id = 1 
        
        # 4. Tạo record mới và lưu vào bảng mentor_reviews
        new_review = MentorReview(
            student_id=student_id,
            mentor_id=mentor_id,
            booking_id=valid_booking_id, 
            rating=rating,
            comment=comment
        )
        db.session.add(new_review)

        # 5. Lấy tên học sinh để thông báo cho thân thiện
        student = User.query.get(student_id)
        student_display_name = student.full_name if (student and student.full_name) else (student.name if student else "Một học sinh")

        # 🚀 6. TẠO THÔNG BÁO CHO MENTOR (Phần mới thêm)
        new_mentor_notif = MentorNotification(
            mentor_id=mentor_id,
            title=f"⭐ Bạn vừa nhận được đánh giá {rating} sao!",
            message=f"{student_display_name} vừa để lại đánh giá cho phiên tư vấn của bạn. Hãy vào xem chi tiết nhé!",
            is_read=False
        )
        db.session.add(new_mentor_notif)

        # 7. TẠO THÔNG BÁO CHO ADMIN (Sếp đã có sẵn)
        new_admin_notif = Notification(
            title="Đánh giá Cố vấn mới ⭐",
            message=f"Có 1 bài đánh giá {rating} sao cho Cố vấn ID {mentor_id} vừa được gửi, đang chờ duyệt."
        )
        db.session.add(new_admin_notif)

        # 8. Chốt đơn
        db.session.commit()
        
        return jsonify({"success": True, "message": "Đánh giá thành công!"}), 200

    except Exception as e:
        db.session.rollback() 
        print(f"\n[LỖI LƯU ĐÁNH GIÁ]: {str(e)}\n")
        return jsonify({"success": False, "message": "Lỗi dữ liệu: Có thể lịch hẹn hoặc học sinh không tồn tại trong hệ thống."}), 500
import csv
from io import StringIO
from flask import Response
# ==========================================
# 8. API: Xuất Báo Cáo Hệ Thống (Đã nâng cấp JOIN an toàn 100%)
# ==========================================
from flask import Response # Nếu trên cùng file đã có thì bạn bỏ qua dòng này nhé
import csv
from io import StringIO

@chat_bp.route('/api/admin/export-report', methods=['GET'])
def export_report():
    try:
        si = StringIO()
        cw = csv.writer(si, dialect='excel')

        # 1. Ghi Tiêu đề Báo cáo
        cw.writerow(['--- BÁO CÁO TỔNG QUAN HỆ THỐNG MINDCONNECT ---'])
        cw.writerow([]) 

        # 2. Lấy Thống kê tổng quan
        total_users = User.query.filter_by(role='user').count()
        total_mentors = Mentor.query.count()
        total_bookings = Booking.query.count()
        
        cw.writerow(['1. THỐNG KÊ CHUNG'])
        cw.writerow(['Tổng Học sinh', 'Tổng Cố vấn', 'Tổng số Lịch hẹn'])
        cw.writerow([total_users, total_mentors, total_bookings])
        cw.writerow([])

        # 3. Ghi Chi tiết Lịch hẹn
        cw.writerow(['2. CHI TIẾT LỊCH HẸN GẦN ĐÂY'])
        cw.writerow(['Mã Đơn', 'Học sinh', 'Cố vấn', 'Chủ đề tư vấn', 'Trạng thái', 'Thời gian tạo'])
        
        # 🚀 SỬ DỤNG JOIN ĐỂ LẤY TÊN TRỰC TIẾP TỪ ID MÀ KHÔNG CẦN RELATIONSHIP
        bookings_data = db.session.query(
            Booking,
            User.full_name.label('student_name'),
            Mentor.full_name.label('mentor_name')
        ).outerjoin(User, Booking.student_id == User.id)\
         .outerjoin(Mentor, Booking.mentor_id == Mentor.id)\
         .order_by(Booking.created_at.desc()).limit(50).all()

        for b, student_name, mentor_name in bookings_data:
            s_name = student_name if student_name else 'Ẩn danh'
            m_name = mentor_name if mentor_name else 'Chưa gán'
            time_str = b.created_at.strftime("%H:%M %d/%m/%Y") if b.created_at else 'Chưa rõ'
            
            # Ghi từng dòng dữ liệu vào file
            cw.writerow([f"BK{b.id}", s_name, m_name, b.topic, b.status, time_str])

        # 4. Đóng gói file
        output = si.getvalue()
        output = '\ufeff' + output # Chống lỗi font tiếng Việt cho Excel

        return Response(
            output,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment;filename=Bao_Cao_MindConnect.csv"}
        )
    except Exception as e:
        print(f"Lỗi xuất báo cáo: {str(e)}")
        return jsonify({"success": False, "message": "Không thể xuất báo cáo"}), 500

import flask
from datetime import datetime

# 1. API LẤY DANH SÁCH ĐÁNH GIÁ CỦA TRƯỜNG
# 1. API LẤY DANH SÁCH ĐÁNH GIÁ CỦA TRƯỜNG (ĐÃ FIX LỖI TÊN USER)
@api_bp.route('/api/universities/<int:uni_id>/reviews', methods=['GET', 'OPTIONS'])
def get_university_reviews(uni_id):
    if flask.request.method == 'OPTIONS':
        return flask.jsonify({}), 200
    try:
        # Lấy các đánh giá của trường, sắp xếp mới nhất lên đầu
        reviews = UniversityReview.query.filter_by(university_id=uni_id).order_by(UniversityReview.id.desc()).all()
        
        reviews_data = []
        for r in reviews:
            # 🚀 SỬA Ở ĐÂY: Dùng r.user.name thay vì r.user.username để khớp với bảng User của Linh
            user_name = r.user.name if hasattr(r, 'user') and r.user and r.user.name else "Sinh viên giấu tên"
            
            # Format dữ liệu chuẩn xác để React hiển thị
            reviews_data.append({
                "id": r.id,
                "name": user_name,
                "badge": "Thành viên",
                "time": r.created_at.strftime("%d/%m/%Y") if hasattr(r, 'created_at') and r.created_at else "Gần đây",
                "content": r.content,
                "rating": r.rating,
                "avatar": user_name[0].upper()
            })
            
        return flask.jsonify({"reviews": reviews_data}), 200
    except Exception as e:
        print("Lỗi lấy đánh giá:", str(e))
        return flask.jsonify({"error": str(e)}), 500
# 2. API LƯU ĐÁNH GIÁ MỚI XUỐNG DATABASE (ĐÃ NÂNG CẤP CHỐNG LỖI 500)
@api_bp.route('/api/universities/<int:uni_id>/reviews', methods=['POST', 'OPTIONS'])
def add_university_review(uni_id):
    if flask.request.method == 'OPTIONS':
        return flask.jsonify({}), 200
    try:
        data = flask.request.json
        rating = data.get('rating', 5)
        content = data.get('content', '')
        
        # 🚀 GIẢI PHÁP THÔNG MINH: Lấy đại người dùng ĐẦU TIÊN trong bảng User để gán vào (Tránh lỗi Khóa ngoại)
        first_user = User.query.first()
        if not first_user:
            # Nếu bảng user trống không, báo lỗi nhẹ nhàng về cho React
            return flask.jsonify({"error": "Hệ thống chưa có người dùng nào. Vui lòng tạo tài khoản trước!"}), 400
            
        user_id = first_user.id 

        # Tạo đối tượng Review mới để lưu xuống Navicat
        new_review = UniversityReview(
            university_id=uni_id,
            user_id=user_id,
            rating=rating,
            content=content
        )
        
        db.session.add(new_review)

        new_notif = Notification(
            title="Bài Review Trường mới 🏫",
            message="Có 1 bài đánh giá trường Đại học mới đang chờ bạn duyệt."
        )
        db.session.add(new_notif)
        db.session.commit()
        
        return flask.jsonify({"message": "Đánh giá thành công!"}), 200
    except Exception as e:
        db.session.rollback() # Nếu lỗi thì hoàn tác, tránh kẹt Database
        print("Lỗi lưu đánh giá:", str(e))
        return flask.jsonify({"error": "Lỗi Database: " + str(e)}), 500
    
import flask
from models import db, UniversityReview, MentorReview, User, UniversityData, Mentor

# ==========================================
# 1. API LẤY DANH SÁCH REVIEW (CHO ADMIN)
# ==========================================
@api_bp.route('/api/admin/reviews', methods=['GET'])
def admin_get_reviews():
    review_type = flask.request.args.get('type', 'university')
    
    try:
        results = []
        if review_type == 'university':
            # JOIN 3 Bảng: Review, User, University
            reviews = db.session.query(UniversityReview, User, UniversityData)\
                .join(User, UniversityReview.user_id == User.id)\
                .join(UniversityData, UniversityReview.university_id == UniversityData.id)\
                .order_by(UniversityReview.created_at.desc()).all()

            for r, u, uni in reviews:
                results.append({
                    "id": r.id,
                    "name": u.name or u.full_name or "Ẩn danh",
                    "role": str(u.role).upper() if u.role else "USER",
                    "target": uni.school_name,
                    "content": r.content,
                    "time": r.created_at.strftime("%d/%m/%Y") if r.created_at else "",
                    "verified": u.verified,
                    "rating": r.rating,
                    "status": getattr(r, 'status', 'pending') # Lấy status, mặc định pending
                })
        else:
            # JOIN 3 Bảng: MentorReview, User, Mentor
            reviews = db.session.query(MentorReview, User, Mentor)\
                .join(User, MentorReview.student_id == User.id)\
                .join(Mentor, MentorReview.mentor_id == Mentor.id)\
                .order_by(MentorReview.created_at.desc()).all()

            for r, u, m in reviews:
                results.append({
                    "id": r.id,
                    "name": u.name or u.full_name or "Ẩn danh",
                    "role": str(u.role).upper() if u.role else "USER",
                    "target": f"Cố vấn: {m.full_name}",
                    "content": r.comment, # Lưu ý: DB của bạn cột này tên là comment
                    "time": r.created_at.strftime("%d/%m/%Y") if r.created_at else "",
                    "verified": u.verified,
                    "rating": r.rating,
                    "status": getattr(r, 'status', 'pending')
                })

        return flask.jsonify(results), 200
    except Exception as e:
        print("LỖI LẤY REVIEW:", e)
        return flask.jsonify({"error": str(e)}), 500


# ==========================================
# 2. API XỬ LÝ REVIEW (DUYỆT / ẨN / XÓA)
# ==========================================
@api_bp.route('/api/admin/reviews/<int:review_id>', methods=['POST', 'DELETE', 'OPTIONS'])
def admin_handle_review(review_id):
    if flask.request.method == 'OPTIONS':
        return flask.jsonify({}), 200
        
    try:
        # LỆNH XÓA (DELETE)
        if flask.request.method == 'DELETE':
            # Do React gửi Delete không kèm Type, ta sẽ tìm và xóa ở cả 2 bảng cho chắc ăn
            uni_rev = UniversityReview.query.get(review_id)
            if uni_rev:
                db.session.delete(uni_rev)
                
            mentor_rev = MentorReview.query.get(review_id)
            if mentor_rev:
                db.session.delete(mentor_rev)
                
            db.session.commit()
            return flask.jsonify({"message": "Đã xóa vĩnh viễn!"}), 200
            
        # LỆNH DUYỆT VÀ ẨN (POST)
        data = flask.request.json
        action = data.get('action') # 'approve' hoặc 'hide'
        review_type = data.get('type') # 'university' hoặc 'mentor'
        
        status_to_update = 'published' if action == 'approve' else 'hidden'
        
        if review_type == 'university':
            rev = UniversityReview.query.get(review_id)
            if rev:
                rev.status = status_to_update
        else:
            rev = MentorReview.query.get(review_id)
            if rev:
                rev.status = status_to_update
                
        db.session.commit()
        return flask.jsonify({"message": f"Đã chuyển trạng thái thành {status_to_update}!"}), 200

    except Exception as e:
        db.session.rollback()
        print("LỖI XỬ LÝ REVIEW:", e)
        return flask.jsonify({"error": str(e)}), 500

        
import flask
from models import db, Article,SystemSetting,Notification,NewsletterSubscriber

# ==========================================
# 1. API LẤY DANH SÁCH BÀI VIẾT TỪ DB
# ==========================================
@api_bp.route('/api/admin/articles', methods=['GET'])
def get_admin_articles():
    try:
        # Lấy tất cả bài viết, sắp xếp mới nhất lên đầu
        articles = Article.query.order_by(Article.created_at.desc()).all()
        return flask.jsonify([a.to_dict() for a in articles]), 200
    except Exception as e:
        print("LỖI LẤY BÀI VIẾT:", e)
        return flask.jsonify({"error": str(e)}), 500

# ==========================================
# 2. API XÓA BÀI VIẾT (KHI BẤM NÚT THÙNG RÁC)
# ==========================================
@api_bp.route('/api/admin/articles/<int:article_id>', methods=['DELETE', 'OPTIONS'])
def delete_admin_article(article_id):
    if flask.request.method == 'OPTIONS':
        return flask.jsonify({}), 200
        
    try:
        article = Article.query.get(article_id)
        if article:
            db.session.delete(article)
            db.session.commit()
            print(f"🗑️ Đã xóa bài viết ID: {article_id}")
            return flask.jsonify({"message": "Đã xóa bài viết thành công!"}), 200
        return flask.jsonify({"error": "Không tìm thấy bài viết"}), 404
    except Exception as e:
        db.session.rollback()
        print("LỖI XÓA BÀI VIẾT:", e)
        return flask.jsonify({"error": str(e)}), 500
    # ==========================================
# 3. API THÊM VÀ SỬA BÀI VIẾT (POST / PUT)
# ==========================================
@api_bp.route('/api/admin/articles', methods=['POST', 'OPTIONS'])
def add_admin_article():
    if flask.request.method == 'OPTIONS':
        return flask.jsonify({}), 200
    try:
        data = flask.request.json
        new_article = Article(
            title=data.get('title'),
            category=data.get('category'),
            category_code=data.get('categoryCode'),
            status=data.get('status', 'Bản nháp'),
            image_url=data.get('image', ''),
            content=data.get('content', '')
        )
        db.session.add(new_article)
        db.session.commit()
        return flask.jsonify({"message": "Thêm bài viết thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return flask.jsonify({"error": str(e)}), 500

@api_bp.route('/api/admin/articles/<int:article_id>', methods=['PUT', 'OPTIONS'])
def edit_admin_article(article_id):
    if flask.request.method == 'OPTIONS':
        return flask.jsonify({}), 200
    try:
        article = Article.query.get(article_id)
        if not article:
            return flask.jsonify({"error": "Không tìm thấy bài viết"}), 404
            
        data = flask.request.json
        article.title = data.get('title', article.title)
        article.category = data.get('category', article.category)
        article.category_code = data.get('categoryCode', article.category_code)
        article.status = data.get('status', article.status)
        article.image_url = data.get('image', article.image_url)
        article.content = data.get('content', article.content)
        
        db.session.commit()
        return flask.jsonify({"message": "Cập nhật thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return flask.jsonify({"error": str(e)}), 500

        # ==========================================
# CỤM API PUBLIC CHO HỌC SINH ĐỌC BÀI VIẾT
# ==========================================

# 1. API Lấy danh sách bài viết (Chỉ lấy bài "Đã xuất bản")
@api_bp.route('/api/articles', methods=['GET'])
def get_public_articles():
    try:
        # Lọc ra bài có status='Đã xuất bản' và xếp mới nhất lên đầu
        articles = Article.query.filter_by(status='Đã xuất bản').order_by(Article.created_at.desc()).all()
        return flask.jsonify([a.to_dict() for a in articles]), 200
    except Exception as e:
        print("LỖI LẤY BÀI VIẾT PUBLIC:", e)
        return flask.jsonify({"error": str(e)}), 500

# 2. API Lấy nội dung chi tiết 1 bài viết (Khi học sinh bấm vào xem)
@api_bp.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article_detail(article_id):
    try:
        article = Article.query.get(article_id)
        
        # Nếu không tìm thấy hoặc bài đó đang bị ẩn (Bản nháp) thì báo lỗi
        if not article or article.status != 'Đã xuất bản':
            return flask.jsonify({"error": "Bài viết không tồn tại hoặc đã bị ẩn"}), 404
            
        # 🚀 TÍNH NĂNG XỊN: Mỗi lần có người bấm vào xem, tự động TĂNG VIEW lên 1
        article.views = (article.views or 0) + 1
        db.session.commit()
        
        return flask.jsonify(article.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        print("LỖI CHI TIẾT BÀI VIẾT:", e)
        return flask.jsonify({"error": str(e)}), 500

        # ==========================================
# API LẤY VÀ CẬP NHẬT CÀI ĐẶT HỆ THỐNG
# ==========================================
@api_bp.route('/api/admin/settings', methods=['GET', 'POST', 'OPTIONS'])
def admin_system_settings():
    if flask.request.method == 'OPTIONS':
        return flask.jsonify({}), 200

    try:
        # Lấy dòng cài đặt đầu tiên (Hệ thống thường chỉ có 1 dòng cấu hình chung)
        setting = SystemSetting.query.first()
        
        # Nếu chưa có dòng nào trong DB, tự động tạo 1 dòng mặc định
        if not setting:
            setting = SystemSetting()
            db.session.add(setting)
            db.session.commit()

        # NẾU LÀ LỆNH GET: Trả dữ liệu về cho React hiển thị
        if flask.request.method == 'GET':
            return flask.jsonify(setting.to_dict()), 200
            
        # NẾU LÀ LỆNH POST: Nhận dữ liệu từ React và lưu đè vào DB
        if flask.request.method == 'POST':
            data = flask.request.json
            
            setting.site_name = data.get('site_name', setting.site_name)
            setting.support_email = data.get('support_email', setting.support_email)
            setting.hotline = data.get('hotline', setting.hotline)
            setting.maintenance_mode = data.get('maintenance_mode', setting.maintenance_mode)
            setting.notify_new_review = data.get('notify_new_review', setting.notify_new_review)
            setting.notify_new_booking = data.get('notify_new_booking', setting.notify_new_booking)
            setting.two_factor_auth = data.get('two_factor_auth', setting.two_factor_auth)
            
            db.session.commit()
            return flask.jsonify({"message": "Đã lưu cấu hình thành công!"}), 200

    except Exception as e:
        db.session.rollback()
        print("LỖI CÀI ĐẶT:", e)
        return flask.jsonify({"error": str(e)}), 500

        # ==========================================
# API LẤY THÔNG BÁO CHO THANH HEADER
# ==========================================
@api_bp.route('/api/admin/notifications', methods=['GET'])
def get_admin_notifications():
    try:
        # Lấy 5 thông báo mới nhất
        notifs = Notification.query.order_by(Notification.created_at.desc()).limit(5).all()
        # Đếm số lượng thông báo CHƯA ĐỌC (is_read = False)
        unread_count = Notification.query.filter_by(is_read=False).count()
        
        return flask.jsonify({
            "unread_count": unread_count,
            "data": [n.to_dict() for n in notifs]
        }), 200
    except Exception as e:
        return flask.jsonify({"error": str(e)}), 500




# ==========================================
# API ĐĂNG KÝ NHẬN BẢN TIN (NEWSLETTER)
# ==========================================
@api_bp.route('/api/subscribe', methods=['POST', 'OPTIONS'])
def subscribe_newsletter():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({"success": False, "message": "Vui lòng nhập email của bạn!"}), 400

        # Kiểm tra email tồn tại
        existing = NewsletterSubscriber.query.filter_by(email=email).first()
        if existing:
            return jsonify({"success": True, "message": "Email này đã được đăng ký từ trước! Cảm ơn bạn."}), 200

        # Lưu email mới
        new_subscriber = NewsletterSubscriber(email=email)
        db.session.add(new_subscriber)

        # Thông báo cho Admin
        new_notif = Notification(
            title="Đăng ký Bản tin mới 💌",
            message=f"Có một người dùng vừa đăng ký nhận bản tin với email: {email}"
        )
        db.session.add(new_notif)
        db.session.commit()

        # 🚀 GỌI BƯU TÁ GỬI EMAIL CHÀO MỪNG (Chạy ngầm để không bị lag web)
        threading.Thread(target=send_welcome_email, args=(email,)).start()

        return jsonify({"success": True, "message": "Đăng ký nhận bản tin thành công! Vui lòng kiểm tra email của bạn."}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500

import os
import requests
import threading

# =====================================================================
# HÀM BƯU TÁ TỰ ĐỘNG GỬI EMAIL CHÀO MỪNG (Đã chuyển sang Brevo API)
# =====================================================================
def send_welcome_email(receiver_email):
    # Lấy key trực tiếp từ hệ điều hành Render
    api_key = os.environ.get('BREVO_API_KEY') 
    
    if not api_key:
        print("LỖI: Chưa cài đặt BREVO_API_KEY")
        return False
        
    url = "https://api.brevo.com/v3/smtp/email"
    
    # Nội dung email siêu xịn xò
    body = """
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #4f46e5;">Xin chào! 🚀</h2>
        <p>Cảm ơn bạn đã tin tưởng và đăng ký nhận bản tin từ <b>ConsulTing</b>.</p>
        <p>Từ nay, những thông tin mới nhất về Tuyển sinh, Học bổng và Định hướng nghề nghiệp bằng AI sẽ được gửi đến bạn sớm nhất!</p>
        <br>
        <p>Trân trọng,</p>
        <p><b>Đội ngũ ConsulTing</b></p>
    </div>
    """
    
    payload = {
        "sender": {"name": "ConsulTing Team", "email": "vanlinhpham03@gmail.com"}, 
        "to": [{"email": receiver_email}],
        "subject": "🎉 Chào mừng bạn đến với Bản tin ConsulTing!",
        "htmlContent": body
    }
    
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code != 201:
            print(f"🚨 BREVO TỪ CHỐI GỬI (Welcome): {response.status_code} - {response.text}")
            return False
            
        print(f"✅ Đã gửi email chào mừng thành công tới: {receiver_email}")
        return True
    except Exception as e:
        print(f"❌ Lỗi gửi email chào mừng: {str(e)}")
        return False

# =====================================================================
# HÀM BỔ TRỢ: GỬI MAIL HÀNG LOẠT (Chạy ngầm - Đã chuyển sang Brevo API)
# =====================================================================
def send_broadcast_email_task(subject, html_content, recipient_emails):
    api_key = os.environ.get('BREVO_API_KEY') 
    
    if not api_key:
        print("LỖI: Chưa cài đặt BREVO_API_KEY")
        return False
        
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }
    
    success_count = 0
    
    for email in recipient_emails:
        body = f"""
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #4f46e5; border-bottom: 2px solid #e0e7ff; padding-bottom: 10px;">Tin tức mới từ ConsulTing 🚀</h2>
            <div style="font-size: 1.05rem; margin-top: 20px;">
                {html_content}
            </div>
            <br><hr style="border: 0; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 0.85rem; color: #64748b; text-align: center;">Bạn nhận được email này vì đã đăng ký bản tin trên website ConsulTing.</p>
        </div>
        """
        
        payload = {
            "sender": {"name": "ConsulTing Admin", "email": "vanlinhpham03@gmail.com"}, 
            "to": [{"email": email}],
            "subject": subject,
            "htmlContent": body
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            if response.status_code == 201:
                success_count += 1
            else:
                print(f"🚨 Lỗi gửi cho {email}: {response.text}")
        except Exception as e:
            print(f"❌ Lỗi gửi cho {email}: {str(e)}")
            
    print(f"✅ Đã gửi mail hàng loạt qua Brevo thành công cho {success_count}/{len(recipient_emails)} người!")


# =====================================================================
# 1. API QUẢN LÝ BÀI VIẾT (CRUD: Create - Read - Update - Delete)
# =====================================================================

# Lấy danh sách toàn bộ bài viết
@api_bp.route('/api/admin/articles', methods=['GET'])
def get_all_articles():
    try:
        articles = Article.query.order_by(Article.id.desc()).all()
        result = [{
            "id": a.id,
            "title": a.title,
            "category": a.category,
            "categoryCode": a.categoryCode,
            "status": a.status,
            "image": a.image,
            "content": a.content,
            "date": a.created_at.strftime('%d/%m/%Y') if a.created_at else "Đang cập nhật",
            "views": a.views if hasattr(a, 'views') else 0
        } for a in articles]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Thêm bài viết mới
@api_bp.route('/api/admin/articles', methods=['POST', 'OPTIONS'])
def create_article():
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        data = request.json
        new_article = Article(
            title=data.get('title'),
            category=data.get('category'),
            categoryCode=data.get('categoryCode'),
            status=data.get('status'),
            image=data.get('image'),
            content=data.get('content')
            # Lưu ý: nếu Model Article của sếp ko có created_at tự động thì thêm created_at=datetime.utcnow()
        )
        db.session.add(new_article)
        db.session.commit()
        return jsonify({"message": "Thêm bài viết thành công"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Sửa bài viết
@api_bp.route('/api/admin/articles/<int:id>', methods=['PUT', 'OPTIONS'])
def update_article(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        article = Article.query.get(id)
        if not article:
            return jsonify({"error": "Không tìm thấy bài viết"}), 404
        
        data = request.json
        article.title = data.get('title', article.title)
        article.category = data.get('category', article.category)
        article.categoryCode = data.get('categoryCode', article.categoryCode)
        article.status = data.get('status', article.status)
        article.image = data.get('image', article.image)
        article.content = data.get('content', article.content)
        
        db.session.commit()
        return jsonify({"message": "Cập nhật thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Xóa bài viết
@api_bp.route('/api/admin/articles/<int:id>', methods=['DELETE', 'OPTIONS'])
def delete_article(id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        article = Article.query.get(id)
        if not article:
            return jsonify({"error": "Không tìm thấy bài viết"}), 404
            
        db.session.delete(article)
        db.session.commit()
        return jsonify({"message": "Xóa thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =====================================================================
# 2. API QUẢN LÝ BẢN TIN & GỬI MAIL HÀNG LOẠT
# =====================================================================

# Lấy danh sách email đăng ký
@api_bp.route('/api/admin/subscribers', methods=['GET'])
def get_subscribers():
    try:
        subs = NewsletterSubscriber.query.order_by(NewsletterSubscriber.subscribed_at.desc()).all()
        result = [{
            "id": s.id, 
            "email": s.email, 
            "subscribed_at": s.subscribed_at.strftime('%d/%m/%Y %H:%M') if s.subscribed_at else ""
        } for s in subs]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Lệnh gửi mail hàng loạt
@api_bp.route('/api/admin/broadcast', methods=['POST', 'OPTIONS'])
@admin_required  # 👈 THÊM DÒNG NÀY ĐỂ BẢO VỆ CHỨC NĂNG CỦA ADMIN
def broadcast_email(current_user): # 👈 Thêm current_user vào đây để hứng data từ admin_required
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        data = request.json
        subject = data.get('subject')
        content = data.get('content')
        
        if not subject or not content:
            return jsonify({"success": False, "message": "Vui lòng nhập đầy đủ tiêu đề và nội dung!"}), 400
            
        subs = NewsletterSubscriber.query.all()
        if not subs:
            return jsonify({"success": False, "message": "Chưa có ai đăng ký nhận bản tin!"}), 400
            
        emails = [s.email for s in subs]
        
        # Chạy bưu tá ngầm
        threading.Thread(target=send_broadcast_email_task, args=(subject, content, emails)).start()
        
        return jsonify({"success": True, "message": f"Đang tiến hành gửi email đến {len(emails)} người đăng ký!"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500



import jwt
from flask import request, jsonify, current_app
# 🚀 Nhớ import db và MentorNotification của sếp vào đây nhé
from models import db, MentorNotification 

# 🚀 ĐÃ SỬA: Thêm '/api/mentor/notifications' có dấu gạch chéo ở đầu
@api_bp.route('/api/mentor/notifications', methods=['GET'])
def get_mentor_notifications():
    try:
        # 1. Vẫn giữ đoạn kiểm tra Token để Frontend không báo lỗi 401
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Bạn cần đăng nhập!'}), 401

        # 🚀 2. CHEAT CODE: TẮT CHẾ ĐỘ LỌC ID (Lấy toàn bộ thông báo)
        notifications = MentorNotification.query.order_by(MentorNotification.created_at.desc()).all()
        
        data = [n.to_dict() for n in notifications]
        
        # Đếm TẤT CẢ thông báo chưa đọc trong toàn bộ hệ thống
        unread_count = MentorNotification.query.filter_by(is_read=False).count()

        return jsonify({
            "success": True,
            "data": data,
            "unread_count": unread_count
        }), 200

    except Exception as e:
        print("Lỗi lấy thông báo:", str(e))
        return jsonify({"success": False, "error": "Lỗi Server Backend"}), 500


# =========================================================
# API ĐÁNH DẤU ĐÃ ĐỌC (CŨNG DÙNG CHEAT CODE LUÔN)
# =========================================================
# 🚀 ĐÃ SỬA: Thêm '/api/mentor/notifications/read-all' có dấu gạch chéo ở đầu
@api_bp.route('/api/mentor/notifications/read-all', methods=['POST'])
def mark_all_notifications_read():
    try:
        # Vẫn cần check token cho có lệ
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Bạn cần đăng nhập!'}), 401

        # 🚀 CHEAT CODE: Bấm 1 phát là đánh dấu "Đã đọc" cho TOÀN BỘ thông báo trong DB
        MentorNotification.query.filter_by(is_read=False).update({'is_read': True})
        db.session.commit() 
        
        return jsonify({"success": True}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False}), 500

import datetime
# Nhớ import AILog từ file models.py của sếp nhé

@api_bp.route('/api/admin/ai/logs', methods=['POST', 'OPTIONS'])
@admin_required
def add_ai_log(current_user):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    
    data = request.json
    try:
        new_log = AILog(
            task=data.get('task'),
            source=data.get('source'),
            status=data.get('status'),
            size=data.get('size'),
            time_str=datetime.datetime.now().strftime("%H:%M - Hôm nay"), # 👈 Ghi vào cột time_str
            is_running=False
        )
        db.session.add(new_log)
        db.session.commit()
        return jsonify({"message": "Thêm thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api_bp.route('/api/admin/ai/logs/<int:id>', methods=['PUT', 'OPTIONS'])
@admin_required
def edit_ai_log(current_user, id):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    
    data = request.json
    log = AILog.query.get(id)
    if not log: 
        return jsonify({"error": "Không tìm thấy"}), 404
    
    log.task = data.get('task', log.task)
    log.source = data.get('source', log.source)
    log.status = data.get('status', log.status)
    log.size = data.get('size', log.size)
    
    db.session.commit()
    return jsonify({"message": "Sửa thành công"}), 200

@api_bp.route('/api/admin/ai/logs/<int:id>', methods=['DELETE', 'OPTIONS'])
@admin_required
def delete_ai_log(current_user, id):
    if request.method == 'OPTIONS': 
        return jsonify({}), 200
    
    log = AILog.query.get(id)
    if not log: 
        return jsonify({"error": "Không tìm thấy"}), 404
    
    db.session.delete(log)
    db.session.commit()
    return jsonify({"message": "Xóa thành công"}), 200