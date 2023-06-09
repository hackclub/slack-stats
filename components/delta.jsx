import { IoCaretUp, IoCaretDown, IoCaretForward } from 'react-icons/io5'

export default function Delta({ a, b, iconSide }) {
	const delta = ((b - a) / a) * 100

	const perc = <div>
		{delta === Infinity
			? 'Inf'
			: delta < 0.5 && delta > 0
				? Math.abs(Math.ceil(delta * 10) / 10).toString().slice(1)
				: Math.abs(Math.round(delta))}%
	</div>
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