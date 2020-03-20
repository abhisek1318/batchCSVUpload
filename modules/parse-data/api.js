'use strict'

const async = require('async');
const mysql = require('../../utils/knex').mysql;

const CSVReader = require('../../utils/csvParser')
const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'

const LoadCsvData = function (_cb) {
  async.auto({
    populate_table_data: ['create_new_table', function (result, cb) {
      let parser = new CSVReader(CSV_FILE_PATH, 2000, result.list_data_headers.headers)

      parser.read((data) => {
        mysql
          .batchInsert(TABLE_A, data, 2000)
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
