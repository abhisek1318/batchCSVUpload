const async = require('async');

const {
  testTable,
  createTable,
  fetchCount,
  insertIntoTable,
} = require('./modules/index')

const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'
const file_path = CSV_FILE_PATH
const { TABLE_A, TABLE_B, DEFAULT_BATCH_SIZE, TABLE_B_HEADERS } = require('./utils/constant');

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
  create_data_table: ['resume_task', function (result, cb) {

    let dataObj = {
      file_path: file_path,
      table_name: DATA_TABLE
    }

    createTable(dataObj, (err, res) => {
      if (err) {
        console.log('ERROR WHILE CREATING TABLE', err)
        return cb(err)
      }

      return cb(null, { headers: res.results })
    })
  }],
  create_report_table: ['create_data_table', function (result, cb) {
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
      table_headers: result.create_data_table && result.create_data_table.headers,
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




