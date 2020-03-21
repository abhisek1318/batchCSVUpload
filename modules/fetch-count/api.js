'use strict'

const { mysql } = require('../../utils/knex')

const fetchCount = function (data, _cb) {
  let { table_name } = data

  let table = mysql(table_name)
    .count('*')

  if (data.status === 'completed') table.where(`${table.status}`, data.status)

  table
    .then((table) => {
      return _cb(null, table[0]['count(*)'])
    })
    .catch((error) => {
      console.log(error)
      return _cb({ code: 'DB_FETCH_ERROR' })
    })
}

module.exports.fetchCount = fetchCount