// Realtime room: Presence only for membership; Broadcast for fast avatar movement + chat.
// Clients in the SAME Supabase project and SAME ?room=... see one another.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const safeRoom = (new URLSearchParams(window.location.search).get('room') || 'main-hall')
  .replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || 'main-hall';
const identity = () => {
  const saved = sessionStorage.getItem('temple-tab-id');
  if (saved) return saved;
  const id = crypto.randomUUID();
  sessionStorage.setItem('temple-tab-id', id);
  return id;
};
const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
const safeState = (s, id) => ({
  id, name: String(s?.name || 'Khách').slice(0, 24),
  gender: s?.gender === 'male' ? 'male' : 'female',
  x: clamp(s?.x, -16, 16), z: clamp(s?.z, -16, 16),
  rotation: clamp(s?.rotation, -7, 7),
  action: ['idle', 'incense', 'bow', 'flower', 'chant', 'wish', 'fortune'].includes(s?.action) ? s.action : 'idle',
  phase: String(s?.phase || 'idle').slice(0, 16),
  cushionId: Number.isInteger(s?.cushionId) ? clamp(s.cushionId, 0, 14) : null,
  level: clamp(s?.level, 0, 99), dharmaName: String(s?.dharmaName || '').slice(0, 35),
  count: clamp(s?.count, 0, 108)
});
export function connectRoom({ onPlayers = () => {}, onStatus = () => {}, onCount = () => {}, onMessage = () => {}, onRitual = () => {} }) {
  const id = identity();
  const enabled = Boolean(url && key);
  const client = enabled ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }) : null;
  let channel = null, connected = false, started = false, state = {}, lastSent = 0, lastTracked = 0;
  let lastMotion = '', lastPresence = '';
  const people = new Map();
  const emitPeople = () => { onPlayers([...people.values()]); onCount(connected ? people.size + 1 : 1); };
  const presencePayload = () => ({ ...state, id, online_at: new Date().toISOString() });
  function sync() {
    if (!channel) return;
    const current = new Map();
    for (const item of Object.values(channel.presenceState()).flat()) {
      if (!item?.id || item.id === id) continue;
      // Keep last broadcast position when a presence refresh only updates metadata.
      current.set(item.id, { ...safeState(item, item.id), ...(people.has(item.id) ? { x: people.get(item.id).x, z: people.get(item.id).z, rotation: people.get(item.id).rotation } : {}) });
    }
    people.clear(); for (const [pid, p] of current) people.set(pid, p);
    emitPeople();
  }
  const onBroadcast = (payload) => {
    const data = payload?.payload;
    if (!data || data.id === id || !people.has(data.id)) return;
    people.set(data.id, { ...people.get(data.id), ...safeState(data, data.id) });
    emitPeople();
  };
  function start() {
    if (started) return; started = true;
    if (!enabled) { onStatus('◌ Chưa cấu hình Supabase'); onCount(1); return; }
    onStatus('◌ Đang kết nối…');
    channel = client.channel(`an-nhien:v4:${safeRoom}`, {
      config: { broadcast: { self: false, ack: false }, presence: { key: id } }
    });
    channel.on('presence', { event: 'sync' }, sync)
      .on('broadcast', { event: 'state' }, onBroadcast)
      .on('broadcast', { event: 'ritual' }, ({ payload }) => {
        if(payload?.id && payload.id !== id && people.has(payload.id) && payload.action === 'wish') onRitual(payload);
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        if (!payload || typeof payload.text !== 'string' || !payload.id || payload.id === id) return;
        // The sender must be a member of the current room.
        if (!people.has(payload.id)) return;
        onMessage({ id: payload.id, name: people.get(payload.id).name || 'Khách', text: payload.text.slice(0, 180), mine: false });
      });
    channel.subscribe(async (subscription) => {
      if (subscription === 'SUBSCRIBED') {
        connected = true; onStatus(`● Đã kết nối · ${safeRoom}`);
        lastPresence = JSON.stringify(state);
        try { await channel.track(presencePayload()); } catch (err) { onStatus('⚠ Không gửi được trạng thái'); console.warn(err); }
        emitPeople();
      } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(subscription)) {
        connected = false; people.clear(); emitPeople(); onStatus('⚠ Mất kết nối Realtime');
      }
    });
  }
  function update(next) {
    state = safeState(next, id);
    if (!connected || !channel) return;
    const now = performance.now();
    const presence = JSON.stringify({ name: state.name, gender: state.gender, action: state.action, phase: state.phase, cushionId: state.cushionId, level: state.level, dharmaName: state.dharmaName });
    if (presence !== lastPresence || now - lastTracked > 12000) {
      lastPresence = presence; lastTracked = now;
      channel.track(presencePayload()).catch((e) => console.warn('Presence track:', e));
    }
    const motion = JSON.stringify({ x: Math.round(state.x * 20) / 20, z: Math.round(state.z * 20) / 20,
      rotation: Math.round(state.rotation * 10) / 10, action: state.action, phase: state.phase, count: state.count });
    if (motion !== lastMotion && now - lastSent > 180) {
      lastMotion = motion; lastSent = now;
      channel.send({ type: 'broadcast', event: 'state', payload: state }).catch(() => {});
    }
  }
  function sendChat(text, name) {
    if (!connected || !channel) return false;
    const value = String(text).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 180);
    if (!value) return false;
    channel.send({ type: 'broadcast', event: 'chat', payload: { id, name: String(name).slice(0, 24), text: value } }).catch(() => {});
    return true;
  }
  function publish() { if (connected) channel.track(presencePayload()).catch(() => {}); }
  function sendRitual(action, side) { if (connected && channel) channel.send({ type: 'broadcast', event: 'ritual', payload: { id, action, side: side === 'right' ? 'right' : 'left' } }).catch(() => {}); }
  return {
    id, client, roomId: safeRoom, enabled, start, update, publish, sendChat, sendRitual,
    isConnected: () => connected,
    setState: (fn) => { state = safeState(fn(), id); },
    isOccupied: (cushionId) => [...people.values()].some(p => p.cushionId === cushionId),
    getPlayers: () => [...people.values()],
    close: () => { if (channel) client.removeChannel(channel); connected = false; }
  };
}
