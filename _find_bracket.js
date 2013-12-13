var find_bracket = function (type, linenum, pos, bracket) {
    var forward = '';
    if (type == 'NEXT') {
        bracket = bracket.replace('(', ')').replace('[', ']')
            .replace('{', '}').replace('<', '>');
        dir = 'FORWARD';
    } else if (type == 'LAST') {
        dir = 'BACKWARD';
    } else if (type == 'PAIR') {
        bracket = bracket_set[data[linenum][pos]];
        if (data[linenum][pos] in left_bracket_set) {
            dir = 'FORWARD';
        } else {
            dir = 'BACKWARD';
        }
    }

    if (dir == 'FORWARD') {
        while (true) {
            if (data[linenum][pos] == bracket) {
                return [linenum, pos];
            }
            console.log(linenum, pos);
            pos += 1;
            if (pos >= data[linenum].length) {
                linenum += 1;
                if (linenum == data.length) {
                    break;
                } else {
                    pos = 0;
                }
            }
        }
    } else {
        while (true) {
            if (data[linenum][pos] == bracket) {
                return [linenum, pos];
            }
            console.log(linenum, pos);
            pos -= 1;
            if (pos <= -1) {
                linenum -= 1;
                if (linenum == -1) {
                    break;
                } else {
                    pos = data[linenum].length - 1;
                }
            }
            if (data[linenum][pos] == bracket) {
                return [linenum, pos];
            }
        }
    }
    return null;
}
