const LoadCsvData = require('./modules/api').LoadCsvData

LoadCsvData((err, result) => {
  if (err) {
    console.log(err)
  }
  else console.log(result)
})

