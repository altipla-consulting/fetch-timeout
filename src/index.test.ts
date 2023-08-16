
import { fetchTimeout } from './index'
import { test, expect } from 'vitest'
import { AbortError, Response as NodeFetchResponse } from 'node-fetch'


//@ts-expect-error Node 16 does not have global support for responses yet.
globalThis.Response = NodeFetchResponse

function mockFetch(ms: number) {
  globalThis.fetch = function(_request: URL | RequestInfo, options?: RequestInit) {
    return new Promise((resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new AbortError('The operation was aborted.')))
      setTimeout(() => resolve(new Response('foo')), ms)
    })
  }
}

test('normal fetch within the timeout', async () => {
  mockFetch(100)

  let response = await fetchTimeout('https://www.example.com/', { timeout: 300 })
  expect(await response.text()).toBe('foo')
})

test('fetch with timeout', async () => {
  mockFetch(300)

  expect(fetchTimeout('https://www.example.com/', { timeout: 100 })).rejects.toThrowError('The operation timed out.')
})

test('fetch aborted before timeout', async () => {
  mockFetch(200)

  let ctrl = new AbortController()
  let response = fetchTimeout('https://www.example.com/', {
    timeout: 100,
    signal: ctrl.signal,
  })
  setTimeout(() => ctrl.abort(), 50) // Wait some time so node-fetch was actually imported before aborting.

  expect(response).rejects.toThrowError('The operation was aborted.')
})
