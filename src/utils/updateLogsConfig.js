const fs = require('fs').promises;

module.exports = async (config, logs, state, channel) => {
  for (var i = 0; i < config.length; i++) {
    if (config[i].name === logs) {
      config[i].enabled = state;
      config[i].channel = channel ? channel : '';
      await fs.writeFile('./logsConfig.json', JSON.stringify(config));
      break;
    }
  }
};
