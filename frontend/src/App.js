// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2'; // 🚀 IMPORT VŨ KHÍ SWEETALERT2
import { mockUniversities } from './utils/data';

// Import các component dùng chung
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// Import Pages Public & User
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import Chatbot from './components/Chatbot/Chatbot'; 
import Quiz from './pages/Quiz/Quiz';
import UniversityDetail from './pages/UniversityDetail/UniversityDetail';
import Profile from './pages/Profile/Profile';
import Login from './pages/Auth/login'; // Giữ nguyên theo đường dẫn của bạn
import Register from './pages/Auth/Register';
import ForgotPassWord from './pages/Auth/ForgotPassWord';
import ChangePassWord from './pages/Auth/ChangePassWord';
import Compare from './pages/Compare/Compare';
import Favorites from './pages/Favorites/Favorites'; 
import AiSuggestion from './pages/AiSuggestion/AiSuggestion'; 
import Contact from './pages/Contact/Contact';
import About from './pages/About/About';
import Scholarship from './pages/Scholarship/Scholarship'; 
import Guide from './pages/Guide/Guide'; 
import Privacy from './pages/Privacy/Privacy'; 
import ProfileForm from './pages/ProfileForm/ProfileForm'; 
import Booking from './pages/Home/Booking';
import Mentors from './pages/Home/Mentors';
import RoiCalculator from './pages/Home/RoiCalculator';
import Orientation from './pages/Home/Orientation/Orientation';
import BookingHistory from './pages/Home/BookingHistory';
import ArticleDetail from './pages/Home/ArticleDetail';

// Import các trang Admin
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdmissionManagement from './pages/Admin/AdmissionManagement';
import AISystemManagement from './pages/Admin/AISystemManagement';
import ConsultationHistory from './pages/Admin/ConsultationHistory';
import ContentManagement from './pages/Admin/ContentManagement';
import ExamBlockManagement from './pages/Admin/ExamBlockManagement';
import UniversityManagement from './pages/Admin/UniversityManagement';
import UserManagement from './pages/Admin/UserManagement';
import BookingManagement from './pages/Admin/BookingManagement';
import MentorManagement from './pages/Admin/MentorManagement';
import AdminContent from './pages/Admin/AdminContent';
import AdminSettings from './pages/Admin/AdminSettings';

// Import các trang Mentor (Đã chuyển sang thư mục Mentor)
import MentorLayout from './pages/Mentor/MentorLayout';
import MentorSchedule from './pages/Mentor/MentorSchedule';

// =========================================================
// 🚀 GHI ĐÈ HÀM ALERT MẶC ĐỊNH CỦA TRÌNH DUYỆT TỚI TOÀN DỰ ÁN
// =========================================================
window.alert = (message) => {
  Swal.fire({
    title: 'Thông báo',
    text: message,
    icon: 'info',
    confirmButtonColor: '#4f46e5', // Màu xanh tím chủ đạo
    confirmButtonText: 'Đã hiểu',
    borderRadius: '16px'
  });
};

// =========================================================
// 1. HÀM PHÂN QUYỀN (CHẶN NGƯỜI DÙNG VÀO SAI TRANG)
// =========================================================
const ProtectedRoute = ({ allowedRoles, children }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const userRole = user ? user.role : 'guest'; // Nếu chưa đăng nhập thì là 'guest'

  // Nếu Role hiện tại không nằm trong danh sách được phép vào trang này
  if (!allowedRoles.includes(userRole)) {
    if (userRole === 'guest') {
      return <Navigate to="/login" replace />; // Khách bị đẩy ra trang đăng nhập
    }
    return <Navigate to="/" replace />; // Đã đăng nhập nhưng đi sai phận sự thì về Trang chủ
  }

  return children;
};

// =========================================================
// 2. COMPONENT NỘI DUNG (XỬ LÝ ẨN/HIỆN HEADER & FOOTER)
// =========================================================
const AppContent = () => {
  const location = useLocation();
  
  // Phát hiện xem URL có bắt đầu bằng /admin hoặc /mentor hay không
  const isDashboardRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/mentor');

  return (
    <div className="app-container"> 
      {/* 🚀 CHỈ HIỆN HEADER Ở TRANG PUBLIC */}
      {!isDashboardRoute && <Header />}
      
      <main className={isDashboardRoute ? "dashboard-main" : "main-content"}> 
        <Routes>
          
          {/* ==============================================
              NHÓM 1: PUBLIC (Khách vãng lai xem được)
              ============================================== */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search mockUniversities={mockUniversities} />} />
          <Route path="/detail/:id" element={<UniversityDetail />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassWord />} />
          <Route path="/contact" element={<Contact />} /> 
          <Route path="/about" element={<About />} /> 
          <Route path="/scholarship" element={<Scholarship />} /> 
          <Route path="/guide" element={<Guide />} /> 
          <Route path="/privacy" element={<Privacy />} /> 
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/roi-calculator" element={<RoiCalculator />} />
          <Route path="/orientation" element={<Orientation />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
 
          {/* ==============================================
              NHÓM 2: USER (Học sinh đã đăng nhập mới dùng được)
              ============================================== */}
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'admin', 'mentor']}><Profile /></ProtectedRoute>} />
          <Route path="/update-profile" element={<ProtectedRoute allowedRoles={['user', 'admin', 'mentor']}><ProfileForm /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute allowedRoles={['user', 'admin', 'mentor']}><ChangePassWord /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute allowedRoles={['user', 'admin']}><Compare /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute allowedRoles={['user', 'admin']}><Favorites /></ProtectedRoute>} /> 
          <Route path="/ai-suggestion" element={<ProtectedRoute allowedRoles={['user', 'admin']}><AiSuggestion /></ProtectedRoute>} /> 
          <Route path="/chatbot" element={<ProtectedRoute allowedRoles={['user', 'admin']}><Chatbot /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute allowedRoles={['user', 'admin']}><Booking /></ProtectedRoute>} />
          <Route path="/booking-history" element={<ProtectedRoute allowedRoles={['user', 'admin']}><BookingHistory /></ProtectedRoute>} />
          
          {/* ==============================================
              NHÓM 3: MENTOR (Khu vực dành riêng cho Cố vấn)
              ============================================== */}
          <Route path="/mentor" element={<ProtectedRoute allowedRoles={['mentor']}><MentorLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="schedule" replace />} /> {/* Tự động nhảy vào trang lịch */}
            <Route path="schedule" element={<MentorSchedule />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ==============================================
              NHÓM 4: ADMIN (Khu vực Quản trị viên)
              ============================================== */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} /> 
            <Route path="admission" element={<AdmissionManagement />} /> 
            <Route path="ai-system" element={<AISystemManagement />} /> 
            <Route path="consultation-history" element={<ConsultationHistory />} /> 
            <Route path="content" element={<ContentManagement />} /> 
            <Route path="exam-block" element={<ExamBlockManagement />} /> 
            <Route path="university" element={<UniversityManagement />} /> 
            <Route path="users" element={<UserManagement />} /> 
            <Route path="bookings" element={<BookingManagement />} /> 
            <Route path="mentors" element={<MentorManagement />} /> 
            <Route path="admincontent" element={<AdminContent/>}/>
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
        </Routes>
      </main>

      {/* 🚀 CHỈ HIỆN FOOTER Ở TRANG PUBLIC */}
      {!isDashboardRoute && <Footer />}
    </div>
  );
};

// =========================================================
// 3. COMPONENT GỐC BỌC ROUTER (ĐỂ CHỐNG LỖI useLocation)
// =========================================================
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;