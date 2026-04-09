from flask import Flask
from config import Config
from extensions import db, mail, cors
from router import api_bp, chat_bp # <--- Chú ý: Phải import thêm chat_bp ở đây
from flask_cors import CORS

def create_app():
    # 1. Phải khởi tạo app trước tiên
    app = Flask(__name__)
    app.config.from_object(Config)

    # 2. Mở cửa CORS để React (cổng 3000) có thể gọi vào
    CORS(app, resources={r"/*": {"origins": "*"}})

    # 3. Khởi tạo các extensions khác
    db.init_app(app)
    mail.init_app(app)

    # 4. Đăng ký các routes từ file router.py
    app.register_blueprint(api_bp)
    app.register_blueprint(chat_bp) # <--- Đăng ký tuyến đường cho Chatbot hoạt động!

    # 5. Tự động tạo bảng nếu database chưa có
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    print("🚀 Đang khởi động Server Flask ở cổng 8000...")
    app = create_app()
    app.run(port=8000, debug=True)