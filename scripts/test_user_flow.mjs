import { createClient } from '@supabase/supabase-js';

const url = 'https://nuipjeulbavcqjuutmqc.supabase.co';
const key = 'sb_publishable_UIe349GDMsv49mCKXkg-Dw_OKWig8OP';

const roomCode = 'FLOW_' + Math.floor(Math.random() * 1000);
console.log('Testing 2-player flow in room:', roomCode);

const hostClient = createClient(url, key);
const memberClient = createClient(url, key);

const hostCh = hostClient.channel('trippick_' + roomCode, { config: { broadcast: { self: false } } });
const memberCh = memberClient.channel('trippick_' + roomCode, { config: { broadcast: { self: false } } });

let hostUsers = [{ id: 'host_1', user_name: 'Host User', isHost: true }];
let memberUsers = [];

hostCh.on('broadcast', { event: 'USER_JOINED' }, ({ payload }) => {
  console.log('Host received USER_JOINED:', payload.user_name);
  if (!hostUsers.some(u => u.id === payload.id)) {
    hostUsers.push(payload);
  }
  // Host sends SYNC_ROOM_STATE to member
  hostCh.send({
    type: 'broadcast',
    event: 'SYNC_ROOM_STATE',
    payload: {
      users: hostUsers,
      room: { id: roomCode, status: 'waiting' }
    }
  });
});

memberCh.on('broadcast', { event: 'SYNC_ROOM_STATE' }, ({ payload }) => {
  console.log('Member received SYNC_ROOM_STATE with users:', payload.users?.map(u => u.user_name));
  memberUsers = payload.users || [];
});

await new Promise(r => {
  hostCh.subscribe(s => {
    if (s === 'SUBSCRIBED') {
      console.log('Host subscribed');
      r();
    }
  });
});

await new Promise(r => {
  memberCh.subscribe(s => {
    if (s === 'SUBSCRIBED') {
      console.log('Member subscribed');
      r();
    }
  });
});

// Member joins
const memberUser = { id: 'member_2', user_name: 'Member User', isHost: false };
memberUsers.push(memberUser);
memberCh.send({
  type: 'broadcast',
  event: 'USER_JOINED',
  payload: memberUser
});

await new Promise(r => setTimeout(r, 1000));

console.log('Host sees users:', hostUsers.map(u => u.user_name));
console.log('Member sees users:', memberUsers.map(u => u.user_name));

// Now Host starts session
console.log('\n--- Host starts session ---');
const roomData = {
  id: roomCode,
  status: 'swiping',
  destinations_deck: [
    { id: 101, title: 'Capella Bangkok' },
    { id: 102, title: 'Trisara Phuket' }
  ]
};

hostCh.send({
  type: 'broadcast',
  event: 'SESSION_STARTED',
  payload: { room: roomData }
});

// Now Host swipes LIKE on card 101
console.log('\n--- Host swipes LIKE on 101 ---');
const hostSwipe = {
  id: 's_1',
  room_id: roomCode,
  user_id: 'host_1',
  destination_id: 101,
  is_like: true,
  is_veto: false
};

// Check if Host triggers consensus with 1 like!
const activeCount = hostUsers.length;
const requiredLikes = activeCount <= 2 ? Math.max(1, activeCount) : Math.max(2, Math.ceil(activeCount * 0.6));
console.log(`Active count on host: ${activeCount}, Required likes: ${requiredLikes}`);

if (requiredLikes === 2) {
  console.log('✓ Correct: 1 like will NOT trigger consensus because requiredLikes = 2!');
} else {
  console.log('❌ Bug: requiredLikes is', requiredLikes);
}

process.exit(0);
