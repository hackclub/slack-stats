'use client'

import { useState, useEffect } from 'react'
import GroupChart from 'components/group-chart'

const tabs = {
	'Messages': ({ stats, events }) => (
		<GroupChart
			stats={stats}
			events={events}
			items={[ { label: 'Message Count', key: 'messages', color: 'blue' } ]}
			beginAtZero
		/>
	),
	'Members': ({ stats, events }) => (
		<GroupChart
			stats={stats}
			events={events}
			items={[ { label: 'Member Count', key: 'members', color: 'green' } ]}
		/>
	),
	'Posters/Viewers': ({ stats, events }) => (
		<GroupChart
			stats={stats}
			events={events}
			items={[
				{ label: 'Poster Count', key: 'posters', color: 'yellow' },
				{ label: 'Viewer Count', key: 'viewers', color: 'pink' }
			]}
		/>
	)
}

export default function GroupChartTabs({ stats, events }) {
	const [ tabTitle, setTabTitle ] = useState('Messages')
	const Tab = tabs[tabTitle]

	useEffect(() => {
		if (sessionStorage.getItem('tabTitle'))
			setTabTitle(sessionStorage.getItem('tabTitle'))
	}, [])
	useEffect(() => {
		if (sessionStorage.getItem('tabTitle') !== tabTitle)
			sessionStorage.setItem('tabTitle', tabTitle)
	}, [ tabTitle ])

	return (
		<div className='tab-container'>
			<div className='tabs'>
				{Object.keys(tabs).map(title => (
					<button
						key={title}
						className={tabTitle === title ? 'active' : ''}
						onClick={() => setTabTitle(title)}
					>
						{title}
					</button>
				))}
			</div>
			
			<div className='content'>
				<Tab stats={stats} events={events} />
			</div>
		</div>
	)
}