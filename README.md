
# fetch-timeout

Implement timeout and cancellation on top of node-fetch or standard fetch.


## Install

```sh
npm install fetch-timeout
```


## Usage

Replace any call to `fetch` with our helper `fetchTimeout`. Types are compatible as we only add a new option `timeout` that can be added when needed.

### With no timeout (normal fetch)

```ts
let reply = await fetch('https://www.example.com/', {
  method: 'POST',
  body: '...',
  headers: { ... },
})
```

### With a timeout

```ts
let reply = await fetch('https://www.example.com/', {
  method: 'POST',
  body: '...',
  headers: { ... },
  timeout: 30000, // milliseconds
})
```

### With a timeout and a cancel signal combined

```ts
let ctrl = new AbortController()

abortButton.addEventListener('click', () => ctrl.abort())

let reply = await fetch('https://www.example.com/', {
  method: 'POST',
  body: '...',
  headers: { ... },
  timeout: 30000,
  signal: controller.signal,
})
```


### Check if there was a timeout

```ts
try {
  let reply = await fetch('https://www.example.com/', {
    timeout: 5000,
  })
} catch (err: any) {
  if (err.name === 'AbortError') {
    ...
  }
}
```
