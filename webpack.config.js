const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = {
  plugins: [
    new Dotenv({
      systemvars: true, // Load all system environment variables as well
    }),
  ],
};
