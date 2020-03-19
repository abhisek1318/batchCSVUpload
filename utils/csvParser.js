'use strict'

const fs = require('fs'),
  stream = require('stream'),
  es = require('event-stream'),
  parse = require("csv-parse"),
  iconv = require('iconv-lite');

class CSVReader {
  constructor(filename, batchSize, columns) {
    this.reader = fs.createReadStream(filename)
    this.batchSize = batchSize || 1000
    this.lineNumber = 0
    this.data = []
    this.parseOptions = { delimiter: '\t', quote: '"', columns: false, escape: ',', relax_column_count: true }
    this.columns = columns
    this.options = {
      delimiter: ',',
      columns: true,
      relax_column_count: true
    }
  }

  read(callback) {
    this.reader
      .pipe(es.split())
      .pipe(es.mapSync(line => {
        ++this.lineNumber

        if (this.lineNumber == 1) return

        let arr = line.split(',')
        var headers = this.columns;
        var obj = {};

        for (var j = 0; j < arr.length; j++) {
          obj[headers[j].trim()] = arr[j].trim();
        }
        this.data.push(obj);

        if (this.lineNumber % this.batchSize === 0) {
          this.reader.pause();
          callback(this.data)
        }
      })
        .on('error', function (err) {
          console.log('Error while reading file.', err)
        })
        .on('end', function () {
          console.log('Read entirefile.')
        }))
  }

  continue() {
    this.data = []
    this.reader.resume()
  }
}

module.exports = CSVReader