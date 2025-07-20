'use client';
import React, {useState, useRef, useEffect} from "react";


const Chat = React.memo(({socket,roomId,userid}: {socket: any,roomId:string, userid:string}) => {
    console.log("Chat component rendered");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const [input, setInput] = useState<string>("");
    type ChatMessage = {
        id: string;
        senderid: string;
        message: string;
        timestamp: string;
      };
      const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
      
      useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [chatMessages]);
     
       const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         setInput(e.target.value);
       };
     
       const handelSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
         e.preventDefault();
         if (!input || typeof input !== "string" || input.trim() === "") {
           // console.error('Invalid input:', input);
           return;
         }
     
         const message = input.trim();
         socket?.emit("start-chat", { roomId, message, OwnuserId: userid });
     
         setInput("");
       };
         useEffect(() => {
           socket?.on("chat:started", ({ message, senderid }:{message:string, senderid:string}) => {
             const newMsg: ChatMessage = {
               id: crypto.randomUUID(),
               senderid,
               message,
               timestamp: new Date().toLocaleTimeString([], {
                 hour: "2-digit",
                 minute: "2-digit",
               }),
             };
             setChatMessages((prev) => [...prev, newMsg]);
           });
       
           return () => {
             socket?.off("chat:started");
           };
         }, [socket]);
    return(
        <>
         {!isChatOpen && (
          <div className="fixed bottom-4 right-4 z-50">
            <button
                type="button"
              onClick={() => setIsChatOpen((prev) => !prev)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
            >
              💬
            </button>
          </div>
        )}
        

        {isChatOpen && (
          <div className="fixed bottom-16 right-4 z-50 w-80 bg-gray-800 rounded-lg shadow-xl flex flex-col h-[80vh]">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-t-lg">
              <h3 className="text-white font-semibold">Meeting Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map(({ id, senderid, message, timestamp }) => {
                const isMine = senderid === userid;
                return (
                  <div
                    key={id}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        isMine
                          ? "bg-blue-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      <p className="text-sm">{message}</p>
                      <p className="text-xs opacity-70 mt-1">{timestamp}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form
              className="p-3 border-t border-gray-600"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                onClick={handelSubmit}
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
        </>
    )
});
export default Chat;

