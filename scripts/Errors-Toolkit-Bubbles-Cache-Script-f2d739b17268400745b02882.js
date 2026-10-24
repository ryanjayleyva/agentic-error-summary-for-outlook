import { exports } from 'integrator-api'

function preSavePage (options) {
  const integrations = getIntegrations()
  const bubbles = []

  for (const flow of options.data) {
    const integration = integrations.find((i) => i.integrationId === flow._integrationId)
    if (flow.disabled !== false || (integration && integration.sandbox !== false)) continue

    const addBubble = (bubbleId, type) => bubbles.push({
      bubbleId,
      type,
      flowId: flow._id,
      flowName: flow.name,
      integrationId: flow._integrationId,
      integrationName: integration ? integration.integrationName : null
    })
    const addStep = (step) => addBubble(step.type === 'import' ? step._importId : step._exportId, step.type)

    for (const step of flow.pageGenerators || []) addBubble(step._exportId, 'export')
    for (const step of flow.pageProcessors || []) addStep(step)
    for (const router of flow.routers || []) {
      for (const branch of router.branches || []) {
        for (const step of branch.pageProcessors || []) addStep(step)
      }
    }
  }

  return {
    data: bubbles,
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}

// Fetch every integration so sandbox flows can be skipped
function getIntegrations () {
  const response = exports.runVirtual({
    export: {
      _connectionId: 'celigoconnection',
      apiIdentifier: 'e2075486b3',
      asynchronous: true,
      oneToMany: false,
      http: {
        relativeURI: '/v1/integrations',
        method: 'GET',
        requestMediaType: 'json',
        successMediaType: 'json',
        errorMediaType: 'json',
        isRest: false,
        formType: 'http',
        paging: { method: 'linkheader' }
      },
      adaptorType: 'HTTPExport'
    }
  })

  return ((response && response.data) || []).map((integration) => ({
    integrationId: integration._id,
    integrationName: integration.name,
    sandbox: integration.sandbox
  }))
}
