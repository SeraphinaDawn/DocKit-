import localforage from 'localforage'
import type { DraftRecord } from '../types'

const draftStore = localforage.createInstance({
  name: 'DocKit',
  storeName: 'drafts',
  description: 'DocKit 本地文书草稿',
})

const draftListKey = 'draft-list'

export type DraftSummary = Pick<DraftRecord, 'id' | 'name' | 'updatedAt' | 'pdfName'>

export async function listDrafts() {
  return (await draftStore.getItem<DraftSummary[]>(draftListKey)) ?? []
}

export async function getDraft(id: string) {
  return draftStore.getItem<DraftRecord>(draftKey(id))
}

export async function saveDraft(record: DraftRecord) {
  await draftStore.setItem(draftKey(record.id), record)

  const summaries = await listDrafts()
  const nextSummary: DraftSummary = {
    id: record.id,
    name: record.name,
    updatedAt: record.updatedAt,
    pdfName: record.pdfName,
  }

  await draftStore.setItem(
    draftListKey,
    [nextSummary, ...summaries.filter((summary) => summary.id !== record.id)].slice(0, 12),
  )
}

export async function deleteDraft(id: string) {
  await draftStore.removeItem(draftKey(id))
  const summaries = await listDrafts()
  await draftStore.setItem(
    draftListKey,
    summaries.filter((summary) => summary.id !== id),
  )
}

function draftKey(id: string) {
  return `draft:${id}`
}
