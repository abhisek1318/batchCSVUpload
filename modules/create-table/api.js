'use strict'

const async = require('async')
const csvHeaders = require('csv-headers')
const mysql = require('../../utils/knex').mysql

const testTable = require('../test-table/api').testTable

const createTable = function (data, _cb) {
  let { file_path, table_name, table_headers } = data

  async.auto({
    list_table_headers: function (cb) {
      if (!file_path) return cb(null)

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
    check_table_if_exist: ['list_table_headers', function (result, cb) {
      let headers = result.list_table_headers && result.list_table_headers.headers

      let dataObj = {
        table_name: table_name
      }

      testTable(dataObj, (err, exists) => {
        if (exists) {
          return _cb(null, {
            results: headers
          })
        }
      })
    }],
    create_new_table: ['check_table_if_exist', function (result, cb) {
      let headers = result.list_table_headers && result.list_table_headers.headers || table_headers

      mysql.schema
        .createTable(table_name, (table) => {
          headers.forEach((col_name) => {
            if (col_name == 'id') {
              table.increments('id')
                .primary()
              return
            }

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

module.exports.createTable = createTable
