import { IoCaretUp, IoCaretDown, IoCaretForward } from 'react-icons/io5'

export default function Delta({ a, b, iconSide }) {
	const delta = ((b - a) / a) * 100

	const perc = <div>{delta === Infinity ? 'Inf' : Math.abs(Math.round(delta))}%</div>
	const icon = delta === 0
		? <IoCaretForward />
		: delta >= 0 ? <IoCaretUp /> : <IoCaretDown />

	return (
		<span
			className='delta'
			style={{
				color: delta === 0
					? 'black'
					: delta > 0 ? 'green' : 'red'
			}}
		>
			{iconSide === 'right' ? perc : icon}
			{iconSide === 'right' ? icon : perc}
		</span>
	)
}