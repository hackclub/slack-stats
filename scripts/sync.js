import { channelsDb, statsDb, lastSyncDb, lastSyncRecord } from '../lib/server/airtable.js'
import { getStatsForWeek } from '../lib/server/slack.js'
import { parseISO, formatISO, eachWeekOfInterval, previousSaturday } from 'date-fns'

const channels = await channelsDb.select({
	fields: [ 'Channel Name', 'Stats Start Week', 'Automated: Channel ID' ]
}).all()
const stats = await statsDb.select({
	fields: [ 'Channel ID', 'Week' ]
}).all()

const newStats = []

try {
	for (const channel of channels) {
		const channelName = channel.get('Channel Name')
		const startWeek = parseISO(channel.get('Stats Start Week'))
		let channelId = channel.get('Automated: Channel ID')

		const weeks = eachWeekOfInterval({
			start: startWeek,
			end: previousSaturday(new Date())
		})

		let channelExists
		for (const week of weeks) {
			channelExists = true
			if (channelId && stats.find(s => s.get('Channel ID') === channelId && s.get('Week') === formatISO(week, { representation: 'date' }))) {
				// We already have stats for this week.
				continue
			}

			console.log(`Fetching stats for channel #${channelName} for week of ${formatISO(week, { representation: 'date' })}`)
			const weekStats = await getStatsForWeek(channelName, week)
			if (!weekStats) {
				// This channel didn't exist for this week.
				channelExists = false
				continue
			}

			if (channelId !== weekStats.channelId) {
				// Fill the channel id.
				console.log(`Updating channel id for channel #${channelName} to ${weekStats.channelId}`)
				await channelsDb.update(channel.id, {
					'Automated: Channel ID': weekStats.channelId
				})
				channelId = weekStats.channelId
			}

			newStats.push({
				fields: {
					'Channel ID': channelId,
					'Week': formatISO(week, { representation: 'date' }),
					'Message Count': weekStats.messageCount,
					'Member Count': weekStats.memberCount,
					'Poster Count': weekStats.posterCount,
					'Viewer Count': weekStats.viewerCount
				}
			})

			// This is probably a decent time to batch some database updates.
			if (newStats.length >= 10) {
				console.log(`Saving ${newStats.length} stats to Airtable`)
				await statsDb.create(newStats.splice(0, 10))
			}
		}

		if (!channelExists) {
			console.log(`Channel #${channelName} does not exist, removing id`)
			await channelsDb.update(channel.id, {
				'Automated: Channel ID': null
			})
			throw new Error(`Channel #${channelName} does not exist`)
		}
	}

	console.log('All done! Setting last sync time')
	lastSyncDb.update(lastSyncRecord, { 'Last Sync': formatISO(new Date()) })
} catch (error) {
	console.error(error)
} finally {
	console.log(`Saving ${newStats.length} remaining stats to Airtable`)
	while (newStats.length > 0) await statsDb.create(newStats.splice(0, 10))
}

console.log('Script finished')