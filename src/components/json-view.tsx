import { useCallback, useEffect, useState } from 'react'
import JsonNode from './json-node'
import type { Collapsed, CustomizeCollapseStringUI, CustomizeNode, DisplaySize, Editable } from '../types'
import { stringifyForCopying } from '../utils'
import {defaultURLRegExp, JsonViewContext} from "./json-context";

export type JVOnEdit = (params: { newValue: any; oldValue: any; depth: number; src: any; indexOrName: string | number; parentType: 'object' | 'array' | null }) => void | boolean
export type JVOnDelete = (params: { value: any; indexOrName: string | number; depth: number; src: any; parentType: 'object' | 'array' | null }) => void
export type JVOnAdd = (params: { indexOrName: string | number; depth: number; src: any; parentType: 'object' | 'array' }) => void
export type JVOnChange = (params: {
	indexOrName: string | number
	depth: number
	src: any
	parentType: 'object' | 'array' | null
	type: 'add' | 'edit' | 'delete'
}) => void
export type OnCollapse = (params: { isCollapsing: boolean; node: Record<string, any> | Array<any>; indexOrName: string | number | undefined; depth: number }) => void

export interface JsonViewProps {
	src: any

	collapseStringsAfterLength?: number
	collapseStringMode?: 'directly' | 'word' | 'address'
	customizeCollapseStringUI?: CustomizeCollapseStringUI

	collapseObjectsAfterLength?: number
	collapsed?: Collapsed
	onCollapse?: OnCollapse

	enableClipboard?: boolean

	editable?: Editable
	onEdit?: JVOnEdit
	onDelete?: JVOnDelete
	onAdd?: JVOnAdd
	onChange?: JVOnChange

	customizeNode?: CustomizeNode
	customizeCopy?: (node: any) => any

	dark?: boolean
	theme?: 'default' | 'a11y' | 'github' | 'vscode' | 'atom' | 'winter-is-coming'

	displaySize?: DisplaySize
	displayArrayIndex?: boolean

	style?: React.CSSProperties
	className?: string

	matchesURL?: boolean
	urlRegExp?: RegExp

	ignoreLargeArray?: boolean

	CopyComponent?:
		| React.FC<{ onClick: (event: React.MouseEvent) => void; className: string }>
		| React.Component<{ onClick: (event: React.MouseEvent) => void; className: string }>
	CopiedComponent?: React.FC<{ className: string; style: React.CSSProperties }> | React.Component<{ className: string; style: React.CSSProperties }>

	EditComponent?:
	| React.FC<{ onClick: (event: React.MouseEvent) => void; className: string }>
	| React.Component<{ onClick: (event: React.MouseEvent) => void; className: string }>

	CancelComponent?:
	| React.FC<{ onClick: (event: React.MouseEvent) => void; className: string; style: React.CSSProperties }>
	| React.Component<{ onClick: (event: React.MouseEvent) => void; className: string; style: React.CSSProperties }>

	DoneComponent?:
	| React.FC<{ onClick: (event: React.MouseEvent) => void; className: string; style: React.CSSProperties }>
	| React.Component<{ onClick: (event: React.MouseEvent) => void; className: string; style: React.CSSProperties }>
}

export default function JsonView({
	src: _src,

	collapseStringsAfterLength = 99,
	collapseStringMode = 'directly',
	customizeCollapseStringUI,

	collapseObjectsAfterLength = 99,
	collapsed,
	onCollapse,

	enableClipboard = true,

	editable = false,
	onEdit,
	onDelete,
	onAdd,
	onChange,

	dark = false,
	theme = 'default',

	customizeNode,
	customizeCopy = stringifyForCopying,

	displaySize,
	displayArrayIndex = true,

	style,
	className,

	matchesURL = false,
	urlRegExp = defaultURLRegExp,

	ignoreLargeArray = false,

	CopyComponent,
	CopiedComponent,

	EditComponent,
	CancelComponent,
	DoneComponent
}: JsonViewProps) {
	const [_, update] = useState(0)
	const forceUpdate = useCallback(() => update(state => ++state), [])
	const [src, setSrc] = useState(_src)
	useEffect(() => setSrc(_src), [_src])

	return (
		<JsonViewContext.Provider
			value={{
				src,

				collapseStringsAfterLength,
				collapseStringMode,
				customizeCollapseStringUI,

				collapseObjectsAfterLength,
				collapsed,
				onCollapse,

				enableClipboard,

				editable,
				onEdit,
				onDelete,
				onAdd,
				onChange,

				forceUpdate,

				customizeNode,
				customizeCopy,

				displaySize,
				displayArrayIndex,

				matchesURL,
				urlRegExp,

				ignoreLargeArray,

				CopyComponent,
				CopiedComponent,
				EditComponent,
				CancelComponent,
				DoneComponent
			}}>
			<code
				className={'json-view' + (dark ? ' dark' : '') + (theme && theme !== 'default' ? ' json-view_' + theme : '') + (className ? ' ' + className : '')}
				style={style}>
				<JsonNode
					node={src}
					depth={1}
					editHandle={(indexOrName: number | string, newValue: any, oldValue: any) => {
						if (onEdit) {
							const doEdit = onEdit({
								newValue,
								oldValue,
								depth: 1,
								src: newValue,
								indexOrName: indexOrName,
								parentType: null
							});
							if (doEdit === false) {
								return;
							}
						}
						setSrc(newValue)
						if (onChange) onChange({ type: 'edit', depth: 1, src, indexOrName: indexOrName, parentType: null })
					}}
					deleteHandle={() => {
						setSrc(undefined)
						if (onDelete)
							onDelete({
								value: src,
								depth: 1,
								src,
								indexOrName: '',
								parentType: null
							})
						if (onChange)
							onChange({
								depth: 1,
								src,
								indexOrName: '',
								parentType: null,
								type: 'delete'
							})
					}}
				/>
			</code>
		</JsonViewContext.Provider>
	)
}
