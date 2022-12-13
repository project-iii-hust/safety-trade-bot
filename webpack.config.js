const path = require('path');

const config = {
    entry : './src/utils/test.js', // File đầu vào
    output : { // File đầu ra
        filename : './wp/index.js', // Tên file đầu ra
        path : path.resolve(__dirname, 'build') // Nơi chưa file đầu ra
    }
}

module.exports = () => {
  // mode: 'development',
  return config
};
