import { readFile } from 'fs/promises'
import { join } from 'path'
import { FileFetch, Logger } from './types'

/**
 * File fetcher for loading Noir circuit files from local filesystem
 */
export class LocalFileFetcher implements FileFetch {
	private basePath: string

	constructor(basePath: string = process.cwd()) {
		this.basePath = basePath
	}

	async fetch(engine: string, filename: string, logger?: Logger): Promise<Uint8Array> {
		const filePath = join(this.basePath, 'src', 'zk', 'noir', 'chacha20', filename)
		logger?.debug?.(`Loading circuit file: ${filePath}`)
		
		try {
			const data = await readFile(filePath)
			logger?.debug?.(`Circuit file loaded successfully, size: ${data.length} bytes`)
			return new Uint8Array(data)
		} catch (error) {
			logger?.error?.(`Failed to load circuit file: ${error}`)
			throw new Error(`Failed to load circuit file ${filename}: ${error}`)
		}
	}
}

/**
 * Create a default file fetcher instance
 */
export function createDefaultFetcher(): FileFetch {
	return new LocalFileFetcher()
}