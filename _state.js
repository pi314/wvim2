var set_state = function (s) {
    if (get_state() != 'NORMAL' && s == 'NORMAL') {
        if (data_dirty()) {
            push_history();
            console.log('dirty');
        }
    }
    if (s == 'NORMAL') {
        visual_cursor = null;
        delete_cursor = null;
        pair_bracket_cursor = null;
    }
    state = s;
    var message = ''
    switch (state) {
        case 'NORMAL':       message = '';               break;
        case 'INSERT':       message = '--插入--';       break;
        case 'DELETE_FIND':
        case 'VISUAL_LINE_FIND':
        case 'VISUAL_FIND':
        case 'VISUAL_BLOCK_FIND':
        case 'CHANGE_FIND':
        case 'FIND':         message = '--向右尋找--';   break;
        case 'DELETE_DNIF':
        case 'VISUAL_LINE_DNIF':
        case 'VISUAL_DNIF':
        case 'VISUAL_BLOCK_DNIF':
        case 'CHANGE_DNIF':
        case 'DNIF':         message = '--向左尋找--';   break;
        case 'DELETE':       message = '--刪除--';       break;
        case 'DELETE_IN':    message = '--刪除括號內--'; break;
        case 'DELETE_DNIF':  message = '--向左尋找--';   break;
        case 'GO':           message = '';               break;
        case 'VISUAL_LINE':  message = '--[行]--';       break;
        case 'VISUAL':       message = '--選取--';       break;
        case 'VISUAL_BLOCK': message = '--[區塊]--';     break;
        case 'INSERT_BLOCK': message = '--插入--';       break;
        case 'CHANGE':       message = '--更改--';       break;
        case 'VISUAL_REPLACE':
        case 'VISUAL_LINE_REPLACE':
        case 'VISUAL_BLOCK_REPLACE':
        case 'REPLACE_CHAR':
        case 'REPLACE':      message = '--取代--';       break;
        case 'COPY':         message = '--複製--';       break;
        case 'DELETE_TO':    message = '--刪除至--';     break;
        case 'CHANGE_TO':    message = '--更改至--';     break;
        case 'SHIFT_LEFT':   message = '--左移--';       break;
        case 'SHIFT_RIGHT':  message = '--右移--';       break;
    }
    set_message(message);
}

get_state = function () {
    return state;
}
