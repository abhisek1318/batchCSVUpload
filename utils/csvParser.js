'use strict'

const fs = require('fs')
const csv = require('csv-stream')
const through2 = require('through2')

class CSVReader {
  constructor(filename, batchSize, columns, total_lines_to_skip) {
    this.data = []
    this.lineNumber = 0
    this.columns = columns
    this.batchSize = batchSize || 1000
    this.skip_count = total_lines_to_skip
    this.reader = fs.createReadStream(filename)
  }

  read(callback) {
    this.reader
      .pipe(csv.createStream({
        endLine: '\n',
        columns: this.columns,
        escapeChar: '"',
        enclosedChar: '"'
      }))
      .pipe(through2({ objectMode: true }, (row, enc, cb) => {
        ++this.lineNumber

        if (this.lineNumber < this.skip_count || this.lineNumber == 1) {
          return cb(null, true)
        }

        if (this.lineNumber % this.batchSize === 0) {
          this.reader.pause();
          callback(this.data)
        }

        this.data.push(row)
        cb()
      }))
      .on('data', data => {
      })
      .on('end', () => {
      })
      .on('error', err => {
        console.error(err)
      })
  }

  continue() {
    this.data = []
    this.reader.resume()
  }
}

module.exports = CSVReader