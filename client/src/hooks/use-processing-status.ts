import { useState, useEffect, useCallback, useRef } from "react";
import { Document } from "@shared/schema";
import { useToast } from "./use-toast";
import { useQueryClient } from "@tanstack/react-query";

type WebSocketMessage = {
  type: string;
  document?: Partial<Document>;
  stats?: {
    active: number;
    processed: number;
    failed: number;
    total: number;
  };
  status?: string;
};

export const useProcessingStatus = (documentIds: number[] = []) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeDocuments, setActiveDocuments] = useState<Partial<Document>[]>([]);
  const [systemStatus, setSystemStatus] = useState<string>("Connecting...");
  const [stats, setStats] = useState({
    active: 0,
    processed: 0,
    failed: 0,
    total: 0
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectWebSocket = useCallback(() => {
    // Use secure websocket protocol if page is loaded over HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the same host as the current page to avoid CORS and security issues
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
      
      // Subscribe to document updates for each ID
      documentIds.forEach(id => {
        ws.send(JSON.stringify({ type: 'subscribe', documentId: id }));
      });
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
      
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        connectWebSocket();
      }, 5000);
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };
    
    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'documentUpdate':
            if (message.document) {
              handleDocumentUpdate(message.document);
            }
            break;
            
          case 'statsUpdate':
            if (message.stats) {
              setStats(message.stats);
              
              // Update cached stats data
              queryClient.setQueryData(["/api/stats"], { stats: message.stats });
            }
            break;
            
          case 'systemStatus':
            if (message.status) {
              setSystemStatus(message.status);
            }
            break;
            
          default:
            console.log("Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    wsRef.current = ws;
    
    // Clean up function
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        documentIds.forEach(id => {
          ws.send(JSON.stringify({ type: 'unsubscribe', documentId: id }));
        });
        ws.close();
      }
    };
  }, [documentIds, queryClient]);

  const handleDocumentUpdate = useCallback((document: Partial<Document>) => {
    setActiveDocuments(prevDocs => {
      // Find if the document already exists in our list
      const existingIndex = prevDocs.findIndex(doc => doc.id === document.id);
      
      if (existingIndex >= 0) {
        // Update the existing document
        const updatedDocs = [...prevDocs];
        updatedDocs[existingIndex] = { ...prevDocs[existingIndex], ...document };
        
        // If the document is completed or failed, show a toast
        if (document.status === 'completed' && prevDocs[existingIndex].status === 'processing') {
          toast({
            title: "Processing completed",
            description: `Document ${document.originalName || document.name || 'Unknown'} has been processed successfully.`,
          });
        } else if (document.status === 'failed' && prevDocs[existingIndex].status === 'processing') {
          toast({
            title: "Processing failed",
            description: `Document ${document.originalName || document.name || 'Unknown'} processing failed: ${document.error || 'Unknown error'}`,
            variant: "destructive",
          });
        }
        
        // Remove completed/failed documents after 5 seconds
        if (document.status === 'completed' || document.status === 'failed') {
          setTimeout(() => {
            setActiveDocuments(docs => docs.filter(d => d.id !== document.id));
          }, 5000);
        }
        
        return updatedDocs;
      } else {
        // Add the new document
        return [...prevDocs, document];
      }
    });
    
    // Update the cached document data
    if (document.id) {
      queryClient.setQueryData([`/api/documents/${document.id}`], { document });
    }
    
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    queryClient.invalidateQueries({ queryKey: ["/api/documents/active"] });
    queryClient.invalidateQueries({ queryKey: ["/api/documents/recent"] });
  }, [toast, queryClient]);

  // Subscribe to document updates
  const subscribeToDocument = useCallback((documentId: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', documentId }));
    }
  }, []);

  // Unsubscribe from document updates
  const unsubscribeFromDocument = useCallback((documentId: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', documentId }));
    }
  }, []);

  // Disable WebSocket connection as we're using polling
  // Comment out WebSocket connection for now since we're using polling as the primary method
  /*
  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket]);

  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      documentIds.forEach(id => {
        wsRef.current?.send(JSON.stringify({ type: 'subscribe', documentId: id }));
      });
    }
    
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        documentIds.forEach(id => {
          wsRef.current?.send(JSON.stringify({ type: 'unsubscribe', documentId: id }));
        });
      }
    };
  }, [documentIds]);
  */

  // Always use polling since WebSocket can be problematic in some environments
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    
    if (documentIds.length > 0) {
      // Poll every 5 seconds
      pollingInterval = setInterval(() => {
        console.log("Polling for document updates...");
        
        // Fetch active documents and stats
        Promise.all([
          fetch("/api/documents/active", { credentials: "include" }),
          fetch("/api/stats", { credentials: "include" })
        ])
          .then(([documentsRes, statsRes]) => {
            return Promise.all([documentsRes.json(), statsRes.json()]);
          })
          .then(([documentsData, statsData]) => {
            // Update active documents that match our documentIds
            const filteredDocs = documentsData.documents.filter(
              (doc: Document) => documentIds.includes(doc.id)
            );
            
            filteredDocs.forEach((doc: Document) => {
              handleDocumentUpdate(doc);
            });
            
            // Update stats
            setStats(statsData.stats);
          })
          .catch(error => {
            console.error("Error polling for updates:", error);
          });
      }, 3000); // More frequent polling
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [documentIds, handleDocumentUpdate]);

  return {
    isConnected,
    activeDocuments,
    systemStatus,
    stats,
    subscribeToDocument,
    unsubscribeFromDocument
  };
};
