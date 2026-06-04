const fs = require('fs');
const path = require('path');

const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Png, 'base64');

async function test() {
  try {
    const formData = new FormData();
    // In newer Node versions, standard FormData supports Blobs/Files
    const blob = new Blob([buffer], { type: 'image/png' });
    formData.append('file', blob, 'test.png');

    console.log('Sending upload request to telegra.ph/upload...');
    const res = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: formData
    });

    console.log('Status:', res.status);
    const bodyText = await res.text();
    console.log('Response body:', bodyText);
  } catch (err) {
    console.error('Error during test:', err);
  }
}

test();
