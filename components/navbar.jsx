'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
 
export default function Navbar({ groups }) {
	const segment = useSelectedLayoutSegment()
	
	return (
		<nav>
			<Link href='/' className={segment ? '' : 'active'}>Home</Link>
			<hr />
			<ul>
				{groups.map(group => {
					return (
						<li key={group}>
							<Link
								href={`/${encodeURIComponent(group)}`}
								className={segment === encodeURIComponent(group) ? 'active' : ''}
							>
								{group}
							</Link>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}
