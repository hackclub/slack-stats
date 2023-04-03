'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Line } from 'react-chartjs-2'
import Annotation from 'chartjs-plugin-annotation'
import {
	Chart,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Legend
} from 'chart.js'
import Delta from 'components/delta'

Chart.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Legend,
	Annotation
)
Chart.defaults.font.family = `'Inter', sans-serif`

const colorConfigs = {
	blue: { borderColor: '#339af0', backgroundColor: '#a5d8ff' },
	green: { borderColor: '#51cf66', backgroundColor: '#b2f2bb' },
	pink: { borderColor: '#cc5de8', backgroundColor: '#eebefa' },
	yellow: { borderColor: '#fab005', backgroundColor: '#ffec99' }
}
  
const mapRange = (n, inMin, inMax, outMin, outMax) =>
	((n - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin

/*
points: { [key: string]: number }[]
items: {
	label: string,
	plural: string, // default to key
	key: string, // key of points
	color: string // key of colorConfigs
}[]
beginAtZero: boolean
*/
export default function GroupChart({ stats, items, events, beginAtZero }) {
	const [ hoveredIndex, setHoveredIndex ] = useState(null)
	const hovered = stats[hoveredIndex] ?? null

	// Hackiness to calc the min after Chart.js padding so we can avoid negative
	// numbers in the axes.
	let [ minY, maxY ] = stats.reduce((acc, point) => {
		const values = items.map(item => point[item.key])
		const min = Math.min(...values)
		const max = Math.max(...values)
		return [
			Math.min(acc[0], min),
			Math.max(acc[1], max)
		]
	}, [ Infinity, -Infinity ])
	minY -= (maxY - minY) * 0.1

	const indexedEvents = events.map(event => ({
		...event,
		index: mapRange(event.date, stats[0].week, stats[stats.length - 1].week, 0, stats.length - 1)
	})).filter(event => event.index > 0 && event.index <= stats.length - 1)
	indexedEvents.sort((a, b) => b.index - a.index)

	return (<>
		<Line
			data={{
				labels: stats.map(point => format(point.week, 'LLL d')),
				datasets: items.map((item, i) => ({
					label: item.label,
					data: stats.map(point => point[item.key]),
					borderColor: item.borderColor,
					hoverBorderWidth: 1.5,
					hoverBorderColor: '#000000',
					hoverBackgroundColor: '#ffffff',
					...colorConfigs[item.color]
				}))
			}}
			options={{
				animation: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				scales: {
					y: {
						beginAtZero: minY < 0 || beginAtZero,
						grace: '10%'
					}
				},
				plugins: {
					annotation: {
						annotations: indexedEvents.map((event, i) => ({
							type: 'line',
							borderColor: '#495057',
							borderWidth: 2,
							label: {
								color: '#364fc7',
								backgroundColor: '#bac8ffaa',
								opacity: 0.5,
								content: [ event.name, 'December 18, 2022' ],
								display: true,
								font: {
									family: Chart.defaults.font.family,
									weight: 'normal',
									lineHeight: 1.4
								},
								position: [ 'start', 'center', 'end' ][i % 3]
							},
							scaleID: 'x',
							value: event.index
						}))
					}
				},
				onHover: (_, elements) => setHoveredIndex(elements[0]?.index ?? null)
			}}
			onMouseLeave={() => setHoveredIndex(null)}
		/>

		{hovered ? (
			<div className='footer'>
				<div className='date'>
					{format(hovered.week, 'LLLL d, yyyy')}
				</div>

				{items.map(item => (
					<div key={item.key}>
						<div className='value'>{hovered[item.key]} {item.plural ?? item.key}</div>
						{' '}
						<Delta
							a={(stats[hoveredIndex - 1] ?? hovered)[item.key]}
							b={hovered[item.key]}
						/>
					</div>
				))}
			</div>
		) : (
			<div className='footer'>
				<div className='dash'>-</div>
			</div>
		)}
	</>)
}