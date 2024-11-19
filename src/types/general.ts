import type { Logger as TLSLogger, TLSPacketContext, TLSProtocolVersion } from '@reclaimprotocol/tls'
import { TOPRFPayload } from 'src/proto/api'

/**
 * Represents a slice of any array or string
 */
export type ArraySlice = {
	fromIndex: number
	toIndex: number
}

export type RedactedOrHashedArraySlice = {
	fromIndex: number
	toIndex: number
	/**
	 * If the data is redacted, this will be 'redacted'
	 * @default 'redacted'
	 */
	type?: 'redacted' | 'hashed'
}

export type Logger = TLSLogger & {
	child: (opts: { [_: string]: any }) => Logger
}

export type LogLevel = 'debug' | 'info'
	| 'warn' | 'error'
	| 'trace' | 'fatal'

export type ZKRevealInfo = {
	type: 'zk'
	redactedPlaintext: Uint8Array
	toprf?: TOPRFPayload
}

export type MessageRevealInfo = { type: 'complete' } | ZKRevealInfo

export type CompleteTLSPacket = TLSPacketContext
	& {
		/**
		 * Full data that was sent/recv across the wire
		 */
		data: Uint8Array
	}

export type IDecryptedTranscriptMessage = {
	sender: 'client' | 'server'
	redacted: boolean
	message: Uint8Array
	plaintextLength: number
	recordHeader: Uint8Array
}

export type IDecryptedTranscript = {
	transcript: IDecryptedTranscriptMessage[]
	tlsVersion: TLSProtocolVersion
	hostname: string
}