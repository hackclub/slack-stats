'use client'

export default function Error({ error, reset }) {
	return (
		<div>
			<h1>Something went wrong!</h1>
			<p>A problem occurred rendering this page. Check the Airtable configuration and make sure the database has been synced recently.</p>
			<p className='source'>{error.toString()}</p>
			<button onClick={() => reset()}>Try again (usually doesn't work)</button>
		</div>
	)
}