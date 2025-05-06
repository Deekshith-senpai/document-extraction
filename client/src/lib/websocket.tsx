import React, { createContext, useContext, useEffect, useState } from "react";
// Define DocumentUpdate interface locally to avoid import issues
interface DocumentUpdate {
  type: "document_update" | "stats_update";
  documentId?: string;
  status?: string;
  progress?: number;
  currentStep?: string;
  stepProgress?: string;
  error?: string;
  llmProvider?: string;
  activeDocuments?: number;
  processedToday?: number;
  failedDocuments?: number;
  systemStatus?: boolean;
}

interface WebSocketContextValue {
  connected: boolean;
  sendMessage: (message: any) => void;
  lastMessage: DocumentUpdate | null;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  connected: false,
  sendMessage: () => {},
  lastMessage: null,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<DocumentUpdate | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Fixed WebSocket URL - explicitly using the API path with proper port
  const getWebSocketUrl = () => {
    // Get the current window origin
    const origin = window.location.origin;
    
    // Replace http/https with ws/wss
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log(`WebSocket URL: ${wsUrl}`);
    return wsUrl;
  };

  const connectWebSocket = () => {
    try {
      const wsUrl = getWebSocketUrl();
      
      // If there's an existing socket, close it properly
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
      
      console.log(`Attempting to connect to WebSocket at ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      
      // Setup ping-pong to keep connection alive (client-side heartbeat)
      let pingInterval: number | null = null;
      
      ws.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        setConnected(true);
        setReconnectAttempts(0); // Reset reconnect attempts on successful connection
        
        // Send a ping every 20 seconds (server ping interval is 30 seconds)
        pingInterval = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            // Simple ping message
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Only log non-ping/pong messages
          if (data.type !== 'ping' && data.type !== 'pong') {
            console.log("📥 WebSocket message received:", data);
          }
          
          setLastMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log(`❌ WebSocket disconnected (code: ${event.code}, reason: ${event.reason || 'No reason provided'})`);
        setConnected(false);
        
        // Clear the ping interval
        if (pingInterval) {
          window.clearInterval(pingInterval);
        }
        
        // Don't attempt to reconnect if this was a normal closure (code 1000)
        if (event.code !== 1000) {  
          // Attempt to reconnect with exponential backoff, capped at 30 seconds
          const backoffTime = Math.min(3000 * Math.pow(1.5, reconnectAttempts), 30000);
          console.log(`⏱️ Will attempt to reconnect in ${backoffTime}ms (attempt ${reconnectAttempts + 1})`);
          
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            setSocket(null);  // This will trigger a reconnection via the useEffect
          }, backoffTime);
        }
      };

      ws.onerror = (error) => {
        console.error("⚠️ WebSocket error:", error);
        // Let the onclose handler deal with reconnection
      };

      setSocket(ws);
      return ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      
      // Schedule a retry
      setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        setSocket(null);
      }, 5000);
      
      return null;
    }
  };

  useEffect(() => {
    const ws = connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [reconnectAttempts]);

  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  };

  return (
    <WebSocketContext.Provider value={{ connected, sendMessage, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};