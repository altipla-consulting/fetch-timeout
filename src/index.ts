
import nodeFetch, { AbortError } from 'node-fetch'

export async function fetchTimeout(request: RequestInfo, options?: RequestInit & { timeout?: number }): Promise<Response> {
  let ctrl = new AbortController()
  let ctrlTimeout: AbortController | undefined
  try {
    options?.signal?.addEventListener('abort', () => ctrl.abort())

    let response = (globalThis.fetch || nodeFetch)(request, {
      ...options,
      signal: ctrl.signal,
    })

    if (options?.timeout) {
      ctrlTimeout = new AbortController()
      let aborter = abortableTimeout(options.timeout, ctrlTimeout.signal)
      let race = await Promise.race([aborter, response])
      if (!race) {
        ctrl.abort()
        throw new AbortError('The operation timed out.')
      }
    }

    return response
  } finally {
    ctrlTimeout?.abort()
  }
}

function abortableTimeout(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    let id = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(id)
      reject()
    })
  })
}

