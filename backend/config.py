import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super_secret_key_123')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Cấu hình Mail
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', 'vanlinhpham03@gmail.com')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', 'bjoacjczvutbokym') # Nên đổi mật khẩu này hoặc dùng .env