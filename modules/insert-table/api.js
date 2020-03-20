'use strict'

const async = require('async');
const mysql = require('../../utils/knex').mysql;

const CSVReader = require('../../utils/csvParser')
const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'

const insertIntoTable = function (data, _cb) {
  let {
    data_table,
    report_table,
    table_headers,
    batch_size,
    skip_count,
  } = data;

  let total_lines_to_skip = (skip_count * batch_size)
  let parser = new CSVReader(CSV_FILE_PATH, batch_size, table_headers, total_lines_to_skip)

  parser
    .read((batch) => {

      async.auto({
        insert_into_data_table: (cb) => {

          mysql
            .batchInsert(data_table, batch, batch_size)
            .then(function (ids) {
              console.log('success', ids)
              parser.continue()
              return cb(null)
            })
            .catch(function (err) {
              return cb(err)
            });
        },
        insert_into_report_table: ['insert_into_data_table', function (result, cb) {

          mysql(report_table)
            .insert({
              batch_size: batch_size,
              status: 'completed'
            })
            .then(function () {
              return cb(null)
            })
            .catch(function (err) {
              return cb(err)
            });
        }]
      }, function (error, results) {
        if (error) return _cb(error)

        return _cb(null, {
          results
        })
      })
    })
}

module.exports.insertIntoTable = insertIntoTable
