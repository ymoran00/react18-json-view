import {createContext} from "react";
import type {Collapsed, CustomizeCollapseStringUI, CustomizeNode, DisplaySize, Editable} from "../types";
import {
    type JVOnAdd,
    type JVOnChange,
    type JVOnDelete,
    type JVOnEdit,
    type OnCollapse
} from "./json-view";

export const defaultURLRegExp = /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/

export const JsonViewContext = createContext({
    src: undefined as any,

    collapseStringsAfterLength: 99,
    collapseStringMode: 'directly' as 'directly' | 'word' | 'address',
    customizeCollapseStringUI: undefined as CustomizeCollapseStringUI | undefined,

    collapseObjectsAfterLength: 20,
    collapsed: false as Collapsed,
    onCollapse: undefined as OnCollapse | undefined,
    enableClipboard: true,

    editable: false as Editable,
    onEdit: undefined as JVOnEdit | undefined,
    onDelete: undefined as JVOnDelete | undefined,
    onAdd: undefined as JVOnAdd | undefined,
    onChange: undefined as JVOnChange | undefined,

    forceUpdate: () => {},

    customizeNode: undefined as CustomizeNode | undefined,
    customizeCopy: (() => {}) as (node: any) => any,

    displaySize: undefined as DisplaySize,
    displayArrayIndex: true,

    matchesURL: false,
    urlRegExp: defaultURLRegExp,

    ignoreLargeArray: false,

    CopyComponent: undefined as
        | React.FC<{ onClick: (event: React.MouseEvent) => void; className: string }>
        | React.Component<{ onClick: (event: React.MouseEvent) => void; className: string }>
        | undefined,
    CopiedComponent: undefined as
        | React.FC<{ className: string; style: React.CSSProperties }>
        | React.Component<{ className: string; style: React.CSSProperties }>
        | undefined,
    EditComponent: undefined as
        | React.FC<{ onClick: (event: React.MouseEvent) => void; className: string }>
        | React.Component<{ onClick: (event: React.MouseEvent) => void; className: string }>
        | undefined,
    CancelComponent: undefined as
        | React.FC<{ onClick: (event: React.MouseEvent) => void; className: string; style: React.CSSProperties }>
        | React.Component<{ onClick: (event: React.MouseEvent) => void; className: string; style: React.CSSProperties }>
        | undefined,
    DoneComponent: undefined as
        | React.FC<{ onClick: (event: React.MouseEvent) => void; className: string; style: React.CSSProperties }>
        | React.Component<{ onClick: (event: React.MouseEvent) => void; className: string; style: React.CSSProperties }>
        | undefined,
})
