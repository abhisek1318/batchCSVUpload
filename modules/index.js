module.exports = {
  createTable: require('./create-table/api').createTable,
  testTable: require('./test-table/api').testTable,
  fetchCount: require('./fetch-count/api').fetchCount,
  insertIntoTable: require('./insert-table/api').insertIntoTable,
}