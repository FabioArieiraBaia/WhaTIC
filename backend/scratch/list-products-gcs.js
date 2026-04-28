
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = 'whatic-media-315750790111';

async function listFiles() {
  try {
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: 'products/', maxResults: 10 });
    console.log('Files in products/ folder:');
    files.forEach(file => {
      console.log(file.name);
    });
    if (files.length === 0) console.log('No files found in products/ folder.');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

listFiles();
