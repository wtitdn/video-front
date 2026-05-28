import { postForm, postJson } from './client'
import { normalizeVideoList } from './normalize'
import type { Video } from './types'

export function publishVideo(input: { title: string; description: string; play_url: string; cover_url: string }) {
  return postJson<Video>('/video/publish', input, { authRequired: true })
}

export type UploadResponse = {
  url?: string
  play_url?: string
  cover_url?: string
  bucket?: string
  object_key?: string
  etag?: string
  location?: string
}

export function uploadVideo(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return postForm<UploadResponse>('/video/uploadVideo', fd, { authRequired: true })
}

export function uploadCover(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return postForm<UploadResponse>('/video/uploadCover', fd, { authRequired: true })
}

export async function listByAuthorId(authorId: number) {
  const videos = await postJson<Video[] | null>('/video/listByAuthorID', { author_id: authorId })
  return normalizeVideoList(videos)
}

export function getDetail(id: number) {
  return postJson<Video>('/video/getDetail', { id })
}

// --- Chunk Upload API ---

export type InitChunkUploadResponse = {
  bucket: string
  object_key: string
  upload_id: string
}

export type InitChunkUploadInput = {
  file_name: string
  content_type: string
}

export function initChunkUpload(input: InitChunkUploadInput) {
  return postJson<InitChunkUploadResponse>('/video/chunk/init', input, { authRequired: true })
}

export type ChunkPart = {
  part_number: number
  etag: string
}

export type ChunkPartURLResponse = {
  part_number: number
  url: string
}

export function createChunkPartUrl(objectKey: string, uploadId: string, partNumber: number) {
  return postJson<ChunkPartURLResponse>('/video/chunk/part-url', {
    object_key: objectKey,
    upload_id: uploadId,
    part_number: partNumber,
  }, { authRequired: true })
}

export function completeChunkUpload(objectKey: string, uploadId: string, parts: ChunkPart[]) {
  return postJson<UploadResponse>('/video/chunk/complete', {
    object_key: objectKey,
    upload_id: uploadId,
    parts,
  }, { authRequired: true })
}

export function abortChunkUpload(objectKey: string, uploadId: string) {
  return postJson<{ status: string }>('/video/chunk/abort', {
    object_key: objectKey,
    upload_id: uploadId,
  }, { authRequired: true })
}
