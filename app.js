const async = require('async');

const {
  LoadCsvData,
  testTable,
  initTable
} = require('./modules/index')

const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'
const file_path = process.argv[4] || CSV_FILE_PATH
const { TABLE_A, TABLE_B } = require('./utils/constant');

async.auto({
  table_exist: (cb) => {

    testTable(TABLE_B, (err, exists) => {
      return cb(null, {
        table_B_exist: exists
      })
    })
  },
  should_resume_task: ['table_exist', function (result, cb) {
    let { table_B_exist } = result.table_exist;

    if (!table_B_exist) return cb(null)

  }],
  create_table: ['should_resume_task', function (result, cb) {

    initTable(file_path, TABLE_A, (err, res) => {
      if (err) {
        console.log('ERROR WHILE CREATING TABLE', err)
        return cb(err)
      }

      return cb(null, res)
    })
  }]
}, function (error, results) {
  if (error) {
    console.log(error)
  }
  console.log({ results })
})




