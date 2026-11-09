// TODO: Replace with your Outlook email address or the recipient of the error summary
// NOTE: To send to multiple recipients, make this an array, e.g.
//   const RECIPIENT = ['first@example.com', 'second@example.com']
// and update toRecipients below to map over it:
//   toRecipients: [].concat(RECIPIENT).map(address => ({ emailAddress: { address } }))
const RECIPIENT = 'recipient@example.com'

function buildOutlookMessages(options) {
  let errorCount = 0

  const results = options.data.map(record => {
    const invalidFields = ['email_subject', 'email_body_html'].filter(
      field => typeof record?.[field] !== 'string'
    )

    if (invalidFields.length > 0) {
      errorCount++
      return {
        errors: [
          {
            code: 'INVALID_EMAIL_FIELDS',
            message: `Required field(s) must be present and strings: ${invalidFields.join(', ')}`,
            source: invalidFields.join(', ')
          }
        ]
      }
    }

    return {
      data: {
        message: {
          subject: record.email_subject,
          body: { contentType: 'HTML', content: record.email_body_html },
          toRecipients: [{ emailAddress: { address: RECIPIENT } }]
        },
        saveToSentItems: true
      }
    }
  })

  console.log(
    `Processed ${options.data.length} email record(s) with ${errorCount} error(s).`
  )
  return results
}
