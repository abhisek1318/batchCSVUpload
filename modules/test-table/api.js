const mysql = require('../../utils/knex').mysql

const testTable = (data, cb) => {
  let table_name = data.table_name
  
  return mysql.schema
    .hasTable(table_name)
    .then((exist) => {
      return cb(null, exist)
    })
    .catch(function (err) {
      console.log(err)
      return cb(err)
    });
}

module.exports.testTable = testTable