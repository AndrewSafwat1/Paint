import type { AnyShape } from '../types/shapes'

const BASE = 'http://localhost:8081/paint'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function jsonPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return res.json() as Promise<T>
}

async function jsonPostVoid(url: string, body?: unknown): Promise<void> {
  await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

async function jsonPutVoid(url: string, body: unknown): Promise<void> {
  await fetch(url, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
}

export const paintApi = {
  createShape(shape: AnyShape): Promise<void> {
    return jsonPostVoid(`${BASE}/create`, shape)
  },

  updateShape(shape: AnyShape): Promise<void> {
    return jsonPutVoid(`${BASE}/update`, shape)
  },

  removeShape(id: string): Promise<AnyShape[]> {
    return fetch(`${BASE}/remove/${id}`, { method: 'DELETE', headers: JSON_HEADERS })
      .then(r => r.json() as Promise<AnyShape[]>)
  },

  cloneShape(oldId: string, newId: string, shape: AnyShape): Promise<AnyShape> {
    return jsonPost<AnyShape>(`${BASE}/clone/${oldId}/${newId}`, shape)
  },

  undo(): Promise<AnyShape[]> {
    return jsonPost<AnyShape[]>(`${BASE}/undo`)
  },

  redo(): Promise<AnyShape[]> {
    return jsonPost<AnyShape[]>(`${BASE}/redo`)
  },

  clearAll(): Promise<void> {
    return jsonPostVoid(`${BASE}/clearAll`)
  },

  save(path: string, idCounter: string): Promise<void> {
    return fetch(`${BASE}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ path, idCounter }),
    }).then(() => void 0)
  },

  load(path: string): Promise<{ idCounter: number; lastUpdate: AnyShape[] }> {
    return fetch(`${BASE}/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ path }),
    }).then(r => r.json())
  },
}
