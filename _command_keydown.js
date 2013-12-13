var command_keydown = function (i) {
    if (i == 'ESC' || i == '<C-c>') {
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'ENTER') {
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
        command_data_list = command_data.split(/ +/);
        command = command_data_list[0];
        if (command in bind_command_list) {
            (bind_command_list[command])(command_data_list.slice(1), data);
        } else {
            set_alert('這個功能沒有被實作唷');
        }
    } else if (i == 'BACKSPACE') {
        if (command_cursor > 1) {
            command_data =
                command_data.slice(0, command_cursor-1)
                + command_data.slice(command_cursor);
            command_cursor -= 1;
            draw_command(command_cursor);
        } else {
            set_state('NORMAL');
            draw(cursor[0], 'CURSOR', cursor[1]);
        }
    } else if (i == 'LEFT') {
        command_cursor = command_cursor > 1 ? command_cursor-1 : command_cursor;
        draw_command(command_cursor);
    } else if (i == 'RIGHT') {
        command_cursor = command_cursor < command_data.length ? command_cursor+1 : command_cursor;
        draw_command(command_cursor);
    } else {
        if (i == 'SPACE') {
            i = ' ';
        }
        command_data += i;
        command_cursor += 1;
        draw_command(command_cursor);
    }
}
