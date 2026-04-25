const fs = require('fs');
const path = require('path');

const publicPath = 'c:\\xampp\\htdocs\\boot2\\backend\\public';
const mediaPath = 'media/1/662/3/7ccWBFeGoB/test.txt';
const fullPath = path.join(publicPath, mediaPath);

console.log('Target path:', fullPath);

try {
    // Check if parent directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        console.log('Directory does not exist, creating:', dir);
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, 'hello');
    console.log('Success!');
} catch (err) {
    console.error('Error:', err);
}
