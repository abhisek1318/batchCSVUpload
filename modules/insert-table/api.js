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
    offset,
  } = data;

  const parser = new CSVReader(CSV_FILE_PATH, batch_size, table_headers, offset)

  parser
    .read((batch) => {

      async.auto({
        insert_into_data_table: (cb) => {

          mysql
            .batchInsert(data_table, batch, batch_size)
            .then(function (ids) {
              parser.continue()
              return cb(null, {
                ab_batch_size: batch.length,
                batch_last_item_index: batch[batch.length - 1] && batch[batch.length - 1]['ID']
              })
            })
            .catch(function (err) {
              return cb(err)
            });
        },
        insert_into_report_table: ['insert_into_data_table', function (result, cb) {
          let { batch_last_item_index, ab_batch_size } = result.insert_into_data_table

          mysql(report_table)
            .insert({
              batch_size: ab_batch_size,
              status: 'success',
              completed_at: batch_last_item_index
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
