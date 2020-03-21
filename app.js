const async = require('async');
const csvHeaders = require('csv-headers')

const {
  testTable,
  createTable,
  fetchCount,
  insertIntoTable,
} = require('./modules/index')

const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'
const file_path = CSV_FILE_PATH
const { TABLE_A, TABLE_B, DEFAULT_BATCH_SIZE, TABLE_B_HEADERS } = require('./utils/constant');
// require('./utils/worker');

const DATA_TABLE = TABLE_A
const REPORT_TABLE = TABLE_B

async.auto({
  report_table_exist: (cb) => {
    let dataObj = {
      table_name: REPORT_TABLE
    }

    testTable(dataObj, (err, exists) => {
      return cb(null, {
        report_table_exist: exists
      })
    })
  },
  list_table_headers_from_csv: (cb) => {

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
  resume_task: ['report_table_exist', function (result, cb) {
    let { report_table_exist } = result.report_table_exist;

    if (!report_table_exist) return cb(null) // start from scratch

    let dataObj = {
      table_name: REPORT_TABLE,
      status: 'success'
    }

    fetchCount(dataObj, (err, count) => {
      if (err) {
        console.log('ERROR FETCHING STATUS REPORT', err)
        return cb(err)
      }

      return cb(null, { skip_count: count })
    })
  }],
  create_data_table: ['list_table_headers_from_csv', 'resume_task', function (result, cb) {
    let { headers } = result.list_table_headers_from_csv;

    let dataObj = {
      table_headers: headers,
      table_name: DATA_TABLE,
    }

    createTable(dataObj, (err, res) => {
      if (err) {
        console.log('ERROR WHILE CREATING TABLE', err)
        return cb(err)
      }

      return cb(null, res)
    })
  }],
  create_report_table: ['report_table_exist', function (result, cb) {
    let { report_table_exist } = result.report_table_exist;

    if (report_table_exist) return cb(null)

    let dataObj = {
      table_name: REPORT_TABLE,
      table_headers: TABLE_B_HEADERS
    }

    createTable(dataObj, (err, res) => {
      if (err) {
        console.log('ERROR WHILE CREATING TABLE', err)
        return cb(err)
      }

      return cb(null, { headers: res.results })
    })
  }],
  insert_into_data_table: ['create_report_table', function (result, cb) {

    let dataObj = {
      data_table: DATA_TABLE,
      report_table: REPORT_TABLE,
      skip_count: result.resume_task && result.resume_task.skip_count,
      batch_size: DEFAULT_BATCH_SIZE,
      table_headers: result.list_table_headers_from_csv && result.list_table_headers_from_csv.headers,
    }

    insertIntoTable(dataObj, (err, res) => {
      if (err) {
        console.log('ERROR WHILE PARSING DATA', err)
        return cb(err)
      }

      return cb(res)
    })
  }]
}, function (error, results) {
  if (error) {
    console.log(error.stack)
  }
  console.log({ results })
})




