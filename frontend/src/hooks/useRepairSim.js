import { useState, useRef, useCallback, useEffect } from 'react';

const WS_BASE = 'ws://localhost:8000/ws/repair';

export default function useRepairSim() {
  const [simVehicles, setSimVehicles] = useState([]);
  const [simProgress, setSimProgress] = useState(0);
  const [simActive,   setSimActive]   = useState(false);
  const [simDone,     setSimDone]     = useState(false);
  const wsRef = useRef(null);

  const startSim = useCallback((roadId, laneId) => {
    if (wsRef.current) wsRef.current.close();
    setSimVehicles([]);
    setSimProgress(0);
    setSimDone(false);
    setSimActive(true);

    const ws = new WebSocket(`${WS_BASE}/${roadId}/${laneId}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'positions') {
        setSimVehicles(msg.vehicles);
        setSimProgress(msg.progress ?? 0);
        if (msg.done) setSimDone(true);
      } else if (msg.type === 'done') {
        setSimDone(true);
      }
    };

    ws.onerror  = () => ws.close();
    ws.onclose  = () => setSimActive(a => a ? false : a);
  }, []);

  const stopSim = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setSimActive(false);
    setSimVehicles([]);
  }, []);

  useEffect(() => () => wsRef.current?.close(), []);

  return { simVehicles, simProgress, simActive, simDone, startSim, stopSim };
}
