const crypto = require('crypto');
const fs = require('fs');

const API = process.env.API_URL || 'http://localhost:8010';
const EMAIL = process.env.TEST_EMAIL || 'master@system.local';
const PASSWORD = process.env.TEST_PW || 'Master@123';

function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output = [];
  input = input.toUpperCase().replace(/=+$/, '');
  for (let i = 0; i < input.length; i++) {
    const idx = alphabet.indexOf(input[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(output);
}

function hotp(secret, counter) {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  // counter as 64-bit big-endian
  let c = BigInt(counter);
  for (let i = 7; i >= 0; i--) {
    buf[i] = Number(c & 0xffn);
    c = c >> 8n;
  }
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
  return code;
}

function totp(secret, forTime = Date.now()) {
  const counter = BigInt(Math.floor(forTime / 1000 / 30));
  return hotp(secret, counter);
}

async function run() {
  try {
    console.log('Logging in...');
    const loginRes = await fetch(API + '/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.access_token) {
      console.error('Login failed:', loginJson);
      process.exit(1);
    }
    const token = loginJson.access_token;
    console.log('Got access token. Calling setup2FA...');

    const setupRes = await fetch(API + '/auth/2fa/setup', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token } });
    const setupJson = await setupRes.json();
    console.log('Setup response:', setupJson);
    if (!setupJson.secret) {
      console.error('No secret returned');
      process.exit(1);
    }
    const secret = setupJson.secret;
    console.log('Secret:', secret);
    const code = totp(secret);
    console.log('Generated TOTP code:', code);

    console.log('Calling verify2FA...');
    const verifyRes = await fetch(API + '/auth/2fa/verify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ totp_code: code }) });
    let verifyJson;
    try { verifyJson = await verifyRes.clone().json(); } catch (e) { verifyJson = { status: verifyRes.status, text: await verifyRes.clone().text() }; }
    console.log('Verify response:', verifyJson);

    console.log('Calling enable2FA...');
    const enableRes = await fetch(API + '/auth/2fa/enable', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ totp_code: code }) });
    let enableJson;
    try { enableJson = await enableRes.clone().json(); } catch (e) { enableJson = { status: enableRes.status, text: await enableRes.clone().text() }; }
    console.log('Enable response:', enableJson);

    console.log('Done');
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
}

run();
