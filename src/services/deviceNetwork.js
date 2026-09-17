import Peer from 'peerjs';
import { supabase, createRealtimeBoutChannel } from './supabaseClient';

const getDeviceType = () => {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|iphone|ipad|android|touch/.test(ua)) {
    return /ipad|tablet/.test(ua) ? 'tablet' : 'mobile';
  }
  return 'desktop';
};

const generateDeviceName = () => {
  const type = getDeviceType();
  const randNum = Math.floor(100 + Math.random() * 900);
  const typeLabel = type === 'mobile' ? 'Phone' : type === 'tablet' ? 'Tablet' : 'Laptop';
  return `Athlete Node (${typeLabel} #${randNum})`;
};

class DeviceNetworkManager {
  constructor() {
    let storedId = typeof localStorage !== 'undefined' ? localStorage.getItem('truerep_device_id') : null;
    if (!storedId) {
      storedId = `dev_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36)}`;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('truerep_device_id', storedId);
      }
    }

    let storedName = typeof localStorage !== 'undefined' ? localStorage.getItem('truerep_device_name') : null;
    if (!storedName) {
      storedName = generateDeviceName();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('truerep_device_name', storedName);
      }
    }

    this.device = {
      id: storedId,
      name: storedName,
      type: getDeviceType(),
      elo: 2480,
      status: 'available',
      lastSeen: Date.now(),
      ping: '8ms'
    };

    this.listeners = new Set();
    this.eventHandlers = new Map();
    this.discoveredDevices = new Map();

    this.broadcastChannel = null;
    this.peer = null;
    this.hostPeer = null;
    this.peerConnections = new Map();
    this.supabaseChannel = null;

    this.currentRoomCode = 'FIT-4029';
    this.heartbeatTimer = null;
    this.pingTimer = null;
    this.reconnectTimer = null;
    this.initialized = false;

    // Realtime latency tracking: deviceId -> RTT in ms
    this.latencyMap = new Map();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // 1. BroadcastChannel (Cross-tab/window on same browser)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('truerep_device_mesh');
        this.broadcastChannel.onmessage = (event) => this.handleIncomingMessage(event.data, 'broadcast');
      } catch (err) {}
    }

    // 2. LocalStorage Storage Sync (Bulletproof cross-tab fallback)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'truerep_sync_event' && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            if (data && data.message) {
              this.handleIncomingMessage(data.message, 'storage');
            }
          } catch (e) {}
        }
      });
    }

    // 3. Primary PeerJS WebRTC Connection
    try {
      const cleanDevId = this.device.id.replace(/[^a-zA-Z0-9]/g, '');
      const peerId = `truerep-node-${cleanDevId}`;
      this.peer = new Peer(peerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelay',
              credential: 'openrelay'
            },
            {
              urls: 'turn:openrelay.metered.ca:443',
              username: 'openrelay',
              credential: 'openrelay'
            },
            {
              urls: 'turn:openrelay.metered.ca:443?transport=tcp',
              username: 'openrelay',
              credential: 'openrelay'
            }
          ]
        }
      });

      this.peer.on('open', (id) => {
        console.log('[TrueRep WebRTC] Peer connection established with ID:', id);
        this.device.peerId = id;
        this.broadcastPresence();
        // Auto-join room code mesh
        this.joinRoom(this.currentRoomCode);
      });

      this.peer.on('connection', (conn) => {
        console.log('[TrueRep WebRTC] Incoming peer connection from:', conn.peer);
        this.setupPeerConnection(conn);
      });

      this.peer.on('disconnected', () => {
        console.warn('[TrueRep WebRTC] Disconnected from signaling server. Auto-reconnecting...');
        try {
          this.peer.reconnect();
        } catch (e) {}
      });

      this.peer.on('error', (err) => {
        console.warn('[TrueRep WebRTC] Peer error:', err);
        if (err && err.type === 'peer-unavailable') {
          console.log('[TrueRep WebRTC] Host peer unavailable. Promoting this node to Room Host for code:', this.currentRoomCode);
          this.createRoomHost(this.currentRoomCode);
        } else if (err && err.type === 'disconnected') {
          try {
            this.peer.reconnect();
          } catch (e) {}
        }
      });
    } catch (err) {
      console.error('[TrueRep WebRTC] Init error:', err);
    }

    // 4. Supabase Realtime Channel
    this._setupSupabaseChannel();

    // 5. Heartbeat Ping Loop (every 2 seconds)
    this.broadcastPresence();
    this.heartbeatTimer = setInterval(() => {
      this.broadcastPresence();
      this.pruneStaleDevices();
    }, 2000);
  }

  _setupSupabaseChannel() {
    this.supabaseStatus = 'CONNECTING';
    try {
      this.supabaseChannel = createRealtimeBoutChannel('truerep_duels_hub');

      if (this.supabaseChannel) {
        console.log('[TrueRep Supabase] Subscribing to truerep_duels_hub presence channel...');
        this.supabaseChannel
          .on('presence', { event: 'sync' }, () => {
            const presenceState = this.supabaseChannel.presenceState();
            console.log('[TrueRep Supabase] Presence sync received:', presenceState);
            Object.values(presenceState).forEach((presences) => {
              presences.forEach((presence) => {
                if (presence && presence.id && presence.id !== this.device.id) {
                  this.registerDiscoveredDevice({
                    ...presence,
                    source: 'supabase',
                    lastSeen: Date.now()
                  });
                }
              });
            });
          })
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            console.log('[TrueRep Supabase] Device joined:', newPresences);
            newPresences.forEach((p) => {
              if (p && p.id !== this.device.id) {
                this.registerDiscoveredDevice({ ...p, source: 'supabase', lastSeen: Date.now() });
              }
            });
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            console.log('[TrueRep Supabase] Device left:', leftPresences);
            leftPresences.forEach((p) => {
              if (p && p.id) {
                this.discoveredDevices.delete(p.id);
              }
            });
            this.notifyListeners();
          })
          .on('broadcast', { event: 'bout_event' }, ({ payload }) => {
            this.handleIncomingMessage(payload, 'supabase');
          })
          .subscribe(async (status) => {
            console.log('[TrueRep Supabase] Subscription status:', status);
            this.supabaseStatus = status;
            this.notifyListeners();
            if (status === 'SUBSCRIBED' && this.supabaseChannel) {
              await this.supabaseChannel.track({
                id: this.device.id,
                name: this.device.name,
                type: this.device.type,
                elo: this.device.elo,
                status: this.device.status,
                peerId: this.device.peerId || ''
              });
              console.log('[TrueRep Supabase] Successfully tracking device presence.');
              // Start latency ping loop after connection established
              this._startLatencyPing();
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('[TrueRep Supabase] Channel connection closed. Scheduling auto-reconnect in 3s...');
              if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
              this.reconnectTimer = setTimeout(() => {
                this.reconnectSupabase();
              }, 3000);
            }
          });
      } else {
        this.supabaseStatus = 'NOT_CONFIGURED';
        console.warn('[TrueRep Supabase] Client not configured. Check VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.');
      }
    } catch (err) {
      this.supabaseStatus = 'ERROR';
      console.error('[TrueRep Supabase] Realtime error:', err);
    }
  }

  // PING/PONG latency measurement — sends a timestamped PING every 4s to all room peers.
  // Receivers reply with PONG; we calculate RTT and store per-device latency.
  _startLatencyPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      if (this.supabaseChannel && this.supabaseStatus === 'SUBSCRIBED') {
        const ts = Date.now();
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'bout_event',
          payload: {
            type: 'PING',
            senderDeviceId: this.device.id,
            senderDevice: this.device,
            targetDeviceId: null,
            payload: { ts },
            timestamp: ts
          }
        }).catch(() => {});
      }
    }, 4000);
  }

  // Join or host a WebRTC PeerJS Room Code Mesh across devices (e.g. FIT-4029)
  joinRoom(roomCode) {
    if (!roomCode) return;
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    this.currentRoomCode = cleanCode;

    const hostPeerId = `truerep-host-${cleanCode}`;

    if (this.peer) {
      try {
        const conn = this.peer.connect(hostPeerId);

        conn.on('open', () => {
          this.setupPeerConnection(conn);
          conn.send({
            type: 'ANNOUNCE_DEVICE',
            device: this.device,
            timestamp: Date.now()
          });
        });

        conn.on('error', () => {
          this.createRoomHost(cleanCode);
        });
      } catch (e) {
        this.createRoomHost(cleanCode);
      }
    }
  }

  createRoomHost(cleanCode) {
    if (this.hostPeer) return;

    try {
      const hostPeerId = `truerep-host-${cleanCode}`;
      console.log('[TrueRep WebRTC] Initializing Room Host with ID:', hostPeerId);
      this.hostPeer = new Peer(hostPeerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelay',
              credential: 'openrelay'
            },
            {
              urls: 'turn:openrelay.metered.ca:443',
              username: 'openrelay',
              credential: 'openrelay'
            },
            {
              urls: 'turn:openrelay.metered.ca:443?transport=tcp',
              username: 'openrelay',
              credential: 'openrelay'
            }
          ]
        }
      });

      this.hostPeer.on('open', (id) => {
        console.log('[TrueRep WebRTC] Successfully established Room Host ID:', id);
      });

      this.hostPeer.on('connection', (conn) => {
        console.log('[TrueRep WebRTC] Room Host accepted client connection from:', conn.peer);
        this.setupPeerConnection(conn);
        conn.on('open', () => {
          conn.send({
            type: 'ANNOUNCE_DEVICE',
            device: this.device,
            timestamp: Date.now()
          });
        });
      });

      this.hostPeer.on('error', (err) => {
        console.warn('[TrueRep WebRTC] Room Host error:', err);
        if (err && err.type === 'unavailable-id') {
          console.log('[TrueRep WebRTC] Host ID taken by peer. Connecting to existing host...');
          if (this.peer) {
            try {
              const conn = this.peer.connect(hostPeerId);
              conn.on('open', () => this.setupPeerConnection(conn));
            } catch (e) {}
          }
        }
      });
    } catch (e) {}
  }

  setupPeerConnection(conn) {
    if (!conn) return;
    this.peerConnections.set(conn.peer, conn);

    conn.on('data', (data) => {
      this.handleIncomingMessage(data, 'webrtc');
    });

    conn.on('close', () => {
      this.peerConnections.delete(conn.peer);
    });

    // Send local device profile upon connection
    if (conn.open) {
      conn.send({
        type: 'ANNOUNCE_DEVICE',
        device: this.device,
        timestamp: Date.now()
      });
    }
  }

  setDeviceName(newName) {
    if (!newName || !newName.trim()) return;
    this.device.name = newName.trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('truerep_device_name', this.device.name);
    }
    this.broadcastPresence();
  }

  setDeviceStatus(status) {
    this.device.status = status;
    this.broadcastPresence();
  }

  broadcastPresence() {
    this.device.lastSeen = Date.now();

    const payload = {
      type: 'ANNOUNCE_DEVICE',
      device: this.device,
      roomCode: this.currentRoomCode,
      timestamp: Date.now()
    };

    // 1. BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (e) {}
    }

    // 2. LocalStorage Storage Sync
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('truerep_sync_event', JSON.stringify({ message: payload, t: Date.now() }));
      } catch (e) {}
    }

    // 3. Send to connected WebRTC peers
    this.peerConnections.forEach((conn) => {
      if (conn && conn.open) {
        try {
          conn.send(payload);
        } catch (e) {}
      }
    });

    // 4. Supabase Presence track on name/status change only
    if (this.supabaseChannel && this.supabaseStatus === 'SUBSCRIBED') {
      try {
        this.supabaseChannel.track({
          id: this.device.id,
          name: this.device.name,
          type: this.device.type,
          elo: this.device.elo,
          status: this.device.status,
          peerId: this.device.peerId || ''
        });
      } catch (e) {}
    }
  }

  /**
   * Call this when returning to lobby after a duel concludes.
   * Resets device status, clears stale discovered devices, re-announces
   * presence to the Supabase channel so other devices can find us again.
   */
  reconnectAfterBout() {
    console.log('[TrueRep Network] Reconnecting after bout — re-announcing to room...');
    this.device.status = 'available';

    // Clear stale device list so fresh presence sync populates it cleanly
    this.discoveredDevices.clear();
    this.latencyMap.clear();
    this.notifyListeners();

    // Force re-track on Supabase presence so we're visible again
    if (this.supabaseChannel && this.supabaseStatus === 'SUBSCRIBED') {
      try {
        this.supabaseChannel.track({
          id: this.device.id,
          name: this.device.name,
          type: this.device.type,
          elo: this.device.elo,
          status: 'available',
          peerId: this.device.peerId || ''
        });
      } catch (e) {}
    } else {
      // Channel dropped — full reconnect
      this.reconnectSupabase();
    }

    // Re-join WebRTC room mesh
    this.joinRoom(this.currentRoomCode);

    // Broadcast presence via all channels so other devices see us
    this.broadcastPresence();
  }

  reconnectSupabase() {
    if (!createRealtimeBoutChannel) return;
    try {
      if (this.supabaseChannel) {
        this.supabaseChannel.unsubscribe();
      }
      if (this.pingTimer) clearInterval(this.pingTimer);
      this.supabaseChannel = createRealtimeBoutChannel('truerep_duels_hub');
      if (this.supabaseChannel) {
        this.supabaseChannel
          .on('presence', { event: 'sync' }, () => {
            const presenceState = this.supabaseChannel.presenceState();
            Object.values(presenceState).forEach((presences) => {
              presences.forEach((presence) => {
                if (presence && presence.id && presence.id !== this.device.id) {
                  this.registerDiscoveredDevice({
                    ...presence,
                    source: 'supabase',
                    lastSeen: Date.now()
                  });
                }
              });
            });
          })
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            newPresences.forEach((p) => {
              if (p && p.id !== this.device.id) {
                this.registerDiscoveredDevice({ ...p, source: 'supabase', lastSeen: Date.now() });
              }
            });
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            leftPresences.forEach((p) => {
              if (p && p.id) {
                this.discoveredDevices.delete(p.id);
              }
            });
            this.notifyListeners();
          })
          .on('broadcast', { event: 'bout_event' }, ({ payload }) => {
            this.handleIncomingMessage(payload, 'supabase');
          })
          .subscribe(async (status) => {
            console.log('[TrueRep Supabase] Reconnect status:', status);
            this.supabaseStatus = status;
            this.notifyListeners();
            if (status === 'SUBSCRIBED' && this.supabaseChannel) {
              await this.supabaseChannel.track({
                id: this.device.id,
                name: this.device.name,
                type: this.device.type,
                elo: this.device.elo,
                status: this.device.status,
                peerId: this.device.peerId || ''
              });
              this._startLatencyPing();
            }
          });
      }
    } catch (e) {}
  }

  registerDiscoveredDevice(deviceInfo) {
    if (!deviceInfo || !deviceInfo.id || deviceInfo.id === this.device.id) return;

    const existing = this.discoveredDevices.get(deviceInfo.id);
    const updated = {
      ...existing,
      ...deviceInfo,
      lastSeen: Date.now(),
      ping: deviceInfo.ping || '8ms'
    };

    this.discoveredDevices.set(deviceInfo.id, updated);
    this.notifyListeners();
  }

  pruneStaleDevices() {
    const now = Date.now();
    let hasChanges = false;

    this.discoveredDevices.forEach((dev, id) => {
      if (now - dev.lastSeen > 8000) {
        this.discoveredDevices.delete(id);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.notifyListeners();
    }
  }

  handleIncomingMessage(message, source) {
    if (!message || typeof message !== 'object') return;

    const { type, device, senderDeviceId, targetDeviceId } = message;

    // Ignore messages sent by this exact device
    if (senderDeviceId && senderDeviceId === this.device.id) return;

    // PING: reply with PONG immediately — don't route through event handlers
    if (type === 'PING' && senderDeviceId) {
      const pongPayload = {
        type: 'PONG',
        senderDeviceId: this.device.id,
        senderDevice: this.device,
        targetDeviceId: senderDeviceId,
        payload: { ts: message.payload?.ts },
        timestamp: Date.now()
      };
      if (this.supabaseChannel && this.supabaseStatus === 'SUBSCRIBED') {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'bout_event',
          payload: pongPayload
        }).catch(() => {});
      }
      return;
    }

    // PONG: calculate RTT and update latency map
    if (type === 'PONG' && message.payload?.ts && senderDeviceId) {
      const rtt = Date.now() - message.payload.ts;
      this.latencyMap.set(senderDeviceId, rtt);
      // Also update the discovered device's ping display
      const dev = this.discoveredDevices.get(senderDeviceId);
      if (dev) {
        dev.latencyMs = rtt;
        dev.ping = `${rtt}ms`;
        this.discoveredDevices.set(senderDeviceId, dev);
      }
      this.notifyListeners();
      return;
    }

    if (type === 'ANNOUNCE_DEVICE' && device && device.id !== this.device.id) {
      this.registerDiscoveredDevice({ ...device, source });
      return;
    }

    // Live bout events (REP_EVENT, BOUT_END, BOUT_RESPONSE, BOUT_CHALLENGE) trigger for room peers
    const isTargeted = !targetDeviceId || targetDeviceId === this.device.id || type === 'REP_EVENT' || type === 'BOUT_END' || type === 'BOUT_RESPONSE';

    if (isTargeted) {
      console.log(`[TrueRep Network] Event received [${type}] from ${senderDeviceId} via ${source}:`, message.payload);
      const handlers = this.eventHandlers.get(type) || [];
      handlers.forEach((fn) => fn(message, source));
    }
  }

  sendMessage(type, targetDeviceId, payload = {}) {
    const message = {
      type,
      senderDeviceId: this.device.id,
      senderDevice: this.device,
      targetDeviceId,
      payload,
      timestamp: Date.now()
    };

    // BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (e) {}
    }

    // LocalStorage Storage Sync
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('truerep_sync_event', JSON.stringify({ message, t: Date.now() }));
      } catch (e) {}
    }

    // WebRTC Peer Connections
    this.peerConnections.forEach((conn) => {
      if (conn && conn.open) {
        try {
          conn.send(message);
        } catch (e) {}
      }
    });

    // Supabase Realtime Broadcast
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'bout_event',
          payload: message
        });
      } catch (e) {}
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getDiscoveredDevices(), this.device);

    return () => {
      this.listeners.delete(callback);
    };
  }

  onEvent(type, handler) {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, []);
    }
    this.eventHandlers.get(type).push(handler);

    return () => {
      const list = this.eventHandlers.get(type) || [];
      this.eventHandlers.set(
        type,
        list.filter((fn) => fn !== handler)
      );
    };
  }

  notifyListeners() {
    const list = this.getDiscoveredDevices();
    const latency = Object.fromEntries(this.latencyMap);
    this.listeners.forEach((fn) => fn(list, this.device, latency));
  }

  getDiscoveredDevices() {
    return Array.from(this.discoveredDevices.values());
  }

  destroy() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.pingTimer) clearInterval(this.pingTimer);
    if (this.broadcastChannel) this.broadcastChannel.close();
    if (this.peer) this.peer.destroy();
    if (this.hostPeer) this.hostPeer.destroy();
    if (this.supabaseChannel) this.supabaseChannel.unsubscribe();
    this.listeners.clear();
    this.eventHandlers.clear();
    this.initialized = false;
  }
}

export const deviceNetworkManager = new DeviceNetworkManager();
