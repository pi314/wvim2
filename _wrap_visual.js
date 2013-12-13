var wrap_visual = function (i) {
    var ret = '';
    for (var a = 0; a < i.length; a++) {
        ret += '<span class="visual">' + i[a] + '</span>';
    }
    return ret;
}
