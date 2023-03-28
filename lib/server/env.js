import dotenv from 'dotenv'
dotenv.config()

const requireEnv = (name) => {
	if (!process.env[name]) {
		throw new Error(`Missing environment variable: ${name}`)
	}
	return process.env[name]
}

export const slackXoxc = requireEnv('SLACK_XOXC')
export const slackXoxd = requireEnv('SLACK_XOXD')
export const airtableApiKey = requireEnv('AIRTABLE_API_KEY')