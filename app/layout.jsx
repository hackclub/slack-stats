import 'style/global.css'
import 'style/group-charts.css'

import Navbar from 'components/navbar'
import { channelsDb } from 'lib/server/airtable'

export const metadata = {
	title: 'Slack Stats',
	description: 'Hack Club Slack stats website.'
}
 
export default async function RootLayout({ children }) {
	const channels = await channelsDb.select({
		fields: [ 'Group' ]
	}).all()
	const groups = [ ...new Set(channels.map(channel => channel.get('Group'))) ]
	
	return (
		<html lang='en'>
			<head>
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
				<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap' rel='stylesheet' />
			</head>

			<body>
				<div className='outer-container'>
					<Navbar groups={groups} />

					<div className='main-container'>
						<main>
							{children}
						</main>
					</div>
				</div>
			</body>
		</html>
	)
}
