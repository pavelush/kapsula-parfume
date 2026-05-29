module.exports = {
  apps: [
    {
      name: 'rmbg-service',
      script: './venv/bin/python',
      args: 'remove_bg_service.py',
      cwd: '/var/www/kapsula/data/www/api-server',
      interpreter: 'none',
      env: {
        HF_HOME: '/var/www/kapsula/data/www/api-server/.hf_cache'
        // HF_TOKEN is set via .env file on the server
      }
    }
  ]
};
