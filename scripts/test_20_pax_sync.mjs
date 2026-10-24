import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
const url = (envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/) || [])[1] || process.env.VITE_SUPABASE_URL;
const key = (envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/) || [])[1] || process.env.VITE_SUPABASE_ANON_KEY;

const roomCode = 'ROOM20_' + Math.floor(Math.random() * 1000);
console.log('Testing 20-Person Quorum Realtime Room:', roomCode);

const hostClient = createClient(url, key);
const hostChannel = hostClient.channel('trippick_' + roomCode, { config: { broadcast: { self: false } } });

const discoveredUsers = new Set();
discoveredUsers.add('Host');

hostChannel.on('broadcast', { event: 'USER_JOINED' }, ({ payload }) => {
  if (payload?.user_name) {
    discoveredUsers.add(payload.user_name);
  }
});

await new Promise(resolve => {
  hostChannel.subscribe(status => {
    if (status === 'SUBSCRIBED') {
      console.log('Host channel subscribed. Joining 19 members...');
      resolve();
    }
  });
});

const memberClients = [];
const memberChannels = [];

for (let i = 1; i <= 19; i++) {
  const memberClient = createClient(url, key);
  const ch = memberClient.channel('trippick_' + roomCode, { config: { broadcast: { self: false } } });
  memberClients.push(memberClient);
  memberChannels.push(ch);

  ch.subscribe(status => {
    if (status === 'SUBSCRIBED') {
      ch.send({
        type: 'broadcast',
        event: 'USER_JOINED',
        payload: { id: `u_${i}`, user_name: `TeamMember_${i}`, role: `Role_${i}` }
      });
    }
  });
}

// Wait for all 20 persons to be discovered
const start = Date.now();
while (discoveredUsers.size < 20 && (Date.now() - start) < 8000) {
  await new Promise(r => setTimeout(r, 200));
}

console.log(`Discovered ${discoveredUsers.size} / 20 attendees in room ${roomCode}`);
if (discoveredUsers.size >= 20) {
  console.log('✓ SUCCESS: Room successfully reached 20 persons concurrently in real time!');
  process.exit(0);
} else {
  console.error(`FAILED: Only discovered ${discoveredUsers.size} persons`);
  process.exit(1);
}
