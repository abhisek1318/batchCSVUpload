'use strict'

const async = require('async');
const mysql = require('../../utils/knex').mysql;

const CSVReader = require('../../utils/csvParser')
const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'

const insertIntoTable = function (data, _cb) {
  let { table_name, table_headers, batch_size, skip } = data;

  let parser = new CSVReader(CSV_FILE_PATH, batch_size, table_headers, skip)

  async.auto({
    populate_table: (cb) => {
      parser
        .read((batch) => {
          mysql
            .batchInsert(table_name, batch, 2000)
            .then(function (ids) {
              console.log('success', ids)
              parser.continue()
            })
            .catch(function (err) {
              return cb(err)
            });
        })
      return cb()
    }
  }, function (error, results) {
    if (error) return _cb(error)

    return _cb(null, {
      results
    })
  })
}

module.exports.insertIntoTable = insertIntoTable
