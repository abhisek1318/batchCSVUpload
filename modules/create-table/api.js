'use strict'

const async = require('async')
const mysql = require('../../utils/knex').mysql
const testTable = require('../test-table/api').testTable

const createTable = function (data, _cb) {
  let { table_name, table_headers } = data

  async.auto({
    check_table_if_exist: (cb) => {

      let dataObj = {
        table_name: table_name
      }

      testTable(dataObj, (err, exists) => {
        if (exists) {
          return _cb(null, {})
        }

        else cb(null)
      })
    },
    create_new_table: ['check_table_if_exist', function (result, cb) {
      let headers = table_headers

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
