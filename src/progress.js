// Merits use Supabase RPC when installed; otherwise browser-local demo progress.
// This prototype counts ONE completed activity as ONE turn, including 108 repetitions.
export const LEVEL_STEPS = [0, 5, 15, 30, 50, 80, 120, 170, 230, 300];
const TITLES = ['An Tâm', 'Tuệ An', 'Diệu Hòa', 'Tịnh Minh', 'Thiện Duyên', 'Minh Liên', 'Tâm Liên', 'Phúc An', 'Từ Tâm', 'An Nhiên', 'Tịnh Liên', 'Bảo Tâm'];
const levelFor = (turns) => {
  let level = 0;
  for (const step of LEVEL_STEPS) if (turns >= step) level += 1;
  return Math.max(0, level - 1) + Math.max(0, Math.floor(Math.max(0, turns - 300) / 100));
};
const pickName = (id) => {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return TITLES[hash % TITLES.length];
};
const copy = (p) => ({ merits: Number(p?.merits) || 0, dharmaName: p?.dharma_name || p?.dharmaName || '' });
export function createMeritSystem(room, { onChange = () => {}, onNotice = () => {} }) {
  const key = 'an-nhien-merits-v4';
  let local = {};
  try { local = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { local = {}; }
  let current = copy(local), cloud = false;
  const notify = () => onChange({ ...current, level: levelFor(current.merits), cloud });
  notify();
  const remember = () => { try { localStorage.setItem(key, JSON.stringify(current)); } catch {} };
  async function init(displayName, gender) {
    if (room.client) {
      try {
        const { data: sessionData, error: sessionError } = await room.client.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData.session) {
          const { error } = await room.client.auth.signInAnonymously();
          if (error) throw error;
        }
        const { data, error } = await room.client.rpc('temple_set_profile', { p_name: displayName, p_gender: gender });
        if (error) throw error;
        current = copy(data); cloud = true; notify(); return;
      } catch (err) {
        console.warn('Merit cloud setup: ', err);
        onNotice('Lượt tu tập đang được lưu trên thiết bị này. Chưa kết nối được nơi lưu tiến độ.');
      }
    }
    cloud = false; current = copy(local); notify();
  }
  async function award(action) {
    if (cloud) {
      try {
        const { data, error } = await room.client.rpc('temple_award_merit', { p_action: action });
        if (error) throw error;
        current = copy(data);
        notify();
        if (data.rewarded === false) { onNotice('Lượt chưa được cộng (giới hạn thời gian hoặc số lượt mỗi ngày).'); return false; }
        onNotice(`🌸 Hoàn thành! +1 lượt tu tập · ${current.merits} lượt`);
        if (current.merits === 30) onNotice(`🪷 Bé nhận được pháp danh trong game: ${current.dharmaName}`);
        return true;
      } catch (err) {
        console.warn('Merit award failed:', err);
        onNotice('Chưa lưu được lượt tu tập. Vui lòng thử lại sau.');
        return false; // NEVER claim local reward if cloud write fails.
      }
    }
    current.merits += 1;
    if (current.merits >= 30 && !current.dharmaName) current.dharmaName = pickName(room.id);
    remember(); notify();
    onNotice(`🌸 Hoàn thành! +1 lượt (lưu trên thiết bị) · ${current.merits} lượt`);
    if (current.merits === 30) onNotice(`🪷 Bé nhận được pháp danh trong game: ${current.dharmaName}`);
    return true;
  }
  return { init, award, get: () => ({ ...current, level: levelFor(current.merits), cloud }) };
}
export function nextLevel(merits) {
  return LEVEL_STEPS.find(s => s > merits) ?? 300 + (Math.floor(Math.max(0, merits - 300) / 100) + 1) * 100;
}
export function currentLevelStart(merits) {
  return [...LEVEL_STEPS].reverse().find(s => s <= merits) ?? 0;
}
