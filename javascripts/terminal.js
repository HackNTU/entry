var hist = Array()
var hist_id = 0
var prev_command = ""

function prompt(dir = '~') {
    let date = new Date()
    let hr = date.getHours().toString()
    if (date.getHours() < 10)
      hr = "0" + hr
    let min = date.getMinutes().toString()
    if (date.getMinutes() < 10)
      min = "0" + min
    $('#console').append('<div id="prompt" class="cmd"><span id="p-h">hackntu@taipei</span> <span id="p-t">' +
        hr + ':' + min + '</span>&nbsp;' +
        '<span id="p-d">' + dir + '</span> <span id="p-s">$</span> <span id="control">' +
        '<span id="_front"></span><span id="cursor"></span>' +
        '<input type="text" id="command"></input><span id="_back"></span></span></div>')
}

function runcommand(command) {
    console.log("Get command:", command)
}

$(function() {
    prompt()
    $("#greeting-typed-1").typed({
        stringsElement: $('#greeting-1'),
        showCursor: false,
        typeSpeed: 10,
        callback: function() {
            $("#greeting-typed-2").typed({
                stringsElement: $('#greeting-2'),
                showCursor: false,
                typeSpeed: 10,
                callback: function() {
                    //prompt();
                }
            })
        }
    });
});

$(document).keyup(function(e) {
    let front = $('#_front').text()
    let back = $('#_back').text()

    if (e.which == 37) { // Left
        if (back.length > 0) {
            $('#_front').text(front.slice(0, -1))
            $('#_back').text(front.slice(-1) + back)
        }
    } else if (e.which == 38) { // Up
        if (hist_id > 0) {
            $('#_front').text(hist[hist_id - 1])
            $('#_back').text("")
        }
        if (hist_id == hist.length) {
            prev_command = front + back
        }
        hist_id = Math.max(hist_id - 1, 0);
    } else if (e.which == 39) { // Right
        if (back.length > 0) {
            $('#_front').text(front + back[0])
            $('#_back').text(back.slice(1))
        }
    } else if (e.which == 40) { // Down
        if (hist_id < hist.length - 1) {
            $('#_front').text(hist[hist_id + 1])
            $('#_back').text("")
        } else { // Fill in previous command.
            $('#_front').text(prev_command)
            $('#_back').text("")
        }
        hist_id = Math.min(hist_id + 1, hist.length)
    } else if (e.which == 13) { // Enter
        let com = front + back
            // Remove old control & rename line id
        $('#control').remove()
        $('#prompt').append('<span>' + com + '</span>')
        $('#prompt').attr('id', 'line-' + hist_id)
        prompt()
        prev_command = ""
        if (com.length == 0)
            return;
        runcommand(com)
        hist.push(com)
        hist_id = hist.length
        $('#command').focus()
    } else if (e.which == 8) { // BackSpace
        $('#_front').text(front.slice(0, -1))
        e.preventDefault();
    } else {
        $('#_front').text(front + $('#command').val())
        // console.log("Get input:", $('#command').val())
        $('#command').val("")
    }

})

$(document).keydown(function(e) {
    $('#command').focus();
})

// Blinks the cursor
setInterval(function() {
    if ($('#cursor').css('background-color') == 'rgb(255, 255, 255)') {
        $('#cursor').css('background-color', 'transparent')
    } else {
        $('#cursor').css('background-color', 'white')
    }
}, 500)
