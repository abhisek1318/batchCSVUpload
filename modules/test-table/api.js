const mysql = require('../../utils/knex').mysql

const testTable = (tableName, cb) => {
  return mysql.schema
    .hasTable(tableName)
    .then((exist) => {
      return cb(null, exist)
    })
    .catch(function (err) {
      console.log(err)
      return cb(err)
    });
}

module.exports.testTable = testTable