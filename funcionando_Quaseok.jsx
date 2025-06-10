import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

// Componentes de ícones simples (mantidos como estavam)
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22,2 15,22 11,13 2,9"></polygon>
  </svg>
);

const UsersIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const MessageCircleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const CircleIcon = ({ className }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="10" fill="currentColor"></circle>
  </svg>
);

const UserIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);


// Componente principal do Chat
const ChatSystem = () => {
  const [connection, setConnection] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: 1, name: "Usuário Atual" }); // Configure com seus dados

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeConversationRef = useRef(activeConversation); // Usar ref para ter o valor mais atual nos listeners

  // URL base da API
  const API_BASE_URL = 'https://localhost:7155';
  
  // Token de autenticação
  const getAuthToken = () => {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHJpbmciLCJlbWFpbCI6InN0cmluZ0BnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9zaWQiOiJjMTJiMzlhMC0zYTMxLTQwMTEtYWFjMy01NDliODUwNTUxOGYiLCJqdGkiOiI2ZDRkZmViZi1iNGEyLTRmNDktYTQzMi01YzVhNGFjMzc0MjMiLCJleHAiOjE3NDk0MTEyNjAsImlzcyI6IlNldUlzc3VlciIsImF1ZCI6IlNldUF1ZGllbmNlIn0.EIhcVubwrCXG37IIcG0AJJqx3hfToC1nTmbYt5YIzqU'
  }
  // Atualiza a ref sempre que activeConversation mudar
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Efeito 1: Cria e estabelece a conexão SignalR UMA VEZ
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/chathub`, {
        accessTokenFactory: () => getAuthToken()
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []); // <-- Array de dependências vazio, executa apenas uma vez

  // Efeito 2: Inicia a conexão e registra os listeners UMA VEZ
  useEffect(() => {
    if (connection && connection.state === 'Disconnected') {
      connection.start()
        .then(() => {
          console.log('Conectado ao SignalR');
          setIsConnected(true);
          loadConversations();
          loadUnreadCount();

          // --- Início dos Listeners ---
          
          connection.on('ReceiveMessage', (message) => {
            console.log('Nova mensagem recebida:', message);
            const currentActiveConvo = activeConversationRef.current;
            
            if (currentActiveConvo && message.conversationId === currentActiveConvo.conversationId) {
              setMessages(prev => [...prev, message]);
              if (message.senderId !== currentUser?.id) {
                markMessagesAsRead(currentActiveConvo.conversationId);
              }
            }
            
            loadConversations();
            loadUnreadCount();
          });

          connection.on('MessagesMarkedAsRead', (data) => {
            console.log('Mensagens marcadas como lidas:', data);
            const currentActiveConvo = activeConversationRef.current;
            if (currentActiveConvo && data.conversationId === currentActiveConvo.conversationId) {
              setMessages(prev => prev.map(msg =>
                msg.senderId === currentUser?.id ? { ...msg, isRead: true } : msg
              ));
            }
          });

          connection.on('UserTyping', (data) => {
            const currentActiveConvo = activeConversationRef.current;
            if (currentActiveConvo && data.conversationId === currentActiveConvo.conversationId) {
              setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (data.isTyping) {
                  newSet.add(data.userName);
                } else {
                  newSet.delete(data.userName);
                }
                return newSet;
              });
            }
          });

          connection.on('UserJoinedConversation', (data) => {
            console.log('Usuário entrou na conversa:', data);
          });

          connection.on('UserLeftConversation', (data) => {
            console.log('Usuário saiu da conversa:', data);
          });
          
          // --- Fim dos Listeners ---

          connection.onreconnected(() => {
            console.log('Reconectado ao SignalR');
            setIsConnected(true);
            const currentActiveConvo = activeConversationRef.current;
            if (currentActiveConvo) {
              joinConversation(currentActiveConvo.conversationId);
            }
          });

          connection.onclose(() => {
            console.log('Desconectado do SignalR');
            setIsConnected(false);
          });

        })
        .catch(err => {
          console.error('Erro ao conectar SignalR:', err);
          setIsConnected(false);
        });
    }
  }, [connection, currentUser?.id]); // Depende apenas da conexão e do ID do usuário

  // Função para fazer requisições autenticadas
  const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // Carregar conversas do usuário
  const loadConversations = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/message/conversations`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  // Carregar contador de mensagens não lidas
  const loadUnreadCount = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/message/unread-count`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Erro ao carregar contador não lidas:', error);
    }
  };

  // Entrar em uma conversa
  const joinConversation = async (conversationId) => {
    if (connection && connection.state === 'Connected') {
      try {
        await connection.invoke('JoinConversation', conversationId);
        console.log(`Entrou na conversa: ${conversationId}`);
      } catch (error) {
        console.error('Erro ao entrar na conversa:', error);
      }
    }
  };

  // Sair de uma conversa
  const leaveConversation = async (conversationId) => {
    if (connection && connection.state === 'Connected') {
      try {
        await connection.invoke('LeaveConversation', conversationId);
        console.log(`Saiu da conversa: ${conversationId}`);
      } catch (error) {
        console.error('Erro ao sair da conversa:', error);
      }
    }
  };

  // Selecionar conversa ativa
  const selectConversation = async (conversation) => {
    if (activeConversation?.conversationId === conversation.conversationId) return;

    if (activeConversation) {
      await leaveConversation(activeConversation.conversationId);
    }
    
    setActiveConversation(conversation);
    await joinConversation(conversation.conversationId);
    await loadMessages(conversation.conversationId);
    await markMessagesAsRead(conversation.conversationId);
  };

  // Carregar mensagens da conversa
  const loadMessages = async (conversationId) => {
    setLoading(true);
    setMessages([]); // Limpa as mensagens antigas
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/message/history/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data.sort((a, b) => new Date(a.created) - new Date(b.created)) : []);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Marcar mensagens como lidas
  const markMessagesAsRead = async (conversationId) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/message/mark-as-read/${conversationId}`, {
        method: 'PUT'
      });
      loadUnreadCount();
      loadConversations();
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

// Substitua esta função no seu arquivo .jsx

// Substitua esta função no seu arquivo .jsx - ESTA É A VERSÃO CORRETA

// Substitua a sua função sendMessage por esta versão final

const sendMessage = async (e) => {
  e.preventDefault();
  
  if (!newMessage.trim() || !activeConversation || !isConnected) return;

  try {
    // Chamando o endpoint da sua controller via HTTP POST
    const response = await fetchWithAuth(`${API_BASE_URL}/message/send`, {
      method: 'POST',
      body: JSON.stringify({
        receiverId: activeConversation.otherUserId,
        message: newMessage.trim()
      })
    });

    if (response.ok) {
      // 1. PEGA A RESPOSTA DA API: A controller retorna a mensagem completa que foi salva no banco.
      const sentMessage = await response.json(); 
      
      // 2. ATUALIZAÇÃO OTIMISTA: Adiciona a mensagem que VOCÊ enviou diretamente ao estado da UI.
      setMessages(prev => [...prev, sentMessage]);

      // 3. Limpa o input
      setNewMessage('');
      stopTyping();
      
      // 4. BÔNUS: Atualiza a lista de conversas para refletir a "última mensagem"
      loadConversations();

    } else {
      console.error('Erro ao enviar mensagem para a API');
      // Adicional: Informar o usuário sobre o erro na UI, se desejar.
    }
  } catch (error) {
    console.error('Erro de rede ao enviar mensagem:', error);
  }
};

  // Notificar digitação
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && connection && isConnected && activeConversation) {
      setIsTyping(true);
      connection.invoke('NotifyTyping', activeConversation.conversationId, currentUser?.name || 'Usuário');
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  // Parar notificação de digitação
  const stopTyping = () => {
    if (isTyping && connection && isConnected && activeConversation) {
      setIsTyping(false);
      connection.invoke('NotifyStoppedTyping', activeConversation.conversationId, currentUser?.name || 'Usuário');
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Lista de Conversas */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MessageCircleIcon size={20} />
              Conversas
            </h2>
            <div className="flex items-center gap-2">
              <CircleIcon className={`w-3 h-3 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.conversationId}
              onClick={() => selectConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeConversation?.conversationId === conversation.conversationId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {conversation.otherUserProfilePicture ? (
                    <img
                      src={conversation.otherUserProfilePicture}
                      alt={conversation.otherUserName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon size={24} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.otherUserName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessageDate && formatDate(conversation.lastMessageDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.isLastMessageFromMe && 'Você: '}
                      {conversation.lastMessage || 'Sem mensagens'}
                    </p>
                    {conversation.unreadMessagesCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                        {conversation.unreadMessagesCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <div className="flex justify-center mb-4">
                <UsersIcon />
              </div>
              <p>Nenhuma conversa encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Header da Conversa */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {activeConversation.otherUserProfilePicture ? (
                    <img
                      src={activeConversation.otherUserProfilePicture}
                      alt={activeConversation.otherUserName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {activeConversation.otherUserName}
                  </h3>
                  {typingUsers.size > 0 && (
                    <p className="text-sm text-blue-500">
                      {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'está' : 'estão'} digitando...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === currentUser?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-end mt-1 space-x-2">
                        <span className="text-xs opacity-75">
                          {formatDate(message.created)}
                        </span>
                        {message.senderId === currentUser?.id && (
                          <span className="text-xs opacity-75">
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  onBlur={stopTyping}
                  placeholder={isConnected ? "Digite sua mensagem..." : "Conectando..."}
                  disabled={!isConnected}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="flex justify-center mb-4">
                <MessageCircleIcon size={64} />
              </div>
              <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
              <p>Escolha uma conversa para começar a enviar mensagens</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;