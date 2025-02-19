export const startHeartbeat = (
  socketRef,
  missedPingCountRef,
  PING_INTERVAL,
  MAX_MISSED_PINGS
) => {
  return setInterval(() => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: "ping" }));

      missedPingCountRef.current += 1;

      if (missedPingCountRef.current >= MAX_MISSED_PINGS) {
        console.warn("Max missed pings reached. Reconnecting...");
        socketRef.current.close();
      }
    }
  }, PING_INTERVAL);
};

export const stopHeartbeat = (heartbeatRef) => {
  if (heartbeatRef.current) {
    clearInterval(heartbeatRef.current);
    heartbeatRef.current = null;
  }
};

export const handleReconnect = (
  socketRef,
  reconnectIntervalRef,
  connect,
  timeout = 5000
) => {
  if (navigator.onLine && !socketRef.current) {
    reconnectIntervalRef.current = setTimeout(() => {
      console.log("Attempting to reconnect...");
      connect();
    }, timeout);
  } else {
    console.warn("Waiting for network connection to reconnect...");
  }
};
