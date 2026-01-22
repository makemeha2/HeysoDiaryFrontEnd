import { useReducer } from 'react';

const initialUiState = {
    openedMenuConversationId: null,
    mode: 'idle', // 'idle' | 'rename' | 'delete'
    targetConversationId: null,
    renameTitle: '',
};

function uiReducer(state, action) {
    switch (action.type) {
        case 'MENU_TOGGLE': {
            const nextId =
                state.openedMenuConversationId === action.conversationId ? null : action.conversationId;
            return { ...state, openedMenuConversationId: nextId };
        }

        case 'MENU_CLOSE':
            return { ...state, openedMenuConversationId: null };

        case 'RENAME_OPEN':
            return {
                ...state,
                mode: 'rename',
                targetConversationId: action.conversationId,
                renameTitle: action.title ?? '',
                openedMenuConversationId: null,
            };

        case 'RENAME_CHANGE':
            return { ...state, renameTitle: action.value };

        case 'RENAME_CLOSE':
            return { ...state, mode: 'idle', targetConversationId: null, renameTitle: '' };

        case 'DELETE_OPEN':
            return { ...state, mode: 'delete', targetConversationId: action.conversationId, openedMenuConversationId: null };

        case 'DELETE_CLOSE':
            return { ...state, mode: 'idle', targetConversationId: null };

        case 'RESET':
            return initialUiState;

        default:
            return state;
    }
}

/**
 * 메뉴/다이얼로그(이름변경/삭제) UI 상태를 reducer로 관리하는 훅
 */
export default function useConversationUi() {
    const [ui, dispatchUi] = useReducer(uiReducer, initialUiState);

    // 메뉴
    const toggleMenu = (conversationId) => dispatchUi({ type: 'MENU_TOGGLE', conversationId });
    const closeMenu = () => dispatchUi({ type: 'MENU_CLOSE' });

    // rename
    const openRename = (conversationId, title) =>
        dispatchUi({ type: 'RENAME_OPEN', conversationId, title });
    const changeRenameTitle = (value) => dispatchUi({ type: 'RENAME_CHANGE', value });
    const closeRename = () => dispatchUi({ type: 'RENAME_CLOSE' });

    // delete
    const openDelete = (conversationId) => dispatchUi({ type: 'DELETE_OPEN', conversationId });
    const closeDelete = () => dispatchUi({ type: 'DELETE_CLOSE' });

    // reset
    const resetUi = () => dispatchUi({ type: 'RESET' });

    return {
        ui,
        dispatchUi, // 필요하면 직접 쓰라고 열어둠
        toggleMenu,
        closeMenu,
        openRename,
        changeRenameTitle,
        closeRename,
        openDelete,
        closeDelete,
        resetUi,
    };
}
