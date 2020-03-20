'use strict'

const fs = require('fs'),
  stream = require('stream'),
  es = require('event-stream'),
  parse = require("csv-parse"),
  iconv = require('iconv-lite');

const csv = require('csv-stream')
const through2 = require('through2')


class CSVReader {
  constructor(filename, batchSize, columns, total_lines_to_skip) {
    this.reader = fs.createReadStream(filename)
    this.batchSize = batchSize || 1000
    this.lineNumber = 0
    this.data = []
    this.parseOptions = { delimiter: '\t', relax_column_count: true }
    this.columns = columns
    this.skip_count = total_lines_to_skip
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

        if (this.lineNumber < this.skip_count) {
          return cb(null, true)
        }

        if (this.lineNumber == 1) return cb(null, true)

        if (this.lineNumber % this.batchSize === 0) {
          this.reader.pause();
          callback(this.data)
        }

        this.data.push(row)
        cb()
      }))
      .on('data', data => {
        console.log('saved a row')
      })
      .on('end', () => {
        console.log('end')
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