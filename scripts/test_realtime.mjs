import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
const url = (envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/) || [])[1] || process.env.VITE_SUPABASE_URL;
const key = (envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/) || [])[1] || process.env.VITE_SUPABASE_ANON_KEY;

const roomCode = 'TEST' + Math.floor(Math.random() * 1000);
console.log('Testing 2-client Realtime sync in room:', roomCode);

const client1 = createClient(url, key);
const client2 = createClient(url, key);

const ch1 = client1.channel('trippick_' + roomCode, { config: { broadcast: { self: false } } });
const ch2 = client2.channel('trippick_' + roomCode, { config: { broadcast: { self: false } } });

let ch1GotCh2 = false;
let ch2GotCh1 = false;

ch1.on('broadcast', { event: 'USER_JOINED' }, ({ payload }) => {
  console.log('Host (ch1) received USER_JOINED from:', payload.user_name);
  if (payload.user_name === 'Person2') ch1GotCh2 = true;
  if (ch1GotCh2 && ch2GotCh1) {
    console.log('✓ SUCCESS: Both persons discovered each other in real-time over Supabase!');
    process.exit(0);
  }
});

ch2.on('broadcast', { event: 'USER_JOINED' }, ({ payload }) => {
  console.log('Member (ch2) received USER_JOINED from:', payload.user_name);
  if (payload.user_name === 'Person1') ch2GotCh1 = true;
  if (ch1GotCh2 && ch2GotCh1) {
    console.log('✓ SUCCESS: Both persons discovered each other in real-time over Supabase!');
    process.exit(0);
  }
});

ch1.subscribe(status => {
  if (status === 'SUBSCRIBED') {
    console.log('ch1 SUBSCRIBED');
    setTimeout(() => {
      ch1.send({ type: 'broadcast', event: 'USER_JOINED', payload: { id: 'u1', user_name: 'Person1' } });
    }, 400);
  }
});

ch2.subscribe(status => {
  if (status === 'SUBSCRIBED') {
    console.log('ch2 SUBSCRIBED');
    setTimeout(() => {
      ch2.send({ type: 'broadcast', event: 'USER_JOINED', payload: { id: 'u2', user_name: 'Person2' } });
    }, 700);
  }
});

setTimeout(() => {
  console.log('Timeout. ch1GotCh2:', ch1GotCh2, 'ch2GotCh1:', ch2GotCh1);
  process.exit(ch1GotCh2 && ch2GotCh1 ? 0 : 1);
}, 6000);
