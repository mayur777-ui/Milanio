'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';

export type ChatMessage = {
  id: string;
  senderid: string;
  senderName?: string;
  message: string;
  timestamp: string;
};

interface ChatProps {
  socket: any;
  roomId: string;
  userid: string;
  isOpen: boolean;
  onClose: () => void;
  onMessageReceived?: () => void;
}

const Chat: React.FC<ChatProps> = React.memo(
  ({ socket, roomId, userid, isOpen, onClose, onMessageReceived }) => {
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const [input, setInput] = useState<string>('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const message = input.trim();
      if (!message) return;

      socket?.emit('start-chat', { roomId, message, OwnuserId: userid });
      setInput('');
    };

    useEffect(() => {
      if (!socket) return;

      const handleIncomingMessage = ({
        message,
        senderid,
        senderName,
      }: {
        message: string;
        senderid: string;
        senderName?: string;
      }) => {
        const newMsg: ChatMessage = {
          id: crypto.randomUUID(),
          senderid,
          senderName,
          message,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setChatMessages((prev) => [...prev, newMsg]);

        if (senderid !== userid && onMessageReceived) {
          onMessageReceived();
        }
      };

      socket.on('chat:started', handleIncomingMessage);

      return () => {
        socket.off('chat:started', handleIncomingMessage);
      };
    }, [socket, userid, onMessageReceived]);

    if (!isOpen) return null;

    return (
      <aside
        aria-label="In-call chat"
        className="w-full sm:w-80 md:w-96 h-full flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-l border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 z-30 transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">In-Call Messages</h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Visible only to call participants</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center mb-3 text-zinc-400 dark:text-zinc-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No messages yet</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Say hello or share links with others in this meeting.
              </p>
            </div>
          ) : (
            chatMessages.map(({ id, senderid, senderName, message, timestamp }) => {
              const isMine = senderid === userid;
              return (
                <div
                  key={id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-1 px-1">
                    {isMine ? 'You' : (senderName || `User (${senderid.slice(0, 6)})`)} • {timestamp}
                  </span>
                  <div
                    className={`max-w-[85%] px-3.5 py-2 text-sm leading-relaxed ${
                      isMine
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium rounded-2xl rounded-tr-sm shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    <p className="break-words">{message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Compose Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/70 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 transition-all">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Send a message..."
              className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none py-1"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </aside>
    );
  }
);

Chat.displayName = 'Chat';

export default Chat;
