// Shared toJSON transform: expose `id`, hide `_id`, `__v`, and password.
export const toJSONPlugin = (schema) => {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : ret.id
      delete ret._id
      delete ret.password
      return ret
    },
  })
}
