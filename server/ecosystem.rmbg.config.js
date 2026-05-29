const fs = require('fs');
const path = require('path');

let HF_TOKEN = '';
let HF_HOME = '/var/www/kapsula/data/www/api-server/.hf_cache';

try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const tokenMatch = envContent.match(/^HF_TOKEN=(.*)$/m);
    if (tokenMatch) {
      HF_TOKEN = tokenMatch[1].trim().replace(/^['"]|['"]$/g, '');
    }
    const homeMatch = envContent.match(/^HF_HOME=(.*)$/m);
    if (homeMatch) {
      HF_HOME = homeMatch[1].trim().replace(/^['"]|['"]$/g, '');
    }
  }
} catch (e) {
  console.error('Error reading .env in ecosystem:', e);
}

module.exports = {
  apps: [
    {
      name: 'rmbg-service',
      script: './venv/bin/python',
      args: 'remove_bg_service.py',
      cwd: '/var/www/kapsula/data/www/api-server',
      interpreter: 'none',
      env: {
        HF_HOME: HF_HOME,
        HF_TOKEN: HF_TOKEN
      }
    }
  ]
};
