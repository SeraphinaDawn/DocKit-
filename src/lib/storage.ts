import localforage from 'localforage'
import type { DraftRecord, SignatureDraftRecord } from '../types'

const pdfDraftStore = localforage.createInstance({
  name: 'DocKit',
  storeName: 'drafts',
  description: 'DocKit 本地 PDF 盖章草稿',
})

const signatureDraftStore = localforage.createInstance({
  name: 'DocKit',
  storeName: 'signature-drafts',
  description: 'DocKit 本地透明签名草稿',
})

const pdfDraftListKey = 'draft-list'
const signatureDraftListKey = 'signature-draft-list'

export type DraftSummary = Pick<DraftRecord, 'id' | 'name' | 'updatedAt' | 'pdfName'>
export type SignatureDraftSummary = Pick<
  SignatureDraftRecord,
  'id' | 'name' | 'updatedAt' | 'sourceName' | 'width' | 'height'
>

export async function listDrafts() {
  return (await pdfDraftStore.getItem<DraftSummary[]>(pdfDraftListKey)) ?? []
}

export async function getDraft(id: string) {
  return pdfDraftStore.getItem<DraftRecord>(pdfDraftKey(id))
}

export async function saveDraft(record: DraftRecord) {
  await pdfDraftStore.setItem(pdfDraftKey(record.id), record)

  const summaries = await listDrafts()
  const nextSummary: DraftSummary = {
    id: record.id,
    name: record.name,
    updatedAt: record.updatedAt,
    pdfName: record.pdfName,
  }

  await pdfDraftStore.setItem(
    pdfDraftListKey,
    [nextSummary, ...summaries.filter((summary) => summary.id !== record.id)].slice(0, 12),
  )
}

export async function deleteDraft(id: string) {
  await pdfDraftStore.removeItem(pdfDraftKey(id))
  const summaries = await listDrafts()
  await pdfDraftStore.setItem(
    pdfDraftListKey,
    summaries.filter((summary) => summary.id !== id),
  )
}

export async function listSignatureDrafts() {
  return (await signatureDraftStore.getItem<SignatureDraftSummary[]>(signatureDraftListKey)) ?? []
}

export async function getSignatureDraft(id: string) {
  return signatureDraftStore.getItem<SignatureDraftRecord>(signatureDraftKey(id))
}

export async function saveSignatureDraft(record: SignatureDraftRecord) {
  await signatureDraftStore.setItem(signatureDraftKey(record.id), record)

  const summaries = await listSignatureDrafts()
  const nextSummary: SignatureDraftSummary = {
    id: record.id,
    name: record.name,
    updatedAt: record.updatedAt,
    sourceName: record.sourceName,
    width: record.width,
    height: record.height,
  }

  await signatureDraftStore.setItem(
    signatureDraftListKey,
    [nextSummary, ...summaries.filter((summary) => summary.id !== record.id)].slice(0, 24),
  )
}

export async function deleteSignatureDraft(id: string) {
  await signatureDraftStore.removeItem(signatureDraftKey(id))
  const summaries = await listSignatureDrafts()
  await signatureDraftStore.setItem(
    signatureDraftListKey,
    summaries.filter((summary) => summary.id !== id),
  )
}

function pdfDraftKey(id: string) {
  return `draft:${id}`
}

function signatureDraftKey(id: string) {
  return `signature-draft:${id}`
}
