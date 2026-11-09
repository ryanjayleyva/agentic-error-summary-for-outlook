// Combine every record into one so the AI agent runs once
function preSavePage (options) {
  return {
    data: [{ flowBubbles: options.data }],
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}
