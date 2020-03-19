const mysql = require('../utils/knex').mysql;
const parse = require('csv-parse');
const fs = require('fs');
const async = require('async');
const csvHeaders = require('csv-headers');
var es = require('event-stream');

const CSVReader = require('../utils/csvParser')
const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'
const TABLE_NAME = 'Table-A';


const LoadCsvData = function (_cb) {

  async.auto({
    list_data_headers: (cb) => {
      csvHeaders({
        file: CSV_FILE_PATH,
        delimiter: ','
      }, function (err, headers) {
        if (err) {
          return cb(err)
        }

        return cb(null, { headers: headers })
      });
    },
    check_if_table_exist: (cb) => {
      mysql.schema.
        dropTableIfExists(TABLE_NAME)
        .then(() => {
        })
        .catch((err) => {
          console.log(err)
        })
      return cb(null)
    },
    create_new_table: ['check_if_table_exist', 'list_data_headers', function (result, cb) {
      let headers = result.list_data_headers.headers

      mysql.schema
        .createTable(TABLE_NAME, (table) => {
          headers.forEach((col_name) => {
            table.text(col_name)
          })
        })
        .then(data => {
          console.log('success', data)
          return cb(null);
        })
        .catch(err => {
          console.log(err)
          return cb(err)
        })
    }],
    populate_table_data: ['create_new_table', function (result, cb) {
      let parser = new CSVReader(CSV_FILE_PATH, 1000, result.list_data_headers.headers)

      parser.read((data) => {
        console.log('DATA-----', data)
        mysql
          .batchInsert(TABLE_NAME, data, 1000)
          .then(function (ids) {
            console.log('success', ids)
            parser.continue()
          })
          .catch(function (error) {
            console.log('ERROR------', error)
          });
      })
      return cb()
    }]
  }, function (error, results) {
    if (error) return _cb(error)

    return _cb(null, {
      results
    })
  })
}

module.exports.LoadCsvData = LoadCsvData
