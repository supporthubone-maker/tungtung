// Optional shared room using Supabase Realtime Presence. No credential is embedded.
import { createClient } from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY;
export function connectRoom({onPlayers,onStatus}){
 const id=crypto.randomUUID();let state={};let channel=null;let last=0;let pending=[];
 const roomId=new URLSearchParams(location.search).get('room')?.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,50)||'main-hall';
 let client=null;
 const connected=Boolean(url&&key);
 if(!connected)onStatus('◌ Chế độ một người');
 return {
  id, setState(fn){state=fn()},
  start(){if(!connected){onStatus('◌ Một người · Cần cấu hình realtime');return}
   client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
   channel=client.channel(`temple:${roomId}`,{config:{presence:{key:id}}});
   channel.on('presence',{event:'sync'},()=>{const presence=channel.presenceState();pending=Object.values(presence).flat().filter(x=>x.id!==id);onPlayers(pending);onStatus(`● ${pending.length+1} người trong gian`)});
   channel.subscribe(async(status)=>{if(status==='SUBSCRIBED'){await channel.track({id,...state});onStatus('● Đã kết nối phòng')}else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){onStatus('⚠ Kết nối bị gián đoạn')}});
  },
  update(next){if(!channel)return;state=next;const now=performance.now();if(now-last>250){last=now;channel.track({id,...state}).catch(()=>{})}},
  publish(){if(channel)channel.track({id,...state}).catch(()=>{})},
  isOccupied(cushionId){return pending.some(p=>p.cushionId===cushionId)},
  close(){if(channel)client.removeChannel(channel)}
 }
}
