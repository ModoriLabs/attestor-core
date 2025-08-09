import cors from 'cors'
import express from 'express'
import { readFile } from 'fs/promises'
import { main as generateReceiptMain } from 'src/scripts/generate-receipt'
import { logger } from 'src/utils'

const app = express()
const PORT = process.env.API_PORT || 3000

const validateClientParamValues = (clientParamValues: any) => {
	if(!clientParamValues.issuedDate) {
		throw new Error('issuedDate is required')
	}

	if(!clientParamValues.issueNumber) {
		throw new Error('issueNumber is required')
	}
}

app.use(cors())
app.use(express.json())

// curl -X POST localhost:3000/api/generate-receipt
app.post('/api/generate-receipt', async(req: any, res: any) => {
	try {
		const BASE_ATTESTOR_URL =
      'wss://attestor-core-production.up.railway.app/ws'
		const attestor = req.body?.attestor || BASE_ATTESTOR_URL
		const body = req.body || {}
		validateClientParamValues(body)
		// body should be like this:
		// {
		//   "issuedDate": "2025-06-18",
		//   "issueNumber": "4116-ALQE-QRHYSDDU"
		// }
		// validate this

		const paramsValues = {
			URL_PARAMS_1: body.issuedDate,
			URL_PARAMS_GRD: body.issueNumber,
		}

		console.log('body', body)

		// Read tossbank.json file
		let fileContents = await readFile('example/tossbank.json', 'utf8')
		console.log('File read successfully')

		// Replace environment variables in file contents
		for(const variable in process.env) {
			fileContents = fileContents.replace(
				`{{${variable}}}`,
        process.env[variable]!
			)
		}

		const receiptParams = JSON.parse(fileContents)

		console.log('receiptParams before', receiptParams)

		receiptParams.secretParams.paramValues = paramsValues
		console.log('receiptParams after', receiptParams)

		// Set attestor URL
		process.env.ATTESTOR_URL = attestor
		console.log('Using attestor:', attestor)

		console.log('Starting receipt generation...')
		const result = await generateReceiptMain(receiptParams)
		console.log('Receipt generated successfully')

		res.json({
			success: true,
			data: {
				provider: result.provider,
				receipt: result.receipt,
				extractedParameters: result.extractedParameters,
				transcript: result.transcript,
			},
		})
	} catch(error) {
		console.error('Detailed error:', error)
		logger.error('Error generating receipt:', error)

		res.status(500).json({
			success: false,
			error: 'Failed to generate receipt',
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		})
	}
})

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

function startServer() {
	const server = app.listen(PORT, () => {
		console.log(`API Server running on port ${PORT}`)
	})

	// Keep the process alive and handle graceful shutdown
	process.on('SIGTERM', () => {
		console.log('SIGTERM received, shutting down gracefully')
		server.close(() => {
			console.log('Server closed')
			process.exit(0)
		})
	})

	process.on('SIGINT', () => {
		console.log('SIGINT received, shutting down gracefully')
		server.close(() => {
			console.log('Server closed')
			process.exit(0)
		})
	})

	return server
}

// Only start server if this file is run directly
if(require.main === module) {
	startServer()
}
