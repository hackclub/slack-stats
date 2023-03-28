import { airtableApiKey } from './env.js'
import Airtable from 'airtable'

export const baseId = 'appfewDQPFde2gvcC'
const db = new Airtable({ apiKey: airtableApiKey }).base(baseId)

export const channelsDb = db.table('Config: Channels')
export const eventsDb = db.table('Config: Events')
export const statsDb = db.table('Automated: Stats')
export const lastSyncDb = db.table('Automated: Last Sync')
export const lastSyncRecord = 'recREd6o1n6dBDcmb'