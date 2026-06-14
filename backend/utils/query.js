// Build a Mongoose query from express req.query supporting equality
// filters plus the SDK-style `sort` and `limit` params.
export async function runQuery(Model, reqQuery = {}) {
  const { sort, limit, offset, ...rest } = reqQuery
  const filter = {}

  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === "") continue
    filter[key] = value
  }

  // Map SDK `id` to Mongo `_id`
  if (filter.id) {
    filter._id = filter.id
    delete filter.id
  }

  let q = Model.find(filter)

  if (sort) {
    // "-created_date" => sort desc; "price" => asc; supports comma list
    q = q.sort(String(sort).split(",").join(" "))
  }
  if (offset) q = q.skip(parseInt(offset, 10))
  if (limit) q = q.limit(parseInt(limit, 10))

  return q.exec()
}
