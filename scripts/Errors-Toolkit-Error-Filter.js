function preSavePage (options) {
  const { lookbackvalue, lookbackinterval } = options.settings.integration

  if (!Number.isFinite(Number(lookbackvalue)) || lookbackinterval == null) {
    throw new Error('Missing or unsupported lookback configuration.')
  }

  // ISO strings sort in time order, so a string compare is enough
  const cutoff = new Date(Date.now() - Number(lookbackvalue) * lookbackinterval).toISOString()

  const data = options.data
    .map((record) => record.errors.filter((error) => error.occurredAt >= cutoff))
    .filter((errors) => errors.length > 0)
    .map((errors) => ({ errors }))

  return {
    data,
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}
