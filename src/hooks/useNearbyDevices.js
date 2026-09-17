import { useState, useEffect, useCallback } from 'react';
import { deviceNetworkManager } from '../services/deviceNetwork';

const DEFAULT_DEVICE = {
  id: 'dev_local',
  name: 'Athlete Node',
  type: 'desktop',
  status: 'available',
  elo: 2480
};

export function useNearbyDevices() {
  const [myDevice, setMyDevice] = useState(deviceNetworkManager?.device || DEFAULT_DEVICE);
  const [nearbyDevices, setNearbyDevices] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [outgoingChallenge, setOutgoingChallenge] = useState(null);
  const [connectedOpponent, setConnectedOpponent] = useState(null);
  const [boutEvent, setBoutEvent] = useState(null);
  const [supabaseStatus, setSupabaseStatus] = useState(deviceNetworkManager?.supabaseStatus || 'DISCONNECTED');
  const [currentRoomCode, setCurrentRoomCode] = useState(deviceNetworkManager?.currentRoomCode || 'FIT-4029');
  // Realtime latency per discovered device: { [deviceId]: ms }
  const [latencyMap, setLatencyMap] = useState({});

  useEffect(() => {
    deviceNetworkManager.init();

    // Subscribe to presence & discovered devices updates
    // notifyListeners now passes (devices, self, latency)
    const unsubscribe = deviceNetworkManager.subscribe((devices, self, latency = {}) => {
      setNearbyDevices(devices);
      setMyDevice({ ...self });
      setSupabaseStatus(deviceNetworkManager.supabaseStatus || 'DISCONNECTED');
      setCurrentRoomCode(deviceNetworkManager.currentRoomCode || 'FIT-4029');
      setLatencyMap({ ...latency });
    });

    // Listen for incoming BOUT_CHALLENGE
    const unsubChallenge = deviceNetworkManager.onEvent('BOUT_CHALLENGE', (msg) => {
      setActiveChallenge({
        senderDeviceId: msg.senderDeviceId,
        senderDevice: msg.senderDevice,
        exercise: msg.payload?.exercise || 'pushup',
        timestamp: msg.timestamp
      });
    });

    // Listen for BOUT_RESPONSE (accepted / declined)
    const unsubResponse = deviceNetworkManager.onEvent('BOUT_RESPONSE', (msg) => {
      if (msg.payload?.accepted) {
        setConnectedOpponent(msg.senderDevice);
        setOutgoingChallenge(null);
        deviceNetworkManager.setDeviceStatus('in_bout');
        setBoutEvent({ type: 'CHALLENGE_ACCEPTED', opponent: msg.senderDevice });
      } else {
        setOutgoingChallenge(null);
        setBoutEvent({ type: 'CHALLENGE_DECLINED', opponent: msg.senderDevice });
      }
    });

    // Listen for live bout rep events
    const unsubRep = deviceNetworkManager.onEvent('REP_EVENT', (msg) => {
      setBoutEvent({
        type: 'REP_EVENT',
        senderDeviceId: msg.senderDeviceId,
        reps: msg.payload?.reps || 0,
        telemetry: msg.payload?.telemetry || {}
      });
    });

    // Listen for bout finish or forfeit
    const unsubBoutEnd = deviceNetworkManager.onEvent('BOUT_END', (msg) => {
      setBoutEvent({ type: 'BOUT_END', senderDeviceId: msg.senderDeviceId });
      setConnectedOpponent(null);
      deviceNetworkManager.setDeviceStatus('available');
    });

    return () => {
      unsubscribe();
      unsubChallenge();
      unsubResponse();
      unsubRep();
      unsubBoutEnd();
    };
  }, []);

  // Update Device Name
  const updateDeviceName = useCallback((name) => {
    deviceNetworkManager.setDeviceName(name);
    setMyDevice({ ...deviceNetworkManager.device });
  }, []);

  // Join or Host a Room Code Mesh
  const joinRoomCode = useCallback((code) => {
    deviceNetworkManager.joinRoom(code);
  }, []);

  // Send a Bout Challenge to a target device (accepts device ID string or device object)
  const sendChallenge = useCallback((targetDeviceOrId, exercise = 'pushup') => {
    const targetDeviceId = typeof targetDeviceOrId === 'string' ? targetDeviceOrId : targetDeviceOrId?.id;
    const targetDev = typeof targetDeviceOrId === 'object' ? targetDeviceOrId : nearbyDevices.find((d) => d.id === targetDeviceId);

    if (!targetDeviceId) return;

    setOutgoingChallenge({ targetDeviceId, targetDevice: targetDev, exercise });
    deviceNetworkManager.sendMessage('BOUT_CHALLENGE', targetDeviceId, { exercise });
  }, [nearbyDevices]);

  // Accept an incoming challenge
  const acceptChallenge = useCallback(() => {
    if (!activeChallenge) return;

    const opponent = activeChallenge.senderDevice;
    setConnectedOpponent(opponent);
    deviceNetworkManager.setDeviceStatus('in_bout');

    // Reply accept to challenger
    deviceNetworkManager.sendMessage('BOUT_RESPONSE', activeChallenge.senderDeviceId, {
      accepted: true
    });

    setActiveChallenge(null);
    setBoutEvent({ type: 'CHALLENGE_ACCEPTED', opponent });
  }, [activeChallenge]);

  // Decline an incoming challenge
  const declineChallenge = useCallback(() => {
    if (!activeChallenge) return;

    deviceNetworkManager.sendMessage('BOUT_RESPONSE', activeChallenge.senderDeviceId, {
      accepted: false
    });

    setActiveChallenge(null);
  }, [activeChallenge]);

  // Send rep update to room during live bout over Supabase Realtime Hub.
  // We always broadcast to the room (targetDeviceId = null) rather than closing
  // over connectedOpponent, which can be stale when this callback was last created.
  // Self-echoes are filtered in handleIncomingMessage via senderDeviceId check.
  const sendRepUpdate = useCallback((reps, telemetry = {}) => {
    deviceNetworkManager.sendMessage('REP_EVENT', null, {
      reps,
      telemetry
    });
  }, []);

  // Clear consumed bout event
  const clearBoutEvent = useCallback(() => {
    setBoutEvent(null);
  }, []);

  // End or cancel bout
  const sendBoutEnd = useCallback(() => {
    if (connectedOpponent) {
      deviceNetworkManager.sendMessage('BOUT_END', connectedOpponent.id);
    }
    setConnectedOpponent(null);
    setOutgoingChallenge(null);
    setActiveChallenge(null);
    setBoutEvent(null);
    deviceNetworkManager.setDeviceStatus('available');
  }, [connectedOpponent]);

  /**
   * Re-announce this device to the room after a bout ends.
   * Clears stale device list and re-tracks Supabase presence so nearby
   * devices become visible again without a full page refresh.
   */
  const reconnectAfterBout = useCallback(() => {
    setConnectedOpponent(null);
    setOutgoingChallenge(null);
    setActiveChallenge(null);
    setBoutEvent(null);
    setNearbyDevices([]);
    deviceNetworkManager.reconnectAfterBout();
  }, []);

  return {
    myDevice,
    nearbyDevices,
    activeChallenge,
    outgoingChallenge,
    connectedOpponent,
    boutEvent,
    supabaseStatus,
    currentRoomCode,
    latencyMap,
    updateDeviceName,
    joinRoomCode,
    sendChallenge,
    acceptChallenge,
    declineChallenge,
    sendRepUpdate,
    sendBoutEnd,
    clearBoutEvent,
    reconnectAfterBout
  };
}
