'use strict'

const async = require('async')
const csvHeaders = require('csv-headers')
const mysql = require('../../utils/knex').mysql

const initTable = function (data, _cb) {
  let { file_path, table_name } = data

  async.auto({
    list_data_headers: function (cb) {
      csvHeaders({
        file: file_path,
        delimiter: ','
      }, function (err, headers) {
        if (err) {
          return cb(err)
        }

        return cb(null, { headers: headers })
      });
    },
    create_new_table: ['list_data_headers', function (result, cb) {
      let headers = result.list_data_headers.headers

      mysql.schema
        .createTable(table_name, (table) => {
          headers.forEach((col_name) => {
            table.text(col_name)
          })
        })
        .then(data => {
          return cb(null, { headers });
        })
        .catch(err => {
          return cb(err)
        })
    }]
  }, function (error, results) {
    if (error) return _cb(error)

    return _cb(null, {
      results: results.create_new_table.headers
    })
  })
}

module.exports.initTable = initTable
