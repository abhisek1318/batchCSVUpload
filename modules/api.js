const mysql = require('../utils/knex').mysql;
const parse = require('csv-parse');
const fs = require('fs');
const async = require('async');
const csvHeaders = require('csv-headers');
var es = require('event-stream');

const CSV_FILE_PATH = './utils/bezkoder.csv'
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
            if (col_name.toLowerCase() == 'id') {
              table.increments('ID')
                .primary()
            }
            else table.text(col_name)
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
      fs
        .createReadStream(CSV_FILE_PATH)
        .pipe(es.split())
        .pipe(
          es
            .mapSync(function (line) {
              console.log(line)
            })
            .on('error', function (err) {
              console.log('Error while reading file.', err);
            })
            .on('end', function () {

            }),
        );
      // fs.createReadStream(CSV_FILE_PATH)
      //   .pipe(parse({
      //     delimiter: ',',
      //     columns: true,
      //     relax_column_count: true
      //   }, (err, data) => {
      //     if (err) {
      //       console.log(err)
      //       return cb(err);
      //     }

      //     async.eachSeries(data, (row, next) => {
      //       mysql(TABLE_NAME)
      //         .insert(row)
      //         .then(() => {
      //           return next();
      //         })
      //         .catch((err) => {
      //           console.log(err)

      //           return cb(err)
      //         })
      //     },
      //       err => {
      //         if (err) return cb(err);

      //         return cb(null);
      //       });
      //   }));
    }]
  }, function (error, results) {
    if (error) return _cb(error)

    return _cb(null, {
      results
    })
  })
}

module.exports.LoadCsvData = LoadCsvData
