const mysql = require('../../utils/knex').mysql

const testTable = (data, cb) => {
  let table_name = data.table_name
  
  return mysql.schema
    .hasTable(table_name)
    .then((exists) => {
      return cb(null, exists)
    })
    .catch(function (err) {
      console.log(err)
      return cb(err)
    });
}

module.exports.testTable = testTable