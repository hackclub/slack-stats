import { cache } from 'react'
import { channelsDb, statsDb, eventsDb } from 'lib/server/airtable'
import { parseISO, format, eachWeekOfInterval } from 'date-fns'
import GroupChartTabs from 'components/group-chart-tabs'
import Delta from 'components/delta'

const fetchChannels = cache(async (group) => {
	const channelData = await channelsDb.select({
		fields: [ 'Channel Name', 'Automated: Channel ID' ],
		filterByFormula: `AND(Group = '${group}', {Automated: Channel ID} != BLANK())`
	}).all()
	return channelData.map(c => ({
		name: c.get('Channel Name'),
		id: c.get('Automated: Channel ID')
	}))
})

const fetchEvents = cache(async () => {
	const eventData = await eventsDb.select({
		fields: [ 'Event Name', 'Date' ]
	}).all()
	return eventData.map(e => ({
		name: e.get('Event Name'),
		date: parseISO(e.get('Date'))
	}))
})

export default async function GroupPage(props) {
	const group = decodeURIComponent(props.params.group)

	const [ channels, events ] = await Promise.all([
		fetchChannels(group),
		fetchEvents()
	])
	
	const statsData = await statsDb.select({
		fields: [ 'Channel ID', 'Week', 'Message Count', 'Member Count', 'Poster Count', 'Viewer Count' ],
		filterByFormula: `FIND({Channel ID}, '${channels.map(c => c.id).join(',')}')`
	}).all()

	{
		// Eliminate duplicates. As good of a time as any.
		const seen = new Set()
		const toDelete = []
		for (let i = 0; i < statsData.length; i++) {
			const key = statsData[i].get('Channel ID') + statsData[i].get('Week')
			if (seen.has(key)) {
				toDelete.push(statsData[i].id)
				statsData.splice(i, 1)
				i--
			} else {
				seen.add(key)
			}
			if (toDelete.length >= 10) await statsDb.destroy(toDelete.splice(0, 10))
		}
		if (toDelete.length > 0) await statsDb.destroy(toDelete)
	}

	const minWeek = Math.min(...statsData.map(s => parseISO(s.get('Week')).getTime()))
	const maxWeek = Math.max(...statsData.map(s => parseISO(s.get('Week')).getTime()))
	const stats = eachWeekOfInterval({
		start: new Date(minWeek),
		end: new Date(maxWeek)
	}).map(week => {
		return statsData
			.filter(s => parseISO(s.get('Week')).getTime() === week.getTime())
			.reduce((acc, s) => {
				acc.messages += s.get('Message Count')
				acc.members += s.get('Member Count')
				acc.posters += s.get('Poster Count')
				acc.viewers += s.get('Viewer Count')
				return acc
			}, {
				week: week.getTime(),
				messages: 0,
				members: 0,
				posters: 0,
				viewers: 0
			})
	})
	const reverseStats = stats.slice().reverse()

	return (<>
		<h1>{group}</h1>

		<p className='source'>
			Source channels:{' '}
			{channels.map(channel => '#' + channel.name).join(', ')}
		</p>

		<GroupChartTabs
			stats={stats}
			events={events.map(event => ({ ...event, date: event.date.getTime() }))}
		/>

		<table className='raw-stats'>
			<colgroup>
				<col style={{ width: 180 }} />
				<col style={{  }} />
				<col style={{  }} />
				<col style={{  }} />
			</colgroup>
			<thead>
				<tr>
					<th>Week</th>
					<th>People</th>
					<th>Posters</th>
					<th>Messages</th>
				</tr>
			</thead>
			<tbody>
				{reverseStats.map((stat, i) => {
					return (
						<tr key={stat.week}>
							<td>{format(stat.week, 'LLLL d, yyyy')}</td>
							{[ 'members', 'posters', 'messages' ].map(key => (
								<td key={key}>
									<div className='stat'>
										{stat[key]}
										<Delta iconSide='right' a={(reverseStats[i + 1] ?? stat)[key]} b={stat[key]} />
									</div>
								</td>
							))}
						</tr>
					)
				})}
			</tbody>
		</table>
	</>)
}

export const revalidate = 180