
export class AbortError extends Error {
  public type: string

  constructor(message: string, type = 'aborted') {
    super(message)
    this.type = type
  }
}

export async function fetchTimeout(request: RequestInfo, options?: RequestInit & { timeout?: number }): Promise<Response> {
  let ctrl = new AbortController()
  let ctrlTimeout: AbortController | undefined
  try {
    options?.signal?.addEventListener('abort', () => ctrl.abort())

    let fetch = globalThis.fetch
    if (!fetch) {
      fetch = (await import ('node-fetch')).default as any
    }

    if (ctrl.signal.aborted) {
      throw new AbortError('The operation was aborted.')
    }

    let response = fetch(request, {
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

