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

  // --- CÁC STATE CHO CHỨC NĂNG MỚI (TÌM KIẾM, XÓA, CÀI ĐẶT) ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isSearchActive, setIsSearchActive] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [showSettings, setShowSettings] = useState(false); 

  // 🚀 --- STATE CHO CÀI ĐẶT TƯ DUY AI VÀ GIAO DIỆN ---
  const [aiStyle, setAiStyle] = useState('friendly'); // 'friendly' hoặc 'professional'
  const [aiLength, setAiLength] = useState('detailed'); // 'detailed' hoặc 'concise'
  const [theme, setTheme] = useState(localStorage.getItem('chat_theme') || 'light'); // Lưu Theme

  // Chống lỗi nếu localStorage trống
  const savedUser = JSON.parse(localStorage.getItem("user")) || {};

  // 🚀 Tự động lưu Theme khi người dùng đổi
  useEffect(() => {
    localStorage.setItem('chat_theme', theme);
  }, [theme]);

  // --- 1. TẢI HỒ SƠ & LỊCH SỬ CHAT KHI MỞ TRANG ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (savedUser && savedUser.id) {
        try {
          const profileRes = await fetch(`http://localhost:8000/api/get-full-profile/${savedUser.id}`);
          const profileData = await profileRes.json();
          if (profileRes.ok) {
            setUserProfile(profileData);
            
            const sessionRes = await fetch(`http://localhost:8000/api/chat/sessions/${savedUser.id}`);
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
          }
        } catch (error) {
          console.error("Lỗi lấy dữ liệu ban đầu:", error);
        } finally {
          setIsLoadingHistory(false); 
        }
      } else {
        setIsLoadingHistory(false);
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. HÀM CHỌN MỘT CUỘC TRÒ CHUYỆN BÊN SIDEBAR TRÁI ---
  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setChatMessages([]); 
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/chat/history/${sessionId}`);
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

  // --- 3. TẠO CUỘC TRÒ CHUYỆN MỚI ---
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setChatMessages([{ sender: 'bot', content: "Xin chào! Mình có thể giúp gì cho bạn?" }]);
  };

  // --- HÀM XÓA CUỘC TRÒ CHUYỆN ---
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation(); 
    if (!window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này?")) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(updatedSessions);
        if (currentSessionId === sessionId) {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error("Lỗi xóa session:", error);
    }
  };

  // --- HÀM ĐỌC GIỌNG NÓI ---
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

  // --- 4. HÀM GỬI TIN NHẮN ---
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

      if (userProfile && !selectedImage && chatMessages.length <= 1) {
          hiddenInstruction = ` \n\n(Chỉ thị hệ thống: Học sinh tên ${userProfile.name}, mục tiêu thi khối ${userProfile.target_block || 'chưa rõ'}. ${styleText}. ${lengthText}.)`;
      }
      
      smartPrompt += hiddenInstruction; 

      const response = await fetch('http://localhost:8000/api/chat', {
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

  const subjectNames = {
    toan: "Toán học", ly: "Vật lý", hoa: "Hóa học", sinh: "Sinh học", 
    van: "Ngữ văn", su: "Lịch sử", dia: "Địa lý", gdcd: "GDCD", anh: "Tiếng Anh"
  };

  const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // 🚀 Dòng thẻ quan trọng: Chèn class dark-mode dựa vào state theme
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

      {/* 🚀 ==========================================
          MODAL CÀI ĐẶT (ĐÃ THÊM CHỌN THEME)
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
                          <img src={school.logo} alt="logo" style={{width: '35px', height: '35px', objectFit: 'contain'}} onError={(e) => e.target.src="https://cdn-icons-png.flaticon.com/512/2941/2941658.png"} />
                          <div>
                            <strong style={{color: '#0f172a', fontSize: '14px'}}>{school.name}</strong>
                            <p style={{margin: 0, fontSize: '12px', color: '#64748b'}}>{school.major}</p>
                          </div>
                        </div>
                        <strong style={{color: '#6366f1'}}>{school.score}đ</strong>
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
          SIDEBAR PROFILE BÊN PHẢI
          ========================================== */}
      <aside className="chat-profile-panel">
        <div className="chat-panel-section">
          <h4>HỒ SƠ HỌC TẬP</h4>
          <div className="profile-header-card">
            <div className="avatar"><img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Avatar" /></div>
            <div>
              <h3>{userProfile ? userProfile.name : "Đang tải..."}</h3>
              <p>{userProfile ? `Lớp ${userProfile.class} - ${userProfile.school}` : "Đang đồng bộ..."}</p>
            </div>
          </div>
          
          <div className="score-grid">
            {userProfile?.scores && Object.keys(userProfile.scores).length > 0 ? Object.entries(userProfile.scores).map(([sub, val]) => (
              <div className="score-box" key={sub}>
                <span>{subjectNames[sub] || sub.toUpperCase()}</span>
                <strong>{val}</strong>
              </div>
            )) : (
              <p style={{fontSize: '13px', color: '#64748b'}}>Chưa có dữ liệu điểm.</p>
            )}
          </div>
        </div>

        <div className="chat-panel-section">
          <h4>KẾT QUẢ TÍNH CÁCH</h4>
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
          <div className="job-card match" style={{backgroundColor: '#faf5ff', borderColor: '#e9d5ff', padding: '12px'}}>
            <div className="job-header">
              <h5><i className="fas fa-fingerprint" style={{color: '#a855f7'}}></i> Nhóm MBTI</h5>
            </div>
            {userProfile?.mbti_personality ? (
              <p style={{fontSize: '13px', color: '#4c1d95', margin: '5px 0 0 0', fontWeight: 'bold'}}>{userProfile.mbti_personality}</p>
            ) : (
              <button onClick={() => window.location.href='/quiz'} style={{marginTop: '10px', padding: '5px 10px', fontSize: '12px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Làm bài Test &rarr;</button>
            )}
          </div>
        </div>

        <div className="chat-panel-section">
          <h4>GỢI Ý NGHỀ NGHIỆP AI</h4>
          {userProfile?.careers && userProfile.careers.length > 0 ? (
            userProfile.careers.map((job, idx) => (
              <div key={idx} className={`job-card ${job.top ? 'match' : ''}`} onClick={() => handleSendChat(`Hãy tư vấn chi tiết cho mình về nghề ${job.title} dựa trên điểm số và tính cách của mình.`, false)} style={{ cursor: 'pointer' }}>
                <div className="job-header">
                  <h5><i className={job.icon}></i> {job.title}</h5>
                  {job.top && <span className="badge-top">TOP MATCH</span>}
                </div>
                <p>{job.desc}</p>
                <small style={{color: '#6366f1', fontSize: '11px'}}>Bấm để xem tư vấn &rarr;</small>
              </div>
            ))
          ) : (
            <p style={{fontSize: '13px', color: '#64748b', fontStyle: 'italic'}}>AI cần bạn làm Trắc nghiệm để đưa ra gợi ý nghề nghiệp chính xác nhất!</p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Chatbot;