'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, getSocketStatus } from '@/utility/getSocket';
import { useUserid } from './UserIdcontext';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  socketId: string | null;
  ready: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);


export const SocketProvider = ({children}:{
    children:React.ReactNode,
})=>{
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | null>(null);
    const initRef = useRef(false);
    const userId = useUserid(); 
    const [ready, setReady] = useState(false);
//     useEffect(() => {
//   console.log("🔥 SocketProvider mounted");

//   return () => {
//     console.log("🧹 SocketProvider unmounted");
//   };
// }, []);
    
    useEffect(() => {
        // Prevent multiple initializations
        if (initRef.current || !userId) return;
        
        // console.log("🚀 SocketProvider: Initializing socket context");
        
        // Get the global socket instance
        const socketInstance = getSocket(userId);
        console.log(socketInstance)
        if (socketInstance) {
            setSocket(socketInstance);
            setIsConnected(socketInstance.connected);
            setSocketId(socketInstance.id || null);
            
            // Event handlers
            const handleConnect = () => {
                console.log('✅ SocketContext: Connected with ID:', socketInstance.id);
                setIsConnected(true);
                setSocketId(socketInstance.id || null);
            };

            const handleDisconnect = (reason: string) => {
                console.log('❌ SocketContext: Disconnected:', reason);
                setIsConnected(false);
            };

            const handleConnectError = (error: Error) => {
                console.log('🚫 SocketContext: Connection error:', error);
                setIsConnected(false);
            };

            // Add event listeners
            socketInstance.on('connect', handleConnect);
            socketInstance.on('disconnect', handleDisconnect);
            socketInstance.on('connect_error', handleConnectError);
            
            // Set initial state if already connected
            if (socketInstance.connected) {
                handleConnect();
            }
            
            initRef.current = true;
            
            setReady(true);

            // Cleanup function - only remove listeners, DOESN'T destroy socket
            return () => {
                console.log("🧹 SocketProvider: Cleaning up event listeners");
                socketInstance.off('connect', handleConnect);
                socketInstance.off('disconnect', handleDisconnect);
                socketInstance.off('connect_error', handleConnectError);
            };
        }
    }, [userId]); // Empty deps - run only once
    

    // Debug logging
    useEffect(() => {
        const interval = setInterval(() => {
            const status = getSocketStatus();
            // console.log("🔍 Socket Status Check:", status);
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);
    
    const contextValue = {
        socket,
        isConnected,
        socketId,
        ready
    };
    
    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () =>{
    const context = useContext(SocketContext);
    if(!context){
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}


