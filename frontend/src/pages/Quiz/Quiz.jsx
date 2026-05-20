// src/pages/Quiz/Quiz.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Quiz.css';

const Quiz = () => {
  const navigate = useNavigate(); 
  
  const [quizType, setQuizType] = useState(null); 
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [activeOption, setActiveOption] = useState(null);
  const [resultData, setResultData] = useState(null);
  
  // State lưu danh sách câu hỏi tải từ Database
  const [questions, setQuestions] = useState([]);
  const [isFetchingQ, setIsFetchingQ] = useState(false); 

  // State để quản lý việc đóng/mở thanh Accordion chi tiết
  const [expandedAcc, setExpandedAcc] = useState('holland'); 

  const totalQuestions = questions.length;

  const handleStartQuiz = async (type) => {
    setQuizType(type);
    setIsFetchingQ(true);

    try {
      const qRes = await fetch(`https://gr112.onrender.com/api/admin/questions?type=${type}`);
      const dbQuestions = await qRes.json();

      if (!dbQuestions || dbQuestions.length === 0) {
        alert("Ngân hàng câu hỏi đang trống! Vui lòng vào Admin để thêm câu hỏi.");
        setIsFetchingQ(false);
        return;
      }

      setQuestions(dbQuestions);
      const targetQuestionsLength = dbQuestions.length;

      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser && savedUser.id) {
        const response = await fetch(`https://gr112.onrender.com/api/get-quiz-result/${savedUser.id}?type=${type}`);
        const data = await response.json();
        
        if (response.ok && data.exists) {
          setResultData(data.result);
          setStep(targetQuestionsLength + 2); 
          setIsFetchingQ(false);
          return; 
        }
      }
      
      setStep(1);
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể kết nối đến máy chủ lấy câu hỏi!");
    } finally {
      setIsFetchingQ(false);
    }
  };

  const handleSelectOption = (value) => {
    setActiveOption(value);
    const currentQuestionId = questions[step - 1].id; 
    setAnswers({ ...answers, [currentQuestionId]: value });
    
    setTimeout(() => {
      if (step < totalQuestions) {
        setStep(step + 1);
        setActiveOption(answers[questions[step].id] || null); 
      } else {
        setStep(totalQuestions + 1); 
      }
    }, 400);
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setActiveOption(answers[questions[step - 2].id] || null);
    }
  };

  useEffect(() => {
    if (step === totalQuestions + 1 && totalQuestions > 0) {
      const fetchQuizResult = async () => {
        try {
          const response = await fetch('https://gr112.onrender.com/api/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizType, answers })
          });
          const data = await response.json();
          if (response.ok) setResultData(data.result);
        } catch (error) {
          console.error("Lỗi kết nối Backend:", error);
        } finally {
          setTimeout(() => setStep(totalQuestions + 2), 2500); 
        }
      };
      fetchQuizResult();
    }
  }, [step, answers, totalQuestions, quizType]);

  const handleRetake = () => {
    setAnswers({});
    setActiveOption(null);
    setResultData(null);
    setQuizType(null); 
    setQuestions([]); 
    setStep(0); 
  };

  // 🚀 ĐÃ SỬA HÀM NÀY: Báo thành công và ép chuyển trang cực mạnh
  const handleSaveProfile = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser || !savedUser.id) {
      alert("Bạn cần đăng nhập để lưu kết quả nhé!");
      return;
    }
    try {
      const response = await fetch('https://gr112.onrender.com/api/save-quiz-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: savedUser.id, quizType, personality: resultData.name, desc: resultData.desc
        })
      });
      
      if (response.ok) {
        alert("🎉 Lưu kết quả thành công! Chuyển đến AI Tư vấn..."); 
        window.location.href = '/chatbot'; 
      } else {
        const errData = await response.json();
        alert("Lỗi khi lưu: " + (errData.error || "Không rõ nguyên nhân"));
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("⚠️ Lỗi kết nối máy chủ! Hãy chắc chắn Backend đang chạy.");
    }
  };

  // ==========================================
  // RENDER GIAO DIỆN
  // ==========================================
  
  if (step === 0) {
    const quizOptions = [
      {
        id: 'holland',
        title: 'ĐỊNH HƯỚNG NGHỀ NGHIỆP',
        subtitle: '(Nhóm Holland - RIASEC)',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        accTitle: 'Công cụ khám phá sở thích theo Holland',
        desc: 'Công cụ khám phá sở thích theo Holland giúp người sử dụng bắt đầu tìm hiểu về đặc tính nghề nghiệp của mình qua sở thích tự nhiên. Nhờ kiến thức này mà người sử dụng sẽ từ từ nối được vào sự hiểu biết thế giới nghề nghiệp để ra quyết định nghề nghiệp phù hợp nhất cho bản thân tại từng thời điểm.'
      },
      {
        id: 'mbti',
        title: 'MÔI TRƯỜNG & TÍNH CÁCH',
        subtitle: '(Nhóm Tâm lý MBTI)',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        accTitle: 'Công cụ đánh giá tính cách MBTI',
        desc: 'Trắc nghiệm MBTI (Myers-Briggs Type Indicator) giúp phân loại 16 nhóm tính cách dựa trên cách bạn tiếp nhận thông tin và ra quyết định. Qua đó, bạn sẽ hiểu rõ môi trường làm việc nào giúp mình phát huy tối đa năng lực và cách tương tác hiệu quả với những người xung quanh.'
      },
      {
        id: 'mi',
        title: 'NHẬN DIỆN ĐIỂM MẠNH',
        subtitle: '(Đa trí thông minh - MI)',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        accTitle: 'Nhận diện Đa trí thông minh (MI)',
        desc: 'Học thuyết Đa trí thông minh của TS. Howard Gardner chỉ ra rằng mỗi người đều có những trí thông minh nổi trội riêng (Ngôn ngữ, Logic, Vận động...). Công cụ này giúp bạn nhận diện điểm mạnh cốt lõi để chọn phương pháp học tập phù hợp nhất.'
      },
      {
        id: 'grit',
        title: 'ĐO LƯỜNG SỰ BỀN BỈ',
        subtitle: '(Chỉ số Ý chí - Grit)',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        accTitle: 'Đo lường Chỉ số Ý chí (Grit)',
        desc: 'Chỉ số Grit đo lường khả năng duy trì đam mê và nỗ lực dài hạn của bạn khi đối mặt với khó khăn. Trong học thuật, Grit được chứng minh là yếu tố dự đoán thành công chính xác hơn cả IQ hay tài năng bẩm sinh.'
      },
      {
        id: 'mindset',
        title: 'TƯ DUY PHÁT TRIỂN',
        subtitle: '(Growth vs Fixed Mindset)',
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        accTitle: 'Đánh giá Tư duy phát triển',
        desc: 'Bạn tin rằng trí thông minh là cố định (Fixed Mindset) hay có thể rèn luyện (Growth Mindset)? Việc hiểu rõ hệ tư duy hiện tại sẽ giúp bạn gỡ bỏ rào cản tâm lý, tự tin đối mặt với các môn học khó.'
      }
    ];

    return (
      <div className="qz-container fade-in">
        <div>
          <h1 style={{ textAlign: 'center' }}>Chọn bài kiểm tra phù hợp</h1>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>Hệ thống sẽ dựa vào kết quả để đề xuất ngành học, phương pháp và trường Đại học cho bạn.</p>
        </div>

        <div className="quiz-image-grid">
          {quizOptions.map((quiz) => (
            <div key={quiz.id} className="quiz-image-card" onClick={() => handleStartQuiz(quiz.id)}>
              <img src={quiz.image} alt={quiz.title} className="quiz-bg-img" />
              <div className="quiz-overlay-band">
                <h3>{quiz.title}</h3>
                <p>{isFetchingQ && quizType === quiz.id ? 'Đang tải câu hỏi...' : quiz.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="quiz-accordion-container">
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#111827' }}>Tìm hiểu chi tiết các công cụ</h2>
          
          {quizOptions.map((quiz) => (
            <div key={quiz.id} className="quiz-accordion-item">
              
              <div 
                className={`quiz-acc-header ${expandedAcc === quiz.id ? 'active' : ''}`}
                onClick={() => setExpandedAcc(expandedAcc === quiz.id ? null : quiz.id)}
              >
                <i className={`fas fa-chevron-${expandedAcc === quiz.id ? 'up' : 'down'}`}></i>
                <span>{quiz.accTitle}</span>
              </div>

              {expandedAcc === quiz.id && (
                <div className="quiz-acc-body">
                  <p><strong>{quiz.accTitle}</strong> {quiz.desc.replace(quiz.accTitle, '')}</p>
                  
                  <button className="quiz-acc-btn" onClick={() => handleStartQuiz(quiz.id)}>
                    {isFetchingQ && quizType === quiz.id ? 'ĐANG TẢI...' : 'BẮT ĐẦU TRẮC NGHIỆM'}
                  </button>
                </div>
              )}
              
            </div>
          ))}
        </div>

      </div>
    );
  }

  if (step === totalQuestions + 1) {
    return (
      <div className="qz-container fade-in">
        <div className="qz-analyzing-card">
          <div className="qz-spinner"></div>
          <h2>AI đang phân tích hồ sơ {quizType?.toUpperCase()}...</h2>
          <p>Hệ thống đang đối chiếu dữ liệu của bạn với cơ sở dữ liệu chuyên sâu.</p>
        </div>
      </div>
    );
  }

  if (step === totalQuestions + 2) {
    return (
      <div className="qz-container fade-in">
        <div className="qz-result-card">
          <div className="qz-result-header">
            <span className="qz-badge-top">KẾT QUẢ {quizType?.toUpperCase()}</span>
            <h2>Phân tích của bạn: <strong>{resultData?.name || "Đang tải..."}</strong></h2>
            <p>{resultData?.desc || ""}</p>
          </div>
          <div className="qz-result-actions">
            <button className="qz-btn-outline" onClick={handleRetake}><i className="fas fa-redo"></i> Chọn Bài Test Khác</button>
            <button className="qz-btn-primary" onClick={handleSaveProfile}>Lưu hồ sơ & Xem chi tiết &rarr;</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[step - 1];
  const progressPercentage = ((step - 1) / totalQuestions) * 100;

  return (
    <div className="qz-container fade-in">
      <div className="qz-question-card" style={{ position: 'relative' }}>
        
        {/* Nút X (Thoát/Đóng bài test) ở góc trên bên phải */}
        <button 
          onClick={handleRetake} 
          title="Đóng bài test"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: '#9ca3af',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
            zIndex: 10
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="qz-progress-header" style={{ paddingRight: '40px' }}>
          <span>Câu hỏi {step} / {totalQuestions} ({quizType?.toUpperCase()})</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="qz-progress-bar">
          <div className="qz-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <h2 className="qz-question-text">{currentQuestion?.text}</h2>
        <div className="qz-options-container">
          {[1, 2, 3, 4, 5].map((val) => {
            const labels = ["Rất không đúng", "Không đúng lắm", "Phân vân / Trung lập", "Khá đúng", "Rất đúng"];
            return (
              <button 
                key={val} 
                className={`qz-option-btn ${activeOption === val ? 'selected' : ''}`} 
                onClick={() => handleSelectOption(val)}
              >
                <div className="qz-opt-circle">{val}</div> 
                {labels[val-1]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Quiz;