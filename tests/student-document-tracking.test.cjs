const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const crypto = require('node:crypto')

function moduleAt(path, dependencies = {}) {
  const source = fs.readFileSync(path, 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const context = { exports: {}, Buffer, Date, URL, URLSearchParams, File, FormData, AbortSignal, process: { env: { NODE_ENV: 'test' } }, fetch: dependencies.fetch, require: name => {
    if (name === 'server-only') return {}
    if (name in dependencies) return dependencies[name]
    return require(name)
  } }
  vm.runInNewContext(code, context)
  return context.exports
}
const { studentDocumentItems } = moduleAt('lib/student-document-items.ts')
const file = id => ({ id, filename: id + '.pdf', url: 'https://example.com/' + id })
const student = { id: 'recStudent', fields: { 'Documents admission originaux': [file('original')] } }
const folders = [
  { id: 'recFolder', fields: { Prospect: ['recStudent'], Documents: [file('translated')] } },
  { id: 'recOther', fields: { Prospect: ['recOtherStudent'], Documents: [file('private')] } },
]
const reviews = [{ id: 'recReview', fields: {
  'Student Record ID': 'recStudent', Source: 'Academic', 'Document Key': 'Academic:recFolder:Documents:translated',
  'Review Status': 'Needs correction', 'Correction Reason': 'Page illisible', 'Internal Note': 'PRIVATE NOTE',
  Versions: [file('version1'), file('version2')],
} }]
test('keeps originals separate, excludes other students and returns latest version first', () => {
  const items = studentDocumentItems(student, folders, reviews)
  assert.equal(items.length, 2)
  assert.equal(items[0].group, 'original')
  assert.equal(items[1].group, 'final')
  assert.equal(items[1].files[0].id, 'version2')
  assert.equal(items[1].files[2].id, 'translated')
  assert.equal(items[1].reason, 'Page illisible')
  assert.equal(JSON.stringify(items).includes('PRIVATE NOTE'), false)
})
test('includes missing requests without mixing in another student or source', () => {
  const request = { id: 'recRequest', fields: { 'Student Record ID': 'recStudent', Source: 'Academic', 'Document Key': 'requested-1', 'Document Name': 'Diplôme', 'Review Status': 'Missing' } }
  const items = studentDocumentItems(student, [], [request, { id: 'foreign', fields: { ...request.fields, 'Student Record ID': 'recOther' } }, { id: 'visa', fields: { ...request.fields, Source: 'Visa' } }])
  assert.equal(items.length, 2)
  assert.equal(items[1].name, 'Diplôme')
  assert.equal(items[1].files.length, 0)
})
test('rejects unsafe attachment links', () => {
  const items = studentDocumentItems({ id: 'recStudent', fields: { 'Documents admission originaux': [{ ...file('unsafe'), url: 'javascript:alert(1)' }] } }, [], [])
  assert.equal(items.length, 0)
})
const sessions = moduleAt('lib/student-document-session.ts', { '@/lib/airtable-config': { getAirtableApiKey: () => 'test-key-not-a-real-secret' } })
function requestWith(cookie) { return { cookies: { get: () => cookie ? { value: cookie } : undefined } } }
test('signed session rejects missing, tampered and expired cookies', () => {
  let cookie
  sessions.setDocumentSession({ cookies: { set: (_name, value, options) => { cookie = value; assert.equal(options.httpOnly, true) } } }, { id: 'recStudent', folderId: 'TEST123', email: 'test@example.com' })
  assert.equal(sessions.documentSession(requestWith(cookie)).id, 'recStudent')
  assert.equal(sessions.documentSession(requestWith()), null)
  assert.equal(sessions.documentSession(requestWith(cookie + 'tampered')), null)
  const payload = Buffer.from(JSON.stringify({ id: 'recStudent', email: 'test@example.com', folderId: 'TEST123', expires: 0 })).toString('base64url')
  const signature = crypto.createHmac('sha256', 'test-key-not-a-real-secret').update('student-documents:' + payload).digest('base64url')
  assert.equal(sessions.documentSession(requestWith(payload + '.' + signature)), null)
})
function apiWith(documents, session = { id: 'recStudent', folderId: 'TEST123' }, writes) {
  return moduleAt('app/api/student-documents/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options.status }) } },
    '@/lib/student-document-session': { documentSession: () => session },
    '@/lib/student-document-store': { loadStudentDocuments: async () => documents, loadRequiredDocuments: async () => [], documentRequest: async (path, init) => { if (!writes) throw Error('Unexpected write'); writes.push({ path, ...init }); return { id: 'recReview' } }, reviewTable: 'reviews' },
    '@/lib/airtable-config': { AIRTABLE: { baseId: 'test-base' }, getAirtableApiKey: () => 'fake-key' },
    fetch: async (url, init) => { writes.push({ url, ...init }); return { ok: true } },
  })
}
function req(form, origin = 'https://portal.example') {
  return { nextUrl: new URL('https://portal.example/api/student-documents?folderId=TEST123'), headers: { get: () => origin }, formData: async () => form }
}
test('API requires server session and matching folder; rejects cross-origin changes', async () => {
  assert.equal((await apiWith([], null).GET(req())).status, 401)
  assert.equal((await apiWith([], { id: 'recOther', folderId: 'OTHER' }).GET(req())).status, 401)
  assert.equal((await apiWith([]).POST(req(null, 'https://foreign.example'))).status, 403)
})

const { requiredDocuments } = moduleAt('lib/student-document-requirements.ts')
test('uses the dashboard checklist including received flags and urgency without exposing profile notes', () => {
  const saved = JSON.stringify({ version: 1, documents: [{ id: 'passport', name: 'Passeport', urgency: 'Urgent' }, { id: 'bac', name: 'Diplôme du bac' }], profile: { received: ['passport'], notes: 'PRIVATE' } })
  const result = requiredDocuments(saved, 'Old document')
  assert.equal(result.length, 2)
  assert.equal(result[0].received, true)
  assert.equal(result[0].urgent, true)
  assert.equal(result[1].received, false)
  assert.equal(JSON.stringify(result).includes('PRIVATE'), false)
})

test('loads a single Airtable record without unsupported fields[] parameters', async () => {
  const store = moduleAt('lib/student-document-store.ts', {
    '@/lib/airtable-config': { AIRTABLE: { baseId: 'test', tables: { prospects: { id: 'prospects' } } }, getAirtableApiKey: () => 'fake-key' },
    '@/lib/student-document-items': {},
    '@/lib/student-document-requirements': { requiredDocuments },
    fetch: async url => {
      const parsed = new URL(url)
      assert.equal(parsed.pathname, '/v0/test/prospects/recStudent')
      assert.equal(parsed.searchParams.get('returnFieldsByFieldId'), 'true')
      assert.equal(parsed.searchParams.has('fields[]'), false)
      return { ok: true, json: async () => ({ fields: { fldsMJ7gvO2Qz9UzT: JSON.stringify({ version: 1, documents: [{ id: 'passport', name: 'Passeport', urgency: 'Urgent' }], profile: { received: ['passport'] } }) } }) }
    },
  })
  const result = await store.loadRequiredDocuments('recStudent')
  assert.equal(result.length, 1)
  assert.equal(result[0].received, true)
})
test('empty lists stay empty, legacy requests are deduplicated, corrupt checklists are not fabricated', () => {
  assert.equal(requiredDocuments(null, '').length, 0)
  assert.equal(requiredDocuments(null, 'Passeport\nPasseport\nCV').length, 2)
  assert.throws(() => requiredDocuments('{bad', ''), /conseiller/)
  assert.throws(() => requiredDocuments('{"version":2}', ''), /conseiller/)
})
function uploadForm(name = 'Mon diplôme') {
  const form = new FormData()
  form.set('name', name)
  form.set('uploadId', '12345678-1234-1234-1234-123456789abc')
  form.set('file', new File(['pdf'], 'diplome.pdf', { type: 'application/pdf' }))
  return form
}
test('named upload is saved to dashboard reviews and marked received', async () => {
  const writes = []
  const result = await apiWith([], undefined, writes).POST(req(uploadForm()))
  assert.equal(result.status, 200)
  const created = JSON.parse(writes[0].body).fields
  assert.equal(created['Document Name'], 'Mon diplôme')
  assert.equal(created['Student Record ID'], 'recStudent')
  assert.equal(created.Source, 'Academic')
  assert.match(writes[1].url, /uploadAttachment$/)
  assert.equal(JSON.parse(writes[2].body).fields['Review Status'], 'Received')
  assert.equal(writes.some(write => write.method === 'DELETE'), false)
})
test('retry after upload confirmation cannot create a second file', async () => {
  const previous = { key: 'portal:recStudent:12345678-1234-1234-1234-123456789abc', name: 'Mon diplôme', files: [{ id: 'uploaded' }], status: 'Received', reviewId: 'recReview' }
  const writes = []
  assert.equal((await apiWith([previous], undefined, writes).POST(req(uploadForm()))).status, 200)
  assert.equal(writes.length, 0)
})
test('rejects uploads without a name or with an unsupported file before writing', async () => {
  assert.equal((await apiWith([]).POST(req(uploadForm('  ')))).status, 400)
  const form = uploadForm()
  form.set('file', new File(['script'], 'test.html', { type: 'text/html' }))
  assert.equal((await apiWith([]).POST(req(form))).status, 400)
})
