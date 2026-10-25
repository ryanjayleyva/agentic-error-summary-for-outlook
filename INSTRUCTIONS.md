# Setup instructions

Follow these steps to install the template and configure it. Do them in
order.

## Before you start

Have these ready.

- An integrator.io account with permission to create connections and tokens.
- An iClient for the Celigo API connection (client ID and secret).
- The Outlook mailbox that will send the email. You sign in to it once.
- Your account region. Check the URL you use to sign in to integrator.io.
  `eu.integrator.io` means Europe. `integrator.io` means North America.

## 1. Download the zip

Download `dist/agentic-error-summary-for-outlook.zip` from this repo.

## 2. Sign in to integrator.io

Sign in at `integrator.io/signin`. Use the sign-in URL for your region if
your account is not in North America.

## 3. Upload the zip

Click Upload at the top right and select the zip file.

## 4. Set up the connections and install

The installer asks for three connections. Create each one, run Test
connection, and confirm it is online. Then click Install.

**Integrator IO** (Celigo integrator.io, token auth)

- Create an API token. Open `integrator.io/accesstokens`, or click Resources
  in the sidebar and select API tokens, then create the token.
- Paste the token into the connection.
- Set Region to match your account (see Change the region below).

**Celigo API Connection** (Celigo APIs, OAuth client credentials)

- Enter the client ID and secret from your iClient.
- Change the Base URI and Token URI if your account is not in North America
  (see Change the region below).

**Outlook Mail Connection** (Microsoft Outlook Mail, OAuth)

- Keep the scopes `Mail.Send`, `User.Read`, and `offline_access`.
- Select Save and authorize, then sign in with the sending mailbox.

After the install, open the new Agentic Error Summary for Outlook
integration and keep it open for the steps below.

## 5. Confirm the connection on every step

Open each flow. Check each step listed below uses the connection shown.
Register the connections on the integration and fix any step that is
missing one.

**Build Flow Step Inventory for Error Summary**

- Errors Toolkit - Get All Flows uses Integrator IO.
- Errors Toolkit - Get Import/Export Bubble Details uses Integrator IO.
- Write Import/Export Bubbles JSON to File Storage uses Celigo API Connection.

**Collect Recent Errors for Each Flow Step**

- Errors Toolkit - Get Bubbles From File Storage uses Celigo API Connection.
- Errors Toolkit - Get Errors Per Bubble uses Integrator IO.
- Post Errors to File Storage uses Celigo API Connection.

**Summarize Errors and Email Through Outlook**

- Errors Toolkit - Get Errors From File uses Celigo API Connection.
- Email Error Summary with Outlook uses Outlook Mail Connection.

The AI agent step has no connection attached. See Change the AI model.

## 6. Set the alias

Set the `celigoconnection` alias on the integration to your Celigo API
Connection. The Errors Toolkit - Bubbles Cache Script calls the integrator.io
API through this alias to list your integrations. If the alias is wrong or
missing, flow 1 fails.

## 7. Set the recipient

Update the script with the real Outlook email address.

- Flow `Summarize Errors and Email Through Outlook`
- Step `Email Error Summary with Outlook` (the import that sends the email)
- Script `Email Error Summary with Outlook preMap`
  (`scripts/Email-Error-Summary-with-Outlook-preMap.js` in this repo)

Open Resources, then Scripts, and edit the script. Replace the placeholder
at the top.

```js
const RECIPIENT = 'recipient@example.com'
```

Use the address that should receive the summary. Save the script.

The email goes out as the mailbox you authorized in step 4. The import calls
`/me/sendMail`, so it always sends as that signed-in user. It does not send
from a shared mailbox. To send from a shared mailbox you must change the
import to the `/users/{id}/sendMail` endpoint and grant that access in
Microsoft. This template does not do that for you.

To send to more than one person, add more entries to the `toRecipients`
array in the same script.

## 8. Confirm the file storage folder

Four steps read or write a Celigo file storage folder named after the
integration. The default is `Agentic Error Summary for Outlook`. If you
renamed the integration, set the same name in the file path field of these
steps.

- Errors Toolkit - Get Bubbles From File Storage
- Errors Toolkit - Get Errors From File
- Write Import/Export Bubbles JSON to File Storage
- Post Errors to File Storage

Use one identical folder name in all four. A mismatch means a flow cannot
find the file the previous flow wrote.

## 9. Set the lookback window

Open the integration settings and set both fields.

- Lookback value is a number. The default is 24.
- Lookback interval is Minutes, Hours, or Days. The default is Hours.

The defaults include errors from the last 24 hours. Match this window to
your schedule. A daily schedule pairs with 24 hours.

## 10. Change the AI model

The AI agent step uses OpenAI `gpt-5-mini`. No connection is attached to it,
so it runs on the platform default access. If a run fails with an access or
billing error, attach your own OpenAI connection to the step.

Edit the prompt in the agent step to change the wording, the tone, or how
many flows appear. The prompt ships with these rules.

- Group errors by flow and rank flows by error count.
- Show at most the top 10 flows and the top 3 messages per flow.
- Collapse messages that differ only by IDs, SKUs, or timestamps.

The agent must return exactly two fields, `subject` and `body_html`. Keep
them, because the preMap script reads both.

## 11. Run it once by hand

Run Build Flow Step Inventory for Error Summary. It starts the other two.
Confirm all of these.

- All three flows finish with no errors in the dashboard.
- An email arrives at the recipient address.
- The counts in the email match the open errors in your account.

Do not run it repeatedly in a short time. Microsoft can throttle or block a
mailbox that sends repeated automated mail.

## 12. Schedule it

Add a schedule to Build Flow Step Inventory for Error Summary only. The
other two flows start from it. Do this after the manual run works.

## Change the region

The template ships set to North America. For a European account, change two
connections.

**Integrator IO**

- Set Region to Europe. The base URI resolves to `api.eu.integrator.io`.

**Celigo API Connection**

- Replace the host in Base URI with `api.eu.integrator.io`. Keep the
  `https` scheme.
- Replace the host in Token URI with `api.eu.integrator.io`. Keep the
  `/v1/oauth/accessToken` path and the `https` scheme.

The Bubbles Cache Script uses the Celigo API Connection through the alias,
so it follows that change.

The Region setting on Integrator IO offers only North America and Europe.
Celigo also runs other regions, such as Canada and Australia. This template
does not support them out of the box. Confirm the host for your account in
the Celigo docs before you edit the connections by hand.

## What gets summarized

Know these limits before you trust the output.

- Disabled flows are skipped.
- Flows inside a sandbox integration are skipped.
- Only open errors inside the lookback window are included.
- Steps with no open errors are dropped from the saved file.

## Troubleshooting

**Flow 1 fails right away.** Check the `celigoconnection` alias and the
Celigo API Connection. Confirm both connections are online.

**Flow 1 returns nothing.** Check that your flows are enabled and are not
in a sandbox integration.

**Flow 2 or 3 cannot find a file.** The folder name differs between the
four file steps. Make them identical.

**No email arrives.** Open the Email Error Summary with Outlook step errors.
Re-authorize the Outlook connection. Confirm the recipient in the script.

**The summary is empty but errors exist.** The errors are older than the
lookback window. Raise the lookback value.

**Everything fails with auth errors after moving regions.** Check both
connections. The Integrator IO region and the Celigo API URIs must match.
