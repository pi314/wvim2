$(function () {

wvim = (function () {
    var data = [''];
    //var data = ['aaaaaaaaaa', ' aa', 'bbbbbbbbbb', 'cccccccccc', '1234'];
    //var data = ['測試'];

    // Registers

    // Register 0, for copy
    var copy_data = [''];
    var copy_type = '';

    var history = [ [ [0,0], [''] ] ];
    var history_pos = 0;
    var replace_buffer = '';

    var command_data = ';';
    var command_cursor = 0;

    var message_data = '';
    var message_type = '';

    var total_lines = 1;
    var display_start = 0;

    var cursor = [0, 0];
    var visual_cursor = null;
    var pair_bracket_cursor = null;
    var delete_cursor = null;
    var cover = 0;
    var state = 'NORMAL';
    var char_set = pi314.set(ALPHABET + NUMBER + '_');
    var bracket_set = {
            '(':')', ')':'(', '[':']', ']':'[', '{':'}', '}':'{',
            '<':'>', '>':'<'
        };
    var left_bracket_set = pi314.set('([{<');

    var bind_command_list = {};

    var wvim_global_vars = {'nu': true};

#_wrap_v_bracket.js
#_wrap_visual.js
#_util.js
#_find_bracket.js
#_state.js
#_redraw.js
#_draw.js
#_draw_normal.js
#_draw_cursor.js
#_draw_visual.js
#_draw_bracket.js
#_normal_keydown.js
#_insert_keydown.js
#_find_keydown.js
#_delete_keydown.js
#_go_keydown.js
#_visual_line_keydown.js
#_visual_keydown.js
#_visual_block_keydown.js
#_insert_block_keydown.js
#_delete_in_keydown.js
#_redraw_visual.js
#_redraw_bracket.js
#_get_visual_range.js
#_change_keydown.js
#_history.js
#_replace_keydown.js
#_copy_keydown.js
#_command_keydown.js
#_wvim_global_vars.js
#_replace_char_keydown.js
#_copy_in_keydown.js
#_shift_keydown.js

    var _keydown = function (i) {
        switch (state) {
        case 'NORMAL':      normal_keydown(i);       break;
        case 'INSERT':      insert_keydown(i);       break;
        case 'FIND':        find_keydown(i, 'FORWARD', 'NORMAL'); break;
        case 'DNIF':        find_keydown(i, 'BACKWARD','NORMAL'); break;
        case 'DELETE':      delete_keydown(i);       break;
        case 'DELETE_IN':   delete_in_keydown(i);    break;
        case 'DELETE_FIND': delete_find_keydown(i, 'FORWARD');  break;
        case 'DELETE_DNIF': delete_find_keydown(i, 'BACKWARD'); break;
        case 'GO':          go_keydown(i);           break;
        case 'VISUAL_LINE': visual_line_keydown(i);  break;
        case 'VISUAL':      visual_keydown(i);       break;
        case 'VISUAL_BLOCK':visual_block_keydown(i); break;
        case 'INSERT_BLOCK':insert_block_keydown(i); break;
        case 'VISUAL_LINE_FIND':  find_keydown(i, 'FORWARD', 'VISUAL_LINE'); break;
        case 'VISUAL_LINE_DNIF':  find_keydown(i, 'BACKWARD','VISUAL_LINE'); break;
        case 'VISUAL_FIND':       find_keydown(i, 'FORWARD', 'VISUAL'); break;
        case 'VISUAL_DNIF':       find_keydown(i, 'BACKWARD','VISUAL'); break;
        case 'VISUAL_BLOCK_FIND': find_keydown(i, 'FORWARD', 'VISUAL_BLOCK'); break;
        case 'VISUAL_BLOCK_DNIF': find_keydown(i, 'BACKWARD','VISUAL_BLOCK'); break;
        case 'CHANGE':      change_keydown(i);       break;
        case 'CHANGE_FIND': change_find_keydown(i, 'FORWARD');  break;
        case 'CHANGE_DNIF': change_find_keydown(i, 'BACKWARD'); break;
        case 'DELETE_TO':   delete_find_keydown(i, 'TO'); break;
        case 'CHANGE_TO':   change_find_keydown(i, 'TO'); break;
        case 'CHANGE_IN':   change_in_keydown(i);    break;
        case 'REPLACE':     replace_keydown(i);      break;
        case 'COPY':        copy_keydown(i);         break;
        case 'COMMAND':     command_keydown(i);      break;
        case 'REPLACE_CHAR':replace_char_keydown(i, 'NORMAL'); break;
        case 'VISUAL_LINE_REPLACE_CHAR':  replace_char_keydown(i, 'VISUAL_LINE');  break;
        case 'VISUAL_REPLACE_CHAR':       replace_char_keydown(i, 'VISUAL');       break;
        case 'VISUAL_BLOCK_REPLACE_CHAR': replace_char_keydown(i, 'VISUAL_BLOCK'); break;
        case 'SHIFT_LEFT':  shift_left_keydown(i);  break;
        case 'SHIFT_RIGHT': shift_right_keydown(i); break;
        }

        show_message();
 
        redraw_bracket();
        check_display_range(total_lines);

        console.log(i, state);
        console.log(data);
    };

#_belt_control.js
    total_lines = belt_count();
    redraw();

    $(window).resize(window_resize_event);

    return {
        keydown: function (i) {
            _keydown(i);
        },
        bind: function (command, callback) {
            bind_command_list[command] = callback;
            return wvim;
        },
        set: function (args) {
            set_wvim_global_var(args);
        }
    };
})();

});
