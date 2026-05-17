import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

const Chatbot = () => {
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false); 
  const [isMuted, setIsMuted] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [userProfile, setUserProfile] = useState(null);
  const recognitionRef = useRef(null);

  // --- QUẢN LÝ SESSION (LỊCH SỬ CHAT TỪ DATABASE) ---
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // --- CÁC STATE CHO CHỨC NĂNG MỚI ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isSearchActive, setIsSearchActive] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [showSettings, setShowSettings] = useState(false); 

  // --- STATE CHO CÀI ĐẶT TƯ DUY AI VÀ GIAO DIỆN ---
  const [aiStyle, setAiStyle] = useState('friendly'); 
  const [aiLength, setAiLength] = useState('detailed'); 
  const [theme, setTheme] = useState(localStorage.getItem('chat_theme') || 'light'); 

  const savedUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    localStorage.setItem('chat_theme', theme);
  }, [theme]);

  // --- 1. TẢI HỒ SƠ & LỊCH SỬ CHAT ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (savedUser && savedUser.id) {
        try {
          const profileRes = await fetch(`https://gr112.onrender.com/api/get-full-profile/${savedUser.id}`);
          let profileData = null;
          
          if (profileRes.ok) {
            const data = await profileRes.json();
            // 🚀 ĐỒNG BỘ DỮ LIỆU ĐIỂM NGAY LÚC FETCH ĐỂ LÀM BẢNG 6 Ô
            profileData = {
              ...data,
              displayScores: [
                { label: 'Mục tiêu khối', value: data.target_block || '-' },
                { label: 'Tổng THPT', value: data.scores?.THPT || data.exam_score || '-' },
                { label: 'GPA Trung bình', value: data.scores?.GPA || data.gpa_10 || '-' },
                { label: 'Thi ĐGNL', value: data.scores?.ĐGNL || data.dgnl_score || '-' },
                { label: 'IELTS', value: data.scores?.IELTS || data.ielts_score || '-' },
                { label: 'SAT', value: data.scores?.SAT || data.sat_score || '-' },
              ]
            };
          } else {
            profileData = { 
                name: savedUser.full_name || savedUser.name || "Bạn", 
                class: savedUser.className || "Chưa cập nhật", 
                school: savedUser.schoolName || "Chưa cập nhật",
                scores: {},
                displayScores: [
                  { label: 'Mục tiêu khối', value: '-' },
                  { label: 'Tổng THPT', value: '-' },
                  { label: 'GPA Trung bình', value: '-' },
                  { label: 'Thi ĐGNL', value: '-' },
                  { label: 'IELTS', value: '-' },
                  { label: 'SAT', value: '-' },
                ]
            };
          }
          
          setUserProfile(profileData);
            
          const sessionRes = await fetch(`https://gr112.onrender.com/api/chat/sessions/${savedUser.id}`);
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            setSessions(sessionData);
            
            if (sessionData.length === 0) {
              let personalityText = "chưa làm test tính cách";
              if (profileData.holland_personality && profileData.mbti_personality) {
                  personalityText = `**${profileData.holland_personality}** (Holland) và **${profileData.mbti_personality}** (MBTI)`;
              } else if (profileData.holland_personality) {
                  personalityText = `**${profileData.holland_personality}** (Holland)`;
              } else if (profileData.mbti_personality) {
                  personalityText = `**${profileData.mbti_personality}** (MBTI)`;
              }

              setChatMessages([
                { sender: 'bot', content: "Xin chào! Hệ thống đang tiến hành đồng bộ hồ sơ của bạn..." },
                { sender: 'bot', type: 'card', content: (
                    <div className="msg-card-purple">
                      <strong><i className="fas fa-chart-bar" style={{marginRight: '10px'}}></i> PHÂN TÍCH DỮ LIỆU HỌC TẬP</strong>
                      <p>Hồ sơ của bạn đang được AI đánh giá. Khả năng trúng tuyển vào các ngành Top đầu sẽ được tính toán ngay sau đây.</p>
                    </div>
                  )
                },
                { sender: 'bot', content: `Xin chào **${profileData.name}!** Hệ thống đã đồng bộ hồ sơ của bạn.\n\nMình thấy bạn có điểm mạnh khối **${profileData.target_block || 'chưa chọn'}** và bài trắc nghiệm cho thấy bạn thuộc nhóm ${personalityText}.\n\nBạn muốn mình gợi ý ngành học hay trường Đại học phù hợp với hồ sơ này?` }
              ]);
            } else {
              handleSelectSession(sessionData[0].id);
            }
          }
        } catch (error) {
          console.error("Lỗi lấy dữ liệu ban đầu:", error);
          setUserProfile({ 
            name: savedUser.full_name || savedUser.name || "Bạn", 
            class: savedUser.className || "Chưa cập nhật", 
            school: savedUser.schoolName || "Chưa cập nhật",
            scores: {},
            displayScores: [
              { label: 'Mục tiêu khối', value: '-' },
              { label: 'Tổng THPT', value: '-' },
              { label: 'GPA Trung bình', value: '-' },
              { label: 'Thi ĐGNL', value: '-' },
              { label: 'IELTS', value: '-' },
              { label: 'SAT', value: '-' },
            ]
          });
        } finally {
          setIsLoadingHistory(false); 
        }
      } else {
        setIsLoadingHistory(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- 2. HÀM CHỌN CUỘC TRÒ CHUYỆN ---
  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setChatMessages([]); 
    setLoading(true);
    try {
      const res = await fetch(`https://gr112.onrender.com/api/chat/history/${sessionId}`);
      if (res.ok) {
        const historyData = await res.json();
        const formattedMsgs = historyData.map(msg => ({
          sender: msg.sender,
          content: msg.content,
          image: msg.image 
        }));
        setChatMessages(formattedMsgs);
      }
    } catch (e) {
      console.error("Lỗi tải tin nhắn cũ:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setChatMessages([{ sender: 'bot', content: "Xin chào! Mình có thể giúp gì cho bạn?" }]);
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation(); 
    if (!window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này?")) return;
    try {
      const res = await fetch(`https://gr112.onrender.com/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(updatedSessions);
        if (currentSessionId === sessionId) handleNewChat();
      }
    } catch (error) {
      console.error("Lỗi xóa session:", error);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); 
    const cleanText = text.replace(/[*#_]/g, '').replace(/[\r\n]+/g, ', '); 
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN'; 
    window.speechSynthesis.speak(utterance);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); 
        setImagePreview(reader.result);  
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendChat = async (textToSend = chatInput, isVoice = false) => {
    if (!textToSend.trim() && !selectedImage) return;

    setChatMessages(prev => [
        ...prev, 
        { sender: 'user', content: textToSend, image: imagePreview }
    ]);
    
    setChatInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setLoading(true);

    try {
      let styleText = aiStyle === 'friendly' 
        ? 'Hãy trả lời cực kỳ thân thiện, vui vẻ, xưng hô gần gũi, thỉnh thoảng dùng icon cảm xúc' 
        : 'Hãy trả lời thật nghiêm túc, chuẩn mực, lịch sự như một chuyên gia tư vấn giáo dục';
      
      let lengthText = aiLength === 'detailed' 
        ? 'Giải thích chi tiết, cặn kẽ, đưa ra nhiều phân tích sâu sắc' 
        : 'Trả lời ngắn gọn, súc tích, đi thẳng vào trọng tâm, có thể dùng gạch đầu dòng';

      let smartPrompt = textToSend;
      let hiddenInstruction = ` \n\n(Chỉ thị hệ thống: ${styleText}. ${lengthText}.)`;

      // 🚀 TIÊM DỮ LIỆU ĐIỂM VÀO NÃO AI KHI CHAT
      if (userProfile && !selectedImage && chatMessages.length <= 1) {
          let scoreSummary = '';
          if (userProfile.displayScores) {
              scoreSummary = userProfile.displayScores
                  .filter(s => s.value !== '-')
                  .map(s => `${s.label}: ${s.value}`)
                  .join(', ');
          }
          hiddenInstruction = ` \n\n(Chỉ thị hệ thống: Học sinh tên ${userProfile.name}, mục tiêu thi khối ${userProfile.target_block || 'chưa rõ'}. Dữ liệu học thuật: ${scoreSummary}. Tính cách: ${userProfile.holland_personality || 'Chưa làm test'}. ${styleText}. ${lengthText}.)`;
      }
      
      smartPrompt += hiddenInstruction; 

      const response = await fetch('https://gr112.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: smartPrompt,
          userId: savedUser?.id,
          sessionId: currentSessionId, 
          image: selectedImage 
        })
      });
      const data = await response.json();

      if (response.ok) {
        const botMsg = { sender: 'bot', content: data.text, recommendations: data.data };
        setChatMessages(prev => [...prev, botMsg]);
        
        if (!currentSessionId && data.sessionId) {
            setCurrentSessionId(data.sessionId);
            setSessions(prev => [
                { id: data.sessionId, title: textToSend.substring(0, 30) + (textToSend.length > 30 ? "..." : "") },
                ...prev
            ]);
        }

        if (isVoice && !isMuted) speakText(data.text);
      } else {
          setChatMessages(prev => [...prev, { sender: 'bot', content: "Lỗi từ AI: " + (data.error || "Thử lại sau nhé!") }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { sender: 'bot', content: "Hệ thống đang bảo trì, vui lòng thử lại sau nhé! 😢" }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (isRecording) {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsRecording(false);
        setChatInput('');
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Trình duyệt không hỗ trợ nhận diện giọng nói!");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'vi-VN';
    recognition.onstart = () => { setIsRecording(true); setChatInput("Đang nghe..."); };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript); 
      handleSendChat(transcript, true);
    };
    recognition.onend = () => {
        setIsRecording(false);
        setChatInput((prev) => prev === "Đang nghe..." ? "" : prev);
    }
    recognition.start();
  };

  const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`chat-view-container fade-in ${theme === 'dark' ? 'dark-mode' : ''}`}>
      
      {/* ==========================================
          THANH SIDEBAR LỊCH SỬ BÊN TRÁI 
          ========================================== */}
      <aside className={`chat-sidebar-left ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <i className="fas fa-bars" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title="Thu gọn/Mở rộng"></i>
          <i className="fas fa-search" onClick={() => setIsSearchActive(!isSearchActive)} title="Tìm kiếm"></i>
        </div>

        <div className="sidebar-menu">
          <button className="menu-item new-chat-btn" onClick={handleNewChat} style={{backgroundColor: '#1e293b', color: '#fff'}}>
            <i className="fas fa-edit"></i> <span>Cuộc trò chuyện mới</span>
          </button>
        </div>

        <div className="sidebar-section history-section">
          {isSearchActive && (
             <input 
               type="text" 
               className="history-search-input" 
               placeholder="Tìm kiếm lịch sử..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          )}

          <div className="section-header" style={{textTransform: 'uppercase', letterSpacing: '1px'}}>Lịch sử Chat</div>
          <ul className="history-list">
            {isLoadingHistory ? (
              <li style={{color: '#64748b', fontStyle: 'italic', background: 'transparent'}}>Đang tải dữ liệu...</li>
            ) : filteredSessions.length === 0 ? (
              <li style={{color: '#64748b', fontStyle: 'italic', background: 'transparent'}}>
                {searchTerm ? "Không tìm thấy kết quả." : "Chưa có cuộc trò chuyện nào."}
              </li>
            ) : (
              filteredSessions.map(session => (
                 <li 
                   key={session.id} 
                   className={currentSessionId === session.id ? "active" : ""}
                   onClick={() => handleSelectSession(session.id)}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                     <i className="far fa-comment-alt" style={{marginRight: '8px', fontSize: '12px'}}></i>
                     <span className="session-title">{session.title}</span>
                   </div>
                   <i 
                     className="fas fa-trash delete-icon" 
                     onClick={(e) => handleDeleteSession(e, session.id)} 
                     title="Xóa cuộc trò chuyện"
                   ></i>
                 </li>
              ))
            )}
          </ul>
        </div>

        <div className="sidebar-bottom">
          <button className="menu-item" onClick={() => setShowSettings(true)}>
            <i className="fas fa-cog"></i> <span>Tùy chỉnh AI</span>
          </button>
        </div>
      </aside>

      {/* ==========================================
          MODAL CÀI ĐẶT
          ========================================== */}
      {showSettings && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            <div className="modal-header">
              <h3>Tùy chỉnh Trợ lý AI</h3>
              <i className="fas fa-times" onClick={() => setShowSettings(false)}></i>
            </div>
            
            <div className="modal-body">
              <p className="modal-greeting">Xin chào <strong>{userProfile?.name || savedUser?.name || "bạn"}</strong>!</p>

              <div className="setting-row">
                 <label><i className="fas fa-moon" style={{color: '#f59e0b', marginRight: '6px'}}></i> Giao diện</label>
                 <select 
                    className="setting-select active-select"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                 >
                   <option value="light">Chế độ Sáng (Light Mode)</option>
                   <option value="dark">Chế độ Tối (Dark Mode)</option>
                 </select>
              </div>
              
              <div className="setting-row">
                 <label><i className="fas fa-magic" style={{color: '#8b5cf6', marginRight: '6px'}}></i> Phong cách trò chuyện</label>
                 <select 
                    className="setting-select active-select" 
                    value={aiStyle} 
                    onChange={(e) => setAiStyle(e.target.value)}
                 >
                   <option value="friendly">Thân thiện, gần gũi (Gen Z) 😎</option>
                   <option value="professional">Nghiêm túc, chuẩn mực 👔</option>
                 </select>
              </div>
              
              <div className="setting-row">
                 <label><i className="fas fa-align-left" style={{color: '#3b82f6', marginRight: '6px'}}></i> Mức độ chi tiết</label>
                 <select 
                    className="setting-select active-select" 
                    value={aiLength} 
                    onChange={(e) => setAiLength(e.target.value)}
                 >
                   <option value="detailed">Phân tích chi tiết, cặn kẽ</option>
                   <option value="concise">Ngắn gọn, súc tích, tóm tắt</option>
                 </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-close-modal" onClick={() => setShowSettings(false)}>Áp dụng ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          KHU VỰC CHAT CHÍNH Ở GIỮA
          ========================================== */}
      <div className="chat-main">
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`msg-row ${msg.sender}`}>
              <div className="msg-avatar">
                {msg.sender === 'bot' ? <i className="fas fa-robot"></i> : <i className="fas fa-user"></i>}
              </div>
              <div className="msg-content">
                {msg.type === 'card' ? ( msg.content ) : (
                  <div className="msg-bubble">
                    {msg.image && <img src={msg.image} alt="User upload" style={{maxWidth: '200px', borderRadius: '8px', marginBottom: '10px'}} />}
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
                
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px'}}>
                    {msg.recommendations.map((school, sIdx) => (
                      <div key={sIdx} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                          <img 
                            src={school.school_logo} 
                            alt="logo" 
                            style={{width: '35px', height: '35px', objectFit: 'contain'}} 
                            onError={(e) => e.target.src="https://cdn-icons-png.flaticon.com/512/2941/2941658.png"} 
                          />
                          <div>
                            <strong style={{color: '#0f172a', fontSize: '14px'}}>{school.school_name}</strong>
                            <p style={{margin: 0, fontSize: '12px', color: '#64748b'}}>
                              {school.major_name} {school.major_code ? `(${school.major_code})` : ''}
                            </p>
                          </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <strong style={{color: '#6366f1', display: 'block'}}>
                            {school.score_thpt_last_year || school.base_score || 'N/A'}đ
                          </strong>
                          <span style={{fontSize: '11px', color: '#94a3b8'}}>{school.subject_block || 'Khối'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="msg-row bot"><div className="msg-bubble">AI đang phân tích...</div></div>}
        </div>

        <div className="chat-input-area">
          <div className="chat-suggestions">
            <button className="chat-sugg-btn" onClick={() => handleSendChat("Nên chọn ngành nào nếu giỏi Toán?", false)}>Nên chọn ngành nào nếu giỏi Toán?</button>
            <button className="chat-sugg-btn" onClick={() => handleSendChat("Cơ hội việc làm ngành AI", false)}>Cơ hội việc làm ngành AI</button>
            <button className="chat-sugg-btn" onClick={() => handleSendChat("Học phí trung bình khối A01", false)}>Học phí trung bình khối A01</button>
          </div>
          
          {imagePreview && (
              <div style={{display: 'inline-block', position: 'relative', marginBottom: '10px'}}>
                  <img src={imagePreview} alt="Preview" style={{height: '60px', borderRadius: '8px', border: '2px solid #e2e8f0'}} />
                  <button onClick={handleRemoveImage} style={{position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>X</button>
              </div>
          )}

          <div className="chat-input-box">
            <input type="file" accept="image/*" ref={fileInputRef} style={{display: 'none'}} onChange={handleImageChange} />
            <button className="icon-btn" onClick={() => fileInputRef.current.click()} style={{ color: '#6366f1' }}><i className="fas fa-image"></i></button>
            <button className="icon-btn" onClick={() => { setIsMuted(!isMuted); window.speechSynthesis.cancel(); }} style={{ color: isMuted ? '#ef4444' : '#9ca3af' }}>
              <i className={isMuted ? "fas fa-volume-mute" : "fas fa-volume-up"}></i>
            </button>
            <input type="text" placeholder={isRecording ? "Đang lắng nghe..." : "Nhập câu hỏi hoặc bấm Micro..."} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChat(chatInput, false)} disabled={isRecording} />
            <button className="icon-btn" onClick={toggleListening} style={{ color: isRecording ? '#ef4444' : '#9ca3af' }}>
              <i className={isRecording ? "fas fa-stop-circle" : "fas fa-microphone"}></i>
            </button>
            <button className="send-btn" onClick={() => handleSendChat(chatInput, false)} disabled={loading || isRecording}><i className="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>

      {/* ==========================================
          SIDEBAR PROFILE BÊN PHẢI (ĐÃ NÂNG CẤP BẢNG ĐIỂM)
          ========================================== */}
      <aside className="chat-profile-panel">
        
        {/* HỒ SƠ CÁ NHÂN */}
        <div className="chat-panel-section" style={{marginBottom: '15px'}}>
          <div className="profile-header-card">
            <div className="avatar"><img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Avatar" /></div>
            <div>
              <h3 style={{ color: '#0f172a', fontWeight: '800', margin: '0' }}>
                {userProfile?.name || "Đang tải..."}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '5px 0 0 0' }}>
                {userProfile ? `Lớp ${userProfile.class} - ${userProfile.school}` : "Đang đồng bộ..."}
              </p>
            </div>
          </div>
        </div>

        {/* 🚀 BẢNG ĐIỂM 6 Ô VUÔNG CHUẨN XÁC THEO ẢNH */}
        <div className="chat-panel-section" style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #f1f5f9', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '1rem', marginTop: 0, marginBottom: '15px' }}>
            <i className="fas fa-graduation-cap" style={{color: '#4338ca'}}></i> Điểm số học thuật
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {(userProfile?.displayScores || Array(6).fill({label: '', value: '-'})).map((item, idx) => {
              const hasValue = item.value && item.value !== '-';
              return (
                <div key={idx} style={{
                  backgroundColor: hasValue ? '#f0f4ff' : '#f8fafc',
                  border: `1px solid ${hasValue ? '#dbeafe' : '#f1f5f9'}`,
                  borderRadius: '12px',
                  padding: '12px 5px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '85px',
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>{item.label}</span>
                  <strong style={{ fontSize: '16px', color: hasValue ? '#4338ca' : '#cbd5e1', fontWeight: '800' }}>
                    {item.value}
                  </strong>
                </div>
              )
            })}
          </div>
        </div>

        <div className="chat-panel-section">
          <h4>KẾT QUẢ ĐÁNH GIÁ NĂNG LỰC</h4>
          
          {/* 1. Nhóm Holland */}
          <div className="job-card match" style={{backgroundColor: '#eff6ff', borderColor: '#bfdbfe', padding: '12px', marginBottom: '10px'}}>
            <div className="job-header">
              <h5><i className="fas fa-brain" style={{color: '#3b82f6'}}></i> Nhóm Holland</h5>
            </div>
            {userProfile?.holland_personality ? (
              <p style={{fontSize: '13px', color: '#1e3a8a', margin: '5px 0 0 0', fontWeight: 'bold'}}>{userProfile.holland_personality}</p>
            ) : (
              <button onClick={() => window.location.href='/quiz'} style={{marginTop: '10px', padding: '5px 10px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Làm bài Test &rarr;</button>
            )}
          </div>

          {/* 2. Nhóm MBTI */}
          <div className="job-card match" style={{backgroundColor: '#faf5ff', borderColor: '#e9d5ff', padding: '12px', marginBottom: '10px'}}>
            <div className="job-header">
              <h5><i className="fas fa-fingerprint" style={{color: '#a855f7'}}></i> Nhóm MBTI</h5>
            </div>
            {userProfile?.mbti_personality ? (
              <p style={{fontSize: '13px', color: '#4c1d95', margin: '5px 0 0 0', fontWeight: 'bold'}}>{userProfile.mbti_personality}</p>
            ) : (
              <button onClick={() => window.location.href='/quiz'} style={{marginTop: '10px', padding: '5px 10px', fontSize: '12px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Làm bài Test &rarr;</button>
            )}
          </div>

          {/* 3. Đa trí thông minh (MI) */}
          <div className="job-card match" style={{backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', padding: '12px', marginBottom: '10px'}}>
            <div className="job-header">
              <h5><i className="fas fa-puzzle-piece" style={{color: '#10b981'}}></i> Đa trí thông minh (MI)</h5>
            </div>
            {userProfile?.mi_personality ? (
              <p style={{fontSize: '13px', color: '#065f46', margin: '5px 0 0 0', fontWeight: 'bold'}}>{userProfile.mi_personality}</p>
            ) : (
              <button onClick={() => window.location.href='/quiz'} style={{marginTop: '10px', padding: '5px 10px', fontSize: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Làm bài Test &rarr;</button>
            )}
          </div>

          {/* 4. Chỉ số ý chí (Grit) */}
          <div className="job-card match" style={{backgroundColor: '#fffbeb', borderColor: '#fde68a', padding: '12px', marginBottom: '10px'}}>
            <div className="job-header">
              <h5><i className="fas fa-fire" style={{color: '#f59e0b'}}></i> Chỉ số ý chí (Grit)</h5>
            </div>
            {userProfile?.grit_personality ? (
              <p style={{fontSize: '13px', color: '#92400e', margin: '5px 0 0 0', fontWeight: 'bold'}}>{userProfile.grit_personality}</p>
            ) : (
              <button onClick={() => window.location.href='/quiz'} style={{marginTop: '10px', padding: '5px 10px', fontSize: '12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Làm bài Test &rarr;</button>
            )}
          </div>

          {/* 5. Tư duy phát triển (Mindset) */}
          <div className="job-card match" style={{backgroundColor: '#eef2ff', borderColor: '#c7d2fe', padding: '12px'}}>
            <div className="job-header">
              <h5><i className="fas fa-seedling" style={{color: '#6366f1'}}></i> Tư duy (Mindset)</h5>
            </div>
            {userProfile?.mindset_personality ? (
              <p style={{fontSize: '13px', color: '#3730a3', margin: '5px 0 0 0', fontWeight: 'bold'}}>{userProfile.mindset_personality}</p>
            ) : (
              <button onClick={() => window.location.href='/quiz'} style={{marginTop: '10px', padding: '5px 10px', fontSize: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Làm bài Test &rarr;</button>
            )}
          </div>
        </div>

        {/* =========================================
            HIỂN THỊ AI GỢI Ý NGHỀ NGHIỆP
            ========================================= */}
        <div className="chat-panel-section" style={{ marginTop: '25px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', textTransform: 'uppercase' }}>
            <i className="fas fa-robot" style={{color: '#6366f1'}}></i> Gợi ý nghề nghiệp AI
          </h4>
          
          {userProfile?.careers && userProfile.careers.length > 0 ? (
            <div className="careers-grid">
              {userProfile.careers.map((career, idx) => {
                const isTop = career.top === true || career.is_top === 1 || career.is_top === true;
                
                return (
                  <div 
                    key={idx} 
                    className="job-card" 
                    onClick={() => handleSendChat(`Hãy tư vấn chi tiết cho mình về nghề ${career.title} dựa trên điểm số và tính cách của mình.`, false)}
                    style={{
                      padding: '16px',
                      marginBottom: '12px',
                      backgroundColor: isTop ? '#fffbeb' : '#ffffff', 
                      border: '1px solid',
                      borderColor: isTop ? '#fde68a' : '#e5e7eb',
                      borderLeft: isTop ? '4px solid #f59e0b' : '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                  >
                    
                    <div className="job-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: isTop ? '#fef3c7' : '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isTop ? '#d97706' : '#6b7280',
                        fontSize: '18px'
                      }}>
                        <i className={career.icon || 'fas fa-briefcase'}></i>
                      </div>
                      
                      <div>
                        <h5 style={{ margin: 0, fontSize: '15px', color: '#1f2937', fontWeight: '800' }}>
                          {career.title} 
                          {isTop && (
                            <span style={{
                              fontSize: '10px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', 
                              color: 'white', padding: '3px 8px', borderRadius: '12px', marginLeft: '8px', fontWeight: 'bold'
                            }}>
                              <i className="fas fa-star" style={{marginRight: '3px', fontSize: '8px'}}></i> Match
                            </span>
                          )}
                        </h5>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 8px 54px', lineHeight: '1.5' }}>
                      {career.desc || career.description}
                    </p>

                    <small style={{ color: '#6366f1', fontSize: '12px', marginLeft: '54px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fas fa-magic"></i> Bấm để AI tư vấn chi tiết
                    </small>
                    
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{fontSize: '13px', color: '#64748b', fontStyle: 'italic', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center'}}>
              Vui lòng làm bài Trắc nghiệm để AI có cơ sở đưa ra những gợi ý nghề nghiệp chính xác nhất nhé!
            </p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Chatbot;