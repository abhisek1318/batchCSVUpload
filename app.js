const async = require('async');

const {
  insertIntoTable,
  testTable,
  initTable
} = require('./modules/index')

const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'
const file_path = process.argv[4] || CSV_FILE_PATH
const { TABLE_A, TABLE_B, DEFAULT_BATCH_SIZE } = require('./utils/constant');

async.auto({
  table_exist: (cb) => {

    let dataObj = {
      table_name: TABLE_B
    }

    testTable(dataObj, (err, exists) => {
      return cb(null, {
        table_B_exist: exists
      })
    })
  },
  should_resume_task: ['table_exist', function (result, cb) {
    let { table_B_exist } = result.table_exist;

    if (!table_B_exist) return cb(null) // start from scratch
  }],
  create_table: ['should_resume_task', function (result, cb) {

    let dataObj = {
      file_path: file_path,
      table_name: TABLE_A
    }

    initTable(dataObj, (err, res) => {
      if (err) {
        console.log('ERROR WHILE CREATING TABLE', err)
        return cb(err)
      }

      return cb(null, { headers: res.results })
    })
  }],
  insert_into_table: ['create_table', function (result, cb) {

    let dataObj = {
      table_name: TABLE_A,
      skip_row: 100,
      batch_size: DEFAULT_BATCH_SIZE,
      table_headers: result.create_table.headers,
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




