'use strict'

const { mysql } = require('../../utils/knex')

const fetchCount = function (data, _cb) {
  let { table_name } = data

  let table = mysql(table_name)
    .sum('batch_size')

  // if (data.status === 'completed') {
  //   table.where(`${table.status}`, data.status)
  // }
  // .orderBy('id', 'desc')
  // .first('id', 'completed_at')

  table
    .then((table) => {
      return _cb(null, table[0]['sum(`batch_size`)'])
    })
    .catch((error) => {
      console.log(error)
      return _cb({ code: 'DB_FETCH_ERROR' })
    })
}

module.exports.fetchCount = fetchCount