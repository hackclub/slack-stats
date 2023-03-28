import { slackXoxc, slackXoxd } from './env.js'
import { isSunday, formatISO, addDays } from 'date-fns'
import { fetch } from 'undici'

export const getStatsForWeek = async (channelName, week) => {
	if (!isSunday(week)) {
		throw new Error(`Week start must be a Sunday, got ${formatISO(week, { representation: 'date' })}`)
	}

	const formData = {
		token: slackXoxc,
		start_date: formatISO(week, { representation: 'date' }),
		end_date: formatISO(addDays(week, 6), { representation: 'date' }),
		count: 1,
		sort_column: 'name',
		sort_order: 'asc',
		query: channelName
	}
	const boundary = '----FormDataBoundary' + Math.random().toString(36)
	const body = Object.entries(formData).flatMap(([ key, value ]) => [
		'--' + boundary,
		`Content-Disposition: form-data; name="${key}"`,
		'',
		value
	]).join('\n') + '\n--' + boundary + '--'
	
	const res = await fetch('https://hackclub.slack.com/api/admin.analytics.getChannelAnalytics', {
		method: 'POST',
		body,
		headers: {
			'Content-Type': `multipart/form-data; boundary=${boundary}`,
			'Cookie': `d=${encodeURIComponent(slackXoxd)}`
		}
	})

	const data = await res.json()
	if (data.error === 'ratelimited') {
		const retrySeconds = Number(res.headers.get('Retry-After')) || 10
		console.log(`Ratelimited by Slack API, retrying in ${retrySeconds + 1} seconds`)
		await new Promise(resolve => setTimeout(resolve, (retrySeconds + 1) * 1000))
		console.log('Retrying Slack API request...')
		return await getStatsForWeek(channelName, week)
	}
	if (!data.ok) throw new Error(`Slack API returned ${data.error}`)

	const channel = data.channels.find(c => c.name === channelName)
	if (!channel) return null
	const analytics = data.channel_analytics.find(a => a.channel_id === channel.id)

	return {
		channelId: channel.id,
		messageCount: analytics.messages_count,
		memberCount: analytics.total_members_count,
		posterCount: analytics.writers_count,
		viewerCount: analytics.readers_count
	}
}