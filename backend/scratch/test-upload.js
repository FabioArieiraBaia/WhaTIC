
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

async function testUpload() {
  const storage = new Storage();
  const bucketName = 'whatic-media-315750790111';
  const bucket = storage.bucket(bucketName);
  
  // Create a dummy file
  fs.writeFileSync('dummy.txt', 'hello world');
  
  try {
    console.log('Attempting upload with public: true...');
    await bucket.upload('dummy.txt', {
      destination: 'test-dummy.txt',
      public: true,
      metadata: { contentType: 'text/plain' }
    });
    console.log('Upload successful!');
  } catch (err) {
    console.error('Error during upload with public: true:', err.message);
  }
  
  try {
    console.log('Attempting upload with public: false...');
    await bucket.upload('dummy.txt', {
      destination: 'test-dummy2.txt',
      metadata: { contentType: 'text/plain' }
    });
    console.log('Upload successful!');
  } catch (err) {
    console.error('Error during upload with public: false:', err.message);
  }
  
  fs.unlinkSync('dummy.txt');
}

testUpload();
