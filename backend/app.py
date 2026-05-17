import os # 🚀 Nhớ import thêm cái này để lấy Port của Render
from flask import Flask
from config import Config
from extensions import db, mail, cors
from router import api_bp, chat_bp 
from flask_cors import CORS

def create_app():
    # 1. Phải khởi tạo app trước tiên
    app = Flask(__name__)
    app.config.from_object(Config)

    # 🚀 2. SỬA CORS: Mở cửa cho TẤT CẢ các tên miền (Bao gồm cả Vercel sau này)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # 3. Khởi tạo các extensions khác
    db.init_app(app)
    mail.init_app(app)

    # 4. Đăng ký các routes từ file router.py
    app.register_blueprint(api_bp)
    app.register_blueprint(chat_bp)

    # 5. Tự động tạo bảng nếu database chưa có
    with app.app_context():
        db.create_all()

    return app

# 🚀 6. SỬA QUAN TRỌNG NHẤT: Bắt buộc phải đưa biến app ra ngoài này 
# để máy chủ Render (Gunicorn) có thể nhìn thấy và khởi động được!
app = create_app()

if __name__ == '__main__':
    print("🚀 Đang khởi động Server Flask...")
    # 🚀 7. Đổi host thành 0.0.0.0 để server mạng nhận được tín hiệu
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)