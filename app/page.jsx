import { cache } from 'react'
import { baseId, lastSyncDb, lastSyncRecord } from 'lib/server/airtable'
import { parseISO, format } from 'date-fns'

const fetchLastSync = cache(async () => {
	const record = await lastSyncDb.find(lastSyncRecord)
	return parseISO(record.get('Last Sync'))
})

export default async function RootPage() {
	const lastSync = await fetchLastSync()

	return (<>
		<h1>Slack Stats</h1>
		<p>Last sync: {format(lastSync, `EEEE, MMMM do 'at' H:mm`)}</p>
		<p>
			<a href={`https://airtable.com/${baseId}`} target='_blank'>
				Configuration in Airtable &raquo;
			</a>
		</p>
		<p>
			<a href='https://hackclub.slack.com/admin/stats' target='_blank'>
				Official Slack analytics &raquo;
			</a>
		</p>
	</>)
}

export const revalidate = 360