'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const faqs = [
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon'],
    response: "👋 Hello! Welcome to NADS BEAUTY BAR. How can I help you today? You can ask me about products, orders, delivery, or our services."
  },
  {
    keywords: ['price', 'cost', 'how much', 'expensive', 'cheap'],
    response: "💰 All our product prices are clearly displayed on each product page. We offer competitive prices with regular sales and discounts. Check the 'SALE' badges for special offers!"
  },
  {
    keywords: ['delivery', 'shipping', 'deliver', 'ship', 'how long', 'when'],
    response: "🚚 We offer delivery across Ghana. Delivery typically takes 1-3 business days. Delivery fee is GHS 30. We also offer pickup at our studio in Kumasi, Ashanti Region."
  },
  {
    keywords: ['payment', 'pay', 'how to pay', 'payment method', 'mobile money'],
    response: "💳 We currently accept orders via WhatsApp. After placing your order, you'll receive a WhatsApp message with your order details. Payment can be arranged directly with our team via phone or WhatsApp."
  },
  {
    keywords: ['return', 'refund', 'exchange', 'wrong size', 'damage'],
    response: "🔄 We accept returns within 7 days of delivery for items that are damaged or the wrong size. Please contact us on WhatsApp with your order number and a photo of the issue."
  },
  {
    keywords: ['size', 'sizing', 'what size', 'fit', 'measurement'],
    response: "📏 We provide size options (S, M, L, XL, etc.) for each product. If you're unsure about sizing, please contact us on WhatsApp and we'll help you find the perfect fit!"
  },
  {
    keywords: ['order', 'my order', 'where is my order', 'order status'],
    response: "📦 You can track your order by contacting us on WhatsApp with your order number. Orders are typically processed within 24-48 hours."
  },
  {
    keywords: ['service', 'makeup', 'bridal', 'event', 'home service', 'facial'],
    response: "💄 We offer professional makeup services including bridal makeup, event makeup, home services, skincare facials, lash & brow services, and nail services. Call us to book!"
  },
  {
    keywords: ['contact', 'call', 'phone', 'whatsapp', 'email', 'reach'],
    response: "📞 You can reach us on:\n• Phone/WhatsApp: +233201404264\n• Email: nadsbeautybars@gmail.com\n• Instagram: @Nads__beauty\n• Facebook: Nads Beauty Bar"
  },
  {
    keywords: ['location', 'where', 'address', 'studio', 'shop'],
    response: "📍 We are located at Akobalm Balm Street, Sepe Timpon, near Benab Oil in Kumasi, Ashanti Region. We also offer home services!"
  },
  {
    keywords: ['business hours', 'open', 'close', 'time', 'hours'],
    response: "🕐 Our business hours are Monday - Saturday, 9:00 AM - 6:00 PM. For urgent inquiries, feel free to call or WhatsApp us!"
  },
  {
    keywords: ['thanks', 'thank you', 'thanks', 'appreciate'],
    response: "🙏 You're welcome! Thank you for visiting NADS BEAUTY BAR. Is there anything else I can help you with?"
  }
]

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hello! Welcome to NADS BEAUTY BAR. I'm here to help! Ask me about products, orders, delivery, or our services.",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const findResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for matches
    for (const faq of faqs) {
      if (faq.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return faq.response
      }
    }
    
    // Default response
    return "🤔 I'm not sure about that. Please contact us directly on WhatsApp at +233201404264 for more specific help. You can also check our FAQ page or product descriptions!"
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(() => {
      const response = findResponse(userMessage.text)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 500 + Math.random() * 500)
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-pink-600 text-white p-4 rounded-full shadow-lg hover:bg-pink-700 transition transform hover:scale-110"
          aria-label="Open chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Nads Beauty Assistant</h3>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-pink-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[10px] opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 transition disabled:opacity-50 text-sm font-medium"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}