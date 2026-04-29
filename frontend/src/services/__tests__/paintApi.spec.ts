import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { paintApi } from '../paintApi'
import type { CircleShape } from '../../types/shapes'

const circleShape: CircleShape = {
  id: '1', name: 'circle', radius: 60, fill: '#fff', stroke: 'black',
  strokeWidth: 3, draggable: true,
}

function mockFetch(body: unknown, ok = true, status = 200) {
  const response = {
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  }
  return vi.fn().mockResolvedValue(response)
}

beforeEach(() => { vi.stubGlobal('fetch', undefined) })
afterEach(() => { vi.unstubAllGlobals() })

describe('paintApi', () => {
  // ── createShape ───────────────────────────────────────────────────────────

  it('createShape sends POST /paint/create with JSON body', async () => {
    const fetchMock = mockFetch(null)
    vi.stubGlobal('fetch', fetchMock)

    await paintApi.createShape(circleShape)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:8081/paint/create')
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(opts.body)).toMatchObject({ name: 'circle', id: '1' })
  })

  // ── updateShape ───────────────────────────────────────────────────────────

  it('updateShape sends PUT /paint/update with JSON body', async () => {
    const fetchMock = mockFetch(null)
    vi.stubGlobal('fetch', fetchMock)

    await paintApi.updateShape(circleShape)

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:8081/paint/update')
    expect(opts.method).toBe('PUT')
    expect(opts.headers['Content-Type']).toBe('application/json')
  })

  // ── removeShape ───────────────────────────────────────────────────────────

  it('removeShape sends DELETE /paint/remove/{id} and returns parsed list', async () => {
    const fetchMock = mockFetch([circleShape])
    vi.stubGlobal('fetch', fetchMock)

    const result = await paintApi.removeShape('1')

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:8081/paint/remove/1')
    expect(opts.method).toBe('DELETE')
    expect(result).toEqual([circleShape])
  })

  // ── cloneShape ────────────────────────────────────────────────────────────

  it('cloneShape sends POST /paint/clone/{oldId}/{newId}', async () => {
    const cloned = { ...circleShape, id: '99' }
    const fetchMock = mockFetch(cloned)
    vi.stubGlobal('fetch', fetchMock)

    const result = await paintApi.cloneShape('1', '99', circleShape)

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:8081/paint/clone/1/99')
    expect(result).toMatchObject({ id: '99' })
  })

  // ── undo / redo ───────────────────────────────────────────────────────────

  it('undo sends POST /paint/undo and returns shape list', async () => {
    const fetchMock = mockFetch([circleShape])
    vi.stubGlobal('fetch', fetchMock)

    const result = await paintApi.undo()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:8081/paint/undo')
    expect(result).toEqual([circleShape])
  })

  it('redo sends POST /paint/redo and returns shape list', async () => {
    const fetchMock = mockFetch([circleShape])
    vi.stubGlobal('fetch', fetchMock)

    const result = await paintApi.redo()

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:8081/paint/redo')
    expect(result).toEqual([circleShape])
  })

  // ── saveContent ───────────────────────────────────────────────────────────

  it('saveContent sends POST /paint/saveContent with format and idCounter params', async () => {
    const fetchMock = mockFetch('{"idCounter":"3"}')
    vi.stubGlobal('fetch', fetchMock)

    const result = await paintApi.saveContent('json', '3')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('/paint/saveContent')
    expect(url).toContain('format=json')
    expect(url).toContain('idCounter=3')
    expect(result).toBe('{"idCounter":"3"}')
  })

  it('saveContent throws when response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetch(null, false, 500))

    await expect(paintApi.saveContent('json', '1')).rejects.toThrow('Save failed')
  })

  // ── loadContent ───────────────────────────────────────────────────────────

  it('loadContent sends POST with Content-Type text/plain and string body', async () => {
    const fetchMock = mockFetch({ idCounter: '5', lastUpdate: [] })
    vi.stubGlobal('fetch', fetchMock)

    await paintApi.loadContent('{"idCounter":"5","lastUpdate":[]}', 'json')

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toContain('/paint/loadContent')
    expect(url).toContain('format=json')
    expect(opts.headers['Content-Type']).toBe('text/plain; charset=utf-8')
    expect(typeof opts.body).toBe('string')
  })

  it('loadContent returns parsed idCounter and lastUpdate', async () => {
    vi.stubGlobal('fetch', mockFetch({ idCounter: '7', lastUpdate: [circleShape] }))

    const result = await paintApi.loadContent('...', 'json')

    expect(result.idCounter).toBe('7')
    expect(result.lastUpdate).toHaveLength(1)
  })

  it('loadContent throws when response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetch(null, false, 422))

    await expect(paintApi.loadContent('bad', 'json')).rejects.toThrow('Load failed')
  })
})
