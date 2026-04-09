// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { mockUniversities } from './utils/data';

// Import các component dùng chung
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// Import Pages
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import Chatbot from './components/Chatbot/Chatbot'; 
import Quiz from './pages/Quiz/Quiz';
import UniversityDetail from './pages/UniversityDetail/UniversityDetail';
import Profile from './pages/Profile/Profile';
import Login from './pages/Auth/login'; // Đã sửa đường dẫn thành 'Login' viết hoa
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

// Import các trang Admin (dựa theo cấu trúc thư mục của bạn)
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdmissionManagement from './pages/Admin/AdmissionManagement';
import AISystemManagement from './pages/Admin/AISystemManagement';
import ConsultationHistory from './pages/Admin/ConsultationHistory';
import ContentManagement from './pages/Admin/ContentManagement';
import ExamBlockManagement from './pages/Admin/ExamBlockManagement';
import UniversityManagement from './pages/Admin/UniversityManagement';
import UserManagement from './pages/Admin/UserManagement';

function App() {
  return (
    <Router>
      <div className="app-container"> 
        <Header />
        
        {/* PHẢI CÓ THẺ MAIN NÀY ĐỂ BỐ CỤC KHÔNG BỊ VỠ VÀ ĐẨY FOOTER XUỐNG ĐÁY */}
        <main className="main-content"> 
          <Routes>
            {/* Các Route dành cho người dùng (Public) */}
            <Route path="/" element={<Home mockUniversities={mockUniversities} />} />
            <Route path="/search" element={<Search mockUniversities={mockUniversities} />} />
            <Route path="/detail/:id" element={<UniversityDetail />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassWord />} />
            <Route path="/change-password" element={<ChangePassWord />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/favorites" element={<Favorites />} /> 
            <Route path="/ai-suggestion" element={<AiSuggestion />} /> 
            <Route path="/contact" element={<Contact />} /> 
            <Route path="/about" element={<About />} /> 
            <Route path="/scholarship" element={<Scholarship />} /> 
            <Route path="/guide" element={<Guide />} /> 
            <Route path="/privacy" element={<Privacy />} /> 
            <Route path="/update-profile" element={<ProfileForm />} /> 
            <Route path="/booking" element={<Booking />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/roi-calculator" element={<RoiCalculator />} />

            {/* Các Route dành cho Admin (Được lồng vào trong AdminLayout) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} /> {/* Path: /admin */}
              <Route path="admission" element={<AdmissionManagement />} /> {/* Path: /admin/admission */}
              <Route path="ai-system" element={<AISystemManagement />} /> {/* Path: /admin/ai-system */}
              <Route path="consultation-history" element={<ConsultationHistory />} /> {/* Path: /admin/consultation-history */}
              <Route path="content" element={<ContentManagement />} /> {/* Path: /admin/content */}
              <Route path="exam-block" element={<ExamBlockManagement />} /> {/* Path: /admin/exam-block */}
              <Route path="university" element={<UniversityManagement />} /> {/* Path: /admin/university */}
              <Route path="users" element={<UserManagement />} /> {/* Path: /admin/users */}
            </Route>
            
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;