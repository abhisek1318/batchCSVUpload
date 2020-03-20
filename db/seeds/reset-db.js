const { TABLE_A, TABLE_B } = require('../../utils/constant')

exports.seed = knex => {
  return (
    knex.schema
      .dropTableIfExists(TABLE_A)
      .dropTableIfExists(TABLE_B)
      .then(() => {
      })
      .catch((err) => {
        console.log(err)
      })
  )
}