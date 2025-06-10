import { useState, useEffect, useRef } from 'react';

// --- Ícones SVG como componentes para reutilização ---
const AssistantIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z"></path>
  </svg>
);

const CloseIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);


// --- Componente principal do Chat ---
const Chat = () => {
  // === ESTADO DO COMPONENTE ===
  const [isOpen, setIsOpen] = useState(false); // Novo estado para controlar a visibilidade do chat
  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Só rola a tela se o chat estiver aberto
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  // === LÓGICA DE ENVIO (Inalterada) ===
  const handleSendMessage = async () => {
    const messageText = userInput.trim();
    if (messageText === '' || isLoading) return;

    const newUserMessage = { role: 'user', text: messageText };
    setHistory(prevHistory => [...prevHistory, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    const requestBody = {
      contents: [...history, newUserMessage].map(msg => ({ role: msg.role, text: msg.text }))
    };
    
    try {
      const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHJpbmciLCJlbWFpbCI6InN0cmluZ0BnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9zaWQiOiJjMTJiMzlhMC0zYTMxLTQwMTEtYWFjMy01NDliODUwNTUxOGYiLCJqdGkiOiJiMmFhOThjMy0zMjZjLTRhZTctOWQ5NC0zM2I5MTgyMjM3MzEiLCJleHAiOjE3NDk1ODA2OTcsImlzcyI6IlNldUlzc3VlciIsImF1ZCI6IlNldUF1ZGllbmNlIn0.L6kPoIvJHFZsoXdViGkJoSLhXhp0QkZAfZKlGeFcWDU";
      const response = await fetch('https://localhost:7155/gemini/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) throw new Error('Falha na resposta da rede.');

      const data = await response.json();
      const modelResponse = { role: 'model', text: data.response };
      setHistory(prevHistory => [...prevHistory, modelResponse]);

    } catch (err) {
      setError('Desculpe, ocorreu um erro ao buscar a resposta.');
      console.error("Erro ao chamar a API:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendMessage();
    }
  };

  // === RENDERIZAÇÃO DO COMPONENTE ===
  return (
    <>
      {/* --- Janela do Chat (Renderização Condicional) --- */}
      <div 
        className={`
          fixed bottom-28 right-4 sm:right-8
          w-[calc(100%-2rem)] max-w-lg h-[70vh]
          bg-white rounded-lg shadow-2xl flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        {/* Header do Chat */}
        <div className="bg-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="font-bold text-lg">Assistente Virtual - Anuncia Picos</h3>
          <button onClick={() => setIsOpen(false)} className="hover:opacity-75 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Caixa de Mensagens */}
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 bg-gray-50">
          {history.map((msg, index) => (
            <div key={index} className={`p-3 rounded-xl max-w-[85%] break-words ${msg.role === 'user' ? 'bg-purple-600 text-white self-end' : 'bg-white text-gray-800 self-start shadow-sm'}`}>
              {msg.text.split('\n').map((line, i) => <p key={i} className="m-0">{line || '\u00A0'}</p>)}
            </div>
          ))}
          {isLoading && (<div className="p-3 rounded-xl max-w-[75%] bg-white text-gray-800 self-start shadow-sm"><div className="flex items-center gap-2"><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span></div></div>)}
          {error && (<div className="p-3 rounded-lg bg-red-100 text-red-700 self-start">{error}</div>)}
          <div ref={chatEndRef} />
        </div>

        {/* Área de Input */}
        <div className="p-4 bg-white border-t border-gray-200 text-black">
          <div className="flex items-center gap-2">
            <input type="text" className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Digite sua mensagem..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={handleKeyPress} disabled={isLoading}/>
            <button className="w-12 h-12 bg-purple-600 text-white rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-semibold hover:bg-purple-700 hover:cursor-pointer transition-colors disabled:bg-purple-700" onClick={handleSendMessage} disabled={isLoading}>↑</button>
          </div>
        </div>
      </div>

      {/* --- Botão Flutuante --- */}
      <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="fixed bottom-6 right-4 sm:right-8 w-16 h-16 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-110"
          aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
          {isOpen ? <CloseIcon /> : <AssistantIcon />}
      </button>
    </>
  );
};

export default Chat;