const config = require('./config')

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: config.mySqlURL,
      user: config.mySqlUser,
      password: config.mySqlPassword,
      database: config.mySqlDB
    },
    searchPath: [config.mySqlSchema],
  }
}