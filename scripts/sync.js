import { channelsDb, statsDb, eventsDb, lastSyncDb, lastSyncRecord } from '../lib/server/airtable.js'
import { getStatsForWeek } from '../lib/server/slack.js'
import { parseISO, formatISO, eachWeekOfInterval, previousSaturday, isSunday } from 'date-fns'

const channels = await channelsDb.select({
	fields: [ 'Channel Name', 'Group', 'Stats Start Week', 'Automated: Channel ID' ]
}).all()
const stats = await statsDb.select({
	fields: [ 'Channel ID', 'Week' ]
}).all()
const events = await eventsDb.select({
	fields: [ 'Event Name', 'Date' ]
}).all()

// Validate channels and events
for (const channel of channels) {
	if (!channel.get('Channel Name') || !channel.get('Group') || !channel.get('Stats Start Week')) {
		console.log()
		console.error('A channel is missing a name, group, or start week!')
		console.error('Make sure all fields of all channels are filled in and there are no blank rows.')
		console.log()
		process.exit(1)
	}

	if (!isSunday(parseISO(channel.get('Stats Start Week')))) {
		console.log()
		console.error(`Start week for channel #${channel.get('Channel Name')} must be a Sunday`)
		console.log()
		process.exit(1)
	}
}
for (const event of events) {
	if (!event.get('Event Name') || !event.get('Date')) {
		console.log()
		console.error('An event is missing a name or date!')
		console.error('Make sure all fields of all events are filled in and there are no blank rows.')
		console.log()
		process.exit(1)
	}
}

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