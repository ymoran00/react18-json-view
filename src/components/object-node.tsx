import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { JsonViewContext } from './json-context'
import { isObject, customAdd, customCopy, customDelete, editableAdd, editableDelete, isCollapsed, objectSize, ifDisplay } from '../utils'
import { ReactComponent as AngleDownSVG } from '../svgs/angle-down.svg'
import CopyButton from './copy-button'
import NameValue from './name-value'
import { ReactComponent as DeleteSVG } from '../svgs/trash.svg'
import { ReactComponent as AddSVG } from '../svgs/add-square.svg'
import { ReactComponent as DoneSVG } from '../svgs/done.svg'
import { ReactComponent as CancelSVG } from '../svgs/cancel.svg'
import type { CustomizeOptions } from '../types'
import LargeArray from './large-array'

interface Props {
	node: Record<string, any> | Array<any>
	depth: number
	indexOrName?: number | string
	deleteHandle?: (_: string | number) => void
	customOptions?: CustomizeOptions
}

export default function ObjectNode({ node, depth, indexOrName, deleteHandle: _deleteSelf, customOptions }: Props) {
	const {
		collapsed,
		onCollapse,
		enableClipboard,
		ignoreLargeArray,
		collapseObjectsAfterLength,
		editable,
		onDelete,
		src,
		onAdd,
		onEdit,
		onChange,
		forceUpdate,
		displaySize
	} = useContext(JsonViewContext)

	if (!ignoreLargeArray && Array.isArray(node) && node.length > 100) {
		return <LargeArray node={node} depth={depth} indexOrName={indexOrName} deleteHandle={_deleteSelf} customOptions={customOptions} />
	}

	const isPlainObject = isObject(node)

	const [fold, _setFold] = useState(isCollapsed(node, depth, indexOrName, collapsed, collapseObjectsAfterLength, customOptions))

	const setFold = (value: boolean) => {
		onCollapse?.({ isCollapsing: !value, node, depth, indexOrName })
		_setFold(value)
	}

	useEffect(() => {
		setFold(isCollapsed(node, depth, indexOrName, collapsed, collapseObjectsAfterLength, customOptions))
	}, [collapsed, collapseObjectsAfterLength])

	// Edit property
	const editHandle = useCallback(
		(indexOrName: number | string, newValue: any, oldValue: any) => {
			let oldVal;
			if (Array.isArray(node)) {
				oldVal = node[+indexOrName];
				node[+indexOrName] = newValue
			} else if (node) {
				oldVal = node[indexOrName];
				node[indexOrName] = newValue
			}
			if (onEdit) {
				const doEdit = onEdit({
					newValue,
					oldValue,
					depth,
					src,
					indexOrName: indexOrName,
					parentType: isPlainObject ? 'object' : 'array'
				});
				if (doEdit === false) {
					if (Array.isArray(node)) {
						node[+indexOrName] = oldVal
					} else if (node) {
						node[indexOrName] = oldVal
					}
					forceUpdate();
					return;
				}
			}
			if (onChange) onChange({ type: 'edit', depth, src, indexOrName: indexOrName, parentType: isPlainObject ? 'object' : 'array' })
			forceUpdate()
		},
		[node, onEdit, onChange, forceUpdate]
	)

	// Delete property
	const deleteHandle = (indexOrName: number | string) => {
		if (Array.isArray(node)) {
			node.splice(+indexOrName, 1)
		} else if (node) {
			delete node[indexOrName]
		}
		forceUpdate()
	}

	// Delete self
	const [deleting, setDeleting] = useState(false)
	const deleteSelf = () => {
		setDeleting(false)
		if (_deleteSelf) _deleteSelf(indexOrName!)
		if (onDelete) onDelete({ value: node, depth, src, indexOrName: indexOrName!, parentType: isPlainObject ? 'object' : 'array' })
		if (onChange)
			onChange({
				type: 'delete',
				depth,
				src,
				indexOrName: indexOrName!,
				parentType: isPlainObject ? 'object' : 'array'
			})
	}

	// Add
	const [adding, setAdding] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const add = () => {
		if (isPlainObject) {
			const inputName = inputRef.current?.value

			if (inputName) {
				;(node as Record<string, any>)[inputName] = null

				if (inputRef.current) inputRef.current.value = ''
				setAdding(false)

				if (onAdd) onAdd({ indexOrName: inputName, depth, src, parentType: 'object' })
				if (onChange) onChange({ type: 'add', indexOrName: inputName, depth, src, parentType: 'object' })
			}
		} else if (Array.isArray(node)) {
			const arr = node as unknown as any[]
			arr.push(null)
			if (onAdd) onAdd({ indexOrName: arr.length - 1, depth, src, parentType: 'array' })
			if (onChange) onChange({ type: 'add', indexOrName: arr.length - 1, depth, src, parentType: 'array' })
		}
		forceUpdate()
	}
	const handleAddKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault()
			add()
		} else if (event.key === 'Escape') {
			cancel()
		}
	}

	const isEditing = deleting || adding
	const cancel = () => {
		setDeleting(false)
		setAdding(false)
	}

	const Icons = (
		<>
			{!fold && !isEditing && (
				<span onClick={() => setFold(true)} className='jv-size-chevron'>
					{ifDisplay(displaySize, depth, fold) && <span className='jv-size'>{objectSize(node)} Items</span>}

					<AngleDownSVG className='jv-chevron' />
				</span>
			)}

			{adding && isPlainObject && <input className='json-view--input' placeholder='property' ref={inputRef} onKeyDown={handleAddKeyDown} />}

			{isEditing && <DoneSVG className='json-view--edit' style={{ display: 'inline-block' }} onClick={adding ? add : deleteSelf} />}
			{isEditing && <CancelSVG className='json-view--edit' style={{ display: 'inline-block' }} onClick={cancel} />}

			{!fold && !isEditing && enableClipboard && customCopy(customOptions) && <CopyButton node={node} />}
			{!fold && !isEditing && editableAdd(editable) && customAdd(customOptions) && (
				<AddSVG
					className='json-view--edit'
					onClick={() => {
						if (isPlainObject) {
							setAdding(true)
							setTimeout(() => inputRef.current?.focus())
						} else {
							add()
						}
					}}
				/>
			)}
			{!fold && !isEditing && editableDelete(editable) && customDelete(customOptions) && _deleteSelf && (
				<DeleteSVG className='json-view--edit' onClick={() => setDeleting(true)} />
			)}
		</>
	)

	if (Array.isArray(node)) {
		return (
			<>
				<span>{'['}</span>

				{Icons}

				{!fold ? (
					<div className='jv-indent'>
						{node.map((n, i) => (
							<NameValue
								key={String(indexOrName) + String(i)}
								indexOrName={i}
								value={n}
								depth={depth}
								parent={node}
								deleteHandle={deleteHandle}
								editHandle={editHandle}
							/>
						))}
					</div>
				) : (
					<button onClick={() => setFold(false)} className='jv-button'>
						...
					</button>
				)}

				<span>{']'}</span>

				{fold && ifDisplay(displaySize, depth, fold) && (
					<span onClick={() => setFold(false)} className='jv-size'>
						{objectSize(node)} Items
					</span>
				)}
			</>
		)
	} else if (isPlainObject) {
		return (
			<>
				<span>{'{'}</span>

				{Icons}

				{!fold ? (
					<div className='jv-indent'>
						{Object.entries(node).map(([name, value]) => (
							<NameValue
								key={String(indexOrName) + String(name)}
								indexOrName={name}
								value={value}
								depth={depth}
								parent={node}
								deleteHandle={deleteHandle}
								editHandle={editHandle}
							/>
						))}
					</div>
				) : (
					<button onClick={() => setFold(false)} className='jv-button'>
						...
					</button>
				)}

				<span>{'}'}</span>

				{fold && ifDisplay(displaySize, depth, fold) && (
					<span onClick={() => setFold(false)} className='jv-size'>
						{objectSize(node)} Items
					</span>
				)}
			</>
		)
	}
	return null
}
