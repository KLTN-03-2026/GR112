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
  
  // ĐÃ THÊM: State lưu danh sách câu hỏi tải từ Database
  const [questions, setQuestions] = useState([]);
  const [isFetchingQ, setIsFetchingQ] = useState(false); // Trạng thái đang tải câu hỏi

  const totalQuestions = questions.length;

  // --- 1. CHỌN BÀI TEST & LẤY CÂU HỎI TỪ DB ---
  const handleStartQuiz = async (type) => {
    setQuizType(type);
    setIsFetchingQ(true);

    try {
      // 1. Gọi API lấy danh sách câu hỏi từ Database
      const qRes = await fetch(`http://localhost:8000/api/admin/questions?type=${type}`);
      const dbQuestions = await qRes.json();

      if (!dbQuestions || dbQuestions.length === 0) {
        alert("Ngân hàng câu hỏi đang trống! Vui lòng vào Admin để thêm câu hỏi.");
        setIsFetchingQ(false);
        return;
      }

      setQuestions(dbQuestions);
      const targetQuestionsLength = dbQuestions.length;

      // 2. Kiểm tra xem đã đăng nhập và làm bài test này chưa
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser && savedUser.id) {
        const response = await fetch(`http://localhost:8000/api/get-quiz-result/${savedUser.id}?type=${type}`);
        const data = await response.json();
        
        if (response.ok && data.exists) {
          setResultData(data.result);
          setStep(targetQuestionsLength + 2); 
          setIsFetchingQ(false);
          return; 
        }
      }
      
      // 3. Bắt đầu làm câu 1
      setStep(1);
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể kết nối đến máy chủ lấy câu hỏi!");
    } finally {
      setIsFetchingQ(false);
    }
  };

  // --- HÀM XỬ LÝ CHỌN ĐÁP ÁN ---
  const handleSelectOption = (value) => {
    setActiveOption(value);
    const currentQuestionId = questions[step - 1].id; // Lấy ID thật từ DB
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

  // --- HÀM QUAY LẠI ---
  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setActiveOption(answers[questions[step - 2].id] || null);
    }
  };

  // --- 2. GỬI BÀI TEST LÊN AI KHI LÀM XONG ---
  useEffect(() => {
    if (step === totalQuestions + 1 && totalQuestions > 0) {
      const fetchQuizResult = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              quizType: quizType,
              answers: answers 
            })
          });
          const data = await response.json();
          
          if (response.ok) {
            setResultData(data.result);
          } else {
            console.error("Lỗi phân tích:", data.error);
          }
        } catch (error) {
          console.error("Lỗi kết nối Backend:", error);
        } finally {
          setTimeout(() => {
            setStep(totalQuestions + 2);
          }, 2500); 
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
    setQuestions([]); // Xóa câu hỏi cũ
    setStep(0); 
  };

  const handleSaveProfile = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser || !savedUser.id) {
      alert("Bạn cần đăng nhập để lưu kết quả nhé!");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/save-quiz-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: savedUser.id,
          quizType: quizType, 
          personality: resultData.name, 
          desc: resultData.desc
        })
      });

      if (response.ok) {
        navigate('/chatbot'); 
      } else {
        alert("Có lỗi xảy ra khi lưu dữ liệu!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Lỗi kết nối máy chủ!");
    }
  };

  // ==========================================
  // RENDER GIAO DIỆN
  // ==========================================
  
  if (step === 0) {
    return (
      <div className="qz-container fade-in">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1>Chọn bài kiểm tra phù hợp</h1>
          <p style={{ color: '#6b7280' }}>Hệ thống sẽ dựa vào kết quả để đề xuất ngành học và trường Đại học cho bạn.</p>
        </div>

        <div className="quiz-selection-grid">
          <div className="quiz-select-card" onClick={() => handleStartQuiz('holland')}>
            <div className="qz-badge badge-holland">HOLLAND</div>
            <h2>Nhóm Holland (RIASEC)</h2>
            <p className="qz-question-count">Đánh giá chuyên sâu</p>
            <p className="qz-update-time">
              {isFetchingQ && quizType === 'holland' ? 'Đang tải dữ liệu...' : 'Đánh giá nhóm ngành phù hợp'}
            </p>
          </div>

          <div className="quiz-select-card" onClick={() => handleStartQuiz('mbti')}>
            <div className="qz-badge badge-mbti">MBTI</div>
            <h2>Nhóm Tâm lý (MBTI)</h2>
            <p className="qz-question-count">Đánh giá chuyên sâu</p>
            <p className="qz-update-time">
              {isFetchingQ && quizType === 'mbti' ? 'Đang tải dữ liệu...' : 'Đánh giá tính cách bẩm sinh'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === totalQuestions + 1) {
    return (
      <div className="qz-container fade-in">
        <div className="qz-analyzing-card">
          <div className="qz-spinner"></div>
          <h2>AI đang phân tích hồ sơ {quizType.toUpperCase()}...</h2>
          <p>Hệ thống đang đối chiếu dữ liệu tính cách của bạn với hơn 10,000 chương trình đào tạo tại Việt Nam.</p>
          <div className="qz-analyzing-steps">
            <div className="qz-step-item active"><i className="fas fa-check-circle"></i> Tổng hợp lựa chọn</div>
            <div className="qz-step-item active"><i className="fas fa-check-circle"></i> Khớp nối mô hình {quizType === 'mbti' ? 'MBTI' : 'RIASEC'}</div>
            <div className="qz-step-item loading"><i className="fas fa-circle-notch fa-spin"></i> Trích xuất trường Đại học phù hợp</div>
          </div>
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
            <h2>Nhóm tính cách của bạn: <strong>{resultData?.name || "Đang tải..."}</strong></h2>
            <p>{resultData?.desc || ""}</p>
          </div>

          <div className="qz-result-grid">
            <div className="qz-result-box">
              <h3><i className="fas fa-briefcase"></i> Ngành nghề đề xuất</h3>
              <div className="qz-tags">
                {resultData?.careers?.map((career, idx) => (
                  <span key={idx}>{career}</span>
                ))}
              </div>
            </div>
            <div className="qz-result-box">
              <h3><i className="fas fa-university"></i> Trường Đại học độ Match cao</h3>
              <ul className="qz-uni-list">
                {resultData?.unis?.map((uni, idx) => (
                  <li key={idx}>
                    <div className="uni-name">{uni.name}</div>
                    <div className="uni-match">{uni.match}</div>
                  </li>
                ))}
              </ul>
            </div>
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
      <div className="qz-question-card">
        <div className="qz-progress-header">
          <span>Câu hỏi {step} / {totalQuestions} ({quizType.toUpperCase()})</span>
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
                <div className="qz-opt-circle">{val}</div> {labels[val-1]}
              </button>
            )
          })}
        </div>

        <div className="qz-nav-buttons">
          <button className="qz-btn-text" onClick={handlePrev} disabled={step === 1}>
            &larr; Quay lại
          </button>
          <span className="qz-hint"><i className="fas fa-lightbulb"></i> Hãy chọn đáp án mô tả đúng nhất về bạn.</span>
        </div>
      </div>
    </div>
  );
};

export default Quiz;