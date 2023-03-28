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
