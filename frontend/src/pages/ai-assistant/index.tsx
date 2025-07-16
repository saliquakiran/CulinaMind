import { FC, useState, useRef, useEffect } from "react";
import { sendChatMessage, checkAIServiceHealth } from "../../services/api";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistantTab: FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI cooking assistant. I can help you with recipe suggestions, cooking tips, ingredient substitutions, and more. What would you like to know about cooking today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    checkConnection();
  }, [messages]);

  const checkConnection = async () => {
    try {
      const health = await checkAIServiceHealth();
      setIsConnected(health.success && health.status === 'healthy');
    } catch (error) {
      setIsConnected(false);
      console.error("AI service health check failed:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send message to AI backend
      const response = await sendChatMessage(inputValue.trim());
      
      if (response.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Handle error response
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Handle network/API errors
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, but I'm currently unable to connect to my knowledge base. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🤖</div>
        <h2 className="text-2xl font-bold text-[#9A61B0] mb-2">
          AI Cooking Assistant
        </h2>
        <p className="text-gray-600">
          Get personalized cooking tips, recipe modifications, and culinary guidance
        </p>
        {/* Connection Status */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
          isConnected 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          {isConnected ? 'AI Service Connected' : 'AI Service Disconnected'}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-xl border border-purple-200 shadow-lg flex flex-col min-h-[500px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? "bg-[#9A61B0] text-white rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.isUser ? "text-purple-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about cooking, recipes, or culinary techniques..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={!isConnected}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || !isConnected}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                !inputValue.trim() || isLoading || !isConnected
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#9A61B0] text-white hover:bg-[#8A50A0] hover:shadow-lg transform hover:scale-105"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          
          {/* Quick Suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "How do I make fluffy pancakes?",
              "What can I substitute for eggs?",
              "How to cook rice perfectly?",
              "Quick dinner ideas"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputValue(suggestion)}
                disabled={!isConnected}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  isConnected
                    ? 'bg-purple-50 text-[#9A61B0] border-purple-200 hover:bg-purple-100'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantTab; 