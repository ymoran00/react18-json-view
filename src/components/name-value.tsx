import { useContext } from 'react'
import { JsonViewContext } from './json-context'

import JsonNode from './json-node'

interface Props {
	indexOrName: number | string
	value: any
	depth: number
	parent?: Record<string, any> | Array<any>
	deleteHandle: (indexOrName: string | number) => void
	editHandle: (indexOrName: string | number, newValue: any, oldValue: any) => void
}

export default function NameValue({ indexOrName, value, depth, parent, deleteHandle, editHandle }: Props) {
	const { displayArrayIndex } = useContext(JsonViewContext)
	const isArray = Array.isArray(parent)

	return (
		<div className='json-view--pair'>
			{!isArray || (isArray && displayArrayIndex) ? (
				<>
					<span className={typeof indexOrName === 'number' ? 'json-view--index' : 'json-view--property'}>{indexOrName}</span>:{' '}
				</>
			) : (
				<></>
			)}
			<JsonNode node={value} depth={depth + 1} deleteHandle={deleteHandle} editHandle={editHandle} parent={parent} indexOrName={indexOrName} />
		</div>
	)
}
