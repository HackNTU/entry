let hist = Array()
let hist_id = 0
let prev_command = ""

/////  Firebase parameters  /////
const database = firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();
//provider.addScope('https://www.googleapis.com/auth/plus.login');
const userLogin = { name: "hackntu" }

const emailregex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


/* new var and config [Start] */

let commands = [];
// window.commands = commands;

Vue.config.debug = true
Vue.config.devtools = true

/* new var and config [End] */



let Prompt = {
    template: `
    <div :id="promptId" class="cmd">
      <span id="p-h">{{ name }}@taipei</span>
      <span id="p-t"> {{ time }}</span>&nbsp;
      <span id="p-d" > {{ dir }} </span> 
      <span id="p-s">$</span > 
      <span id="p-text">{{ text }}</span > 
      <template id="control" v-if="control">
        <span id="_front" >{{front}}</span><span id="cursor">{{cursorText}}</span ><span id="_back">{{back}}</span >
        <input @keyup.stop.prevent="keyup($event)" type="text" id="command" v-model="input"></input>
      </template>
    </div >
    `,
    created() {

        this.time = new Date().toTimeString().substring(0, 5)
        console.log("Prompted.")

    },
    data() {
        return {
            // hr: '',
            // min: '',
            dir: '~',
            time: '10:00', //debug
            input: '123456', //test
            cursorIndex: 0,
        }
    },
    props: {
        control: Boolean,
        text: String,
        index: Number,
    },
    watch: {
        cursorIndex() {
            if (this.cursorIndex > 0)
                this.cursorIndex = 0
            if (-this.cursorIndex > this.input.length)
                this.cursorIndex = -this.input.length
        },
    },
    computed: {
        name: () => userLogin.name,
        promptId: () => 'prompt-' + this.index,
        front() {
            return ((this.cursorIndex < 0) ? this.input.slice(0, this.cursorIndex) : this.input)
        },
        cursorText() {
            return ((this.cursorIndex < 0) ? this.input.substr((this.cursorIndex), 1) : ' ')
        },
        back() {
            return ((this.cursorIndex < -1) ? this.input.slice(this.cursorIndex + 1) : '')
        },
    },
    methods: {
        moveCursor(dir) {
            if (dir === 'left')
                this.cursorIndex -= 1
            if (dir === 'right')
                this.cursorIndex += 1
        },
        enter() {
            console.log("Enter here again")
            commands.push({ 'text': this.input }); // need content
            // if (this.input.length == 0)
            // return;
            this.$parent.run(this.input)
            this.input = '' //clean input
            this.cursorIndex = 0
        },
        keyup(e) {
            switch (e.which) {
                case 37: // Left
                    this.moveCursor('left')
                    break;
                case 39: // Right
                    this.moveCursor('right')
                    break;
                case 13: // Enter
                    this.enter()
                    break;
                default:
                    break;
            }
        },
    }
}


let Prompts = new Vue({
    el: '#prompts',
    template: `
    <div id="console">
      <template v-for="(command, index) in commands">
        <prompt :index="index + 1" :text="command.text"></prompt>
      </template>
      <prompt :index="0" :control="control"></prompt>
    </div>
    `,
    components: {
        Prompt,
    },
    created() {
        // Blinks the cursor
        setInterval(function() {
            if ($('#cursor').css('background-color') == 'rgb(255, 255, 255)') {
                $('#cursor').css('background-color', 'transparent')
            } else {
                $('#cursor').css('background-color', 'white')
            }
        }, 500)

        $('#command').focus()
        $(document).keydown(function(e) {
            $('#command').focus();
        })
    },
    data() {
        return {
            dir: '~',
            control: true,
        }
    },
    computed: {
        name: () => userLogin.name,
        commands: () => commands,
    },
    methods: {
        run(command) {
            this.control = false
            console.log("Get command:", command)
            for (let prop in law) {
                if (law.hasOwnProperty(prop) && law[prop].reg.test(command)) {
                    law[prop].exec(command)
                    return;
                }
            }
            this.done()
        },
        done() {
            this.$nextTick(function() {
                this.control = true
            })
        },
    }

});


/*
function prompt(dir = '~') {
    let date = new Date()
    let hr = date.getHours().toString()
    if (date.getHours() < 10)
        hr = "0" + hr
    let min = date.getMinutes().toString()
    if (date.getMinutes() < 10)
        min = "0" + min
    $('#console').append('<div id="prompt" class="cmd"><span id="p-h">' + userLogin.name + '@taipei</span> <span id="p-t">' +
        hr + ':' + min + '</span>&nbsp;' +
        '<span id="p-d">' + dir + '</span> <span id="p-s">$</span> <span id="control">' +
        '<span id="_front"></span><span id="cursor"></span>' +
        '<input type="text" id="command"></input><span id="_back"></span></span></div>')
    $('#command').focus()
    console.log("Prompted.")
}
*/


$(function() {
    // prompt()
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



/*
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
        console.log("Enter here again")
        let com = front + back
            // Remove old control & rename line id
        $('#control').remove()
        $('#prompt').append('<span>' + com + '</span>')
        $('#prompt').attr('id', 'line-' + hist_id)
        prev_command = ""
        if (com.length == 0)
            return;
        runcommand(com)
        hist.push(com)
        hist_id = hist.length
    } else if (e.which == 8) { // BackSpace
        $('#_front').text(front.slice(0, -1))
        e.preventDefault();
    } else {
        $('#_front').text(front + $('#command').val())
            // console.log("Get input:", $('#command').val())
        $('#command').val("")
    }

})
*/

/*
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
*/

var law = {
    bye: {
        reg: /^bye$/,
        exec: function() {
            if (confirm("Ready to say goodbye?")) {
                setInterval(function() {
                    window.open('about:blank','_self');
                }, 500)
            }
            doneCommand()
        }
    },
    contact: {
        reg: /^contact$/,
        exec: function() {
            function loadUserMeta(meta, column, regex) {
                return new Promise((resolve, reject) => {
                    $('#console').append('<div class="interactive cmd">' + column +
                        ': <input type="text" id="meta" class="text"></input></div>')
                    $('#meta').focus().keyup(function(e) {
                        // Avoids enter been interpreted by document event handler.
                        e.stopPropagation();
                        if (e.which == 13) {
                            if (regex.test($('#meta').val())) {
                                meta[column] = $('#meta').val()
                                console.log("Load!!!!!", $('#meta').val())
                                resolve(meta)
                                $('#meta').attr('id', '');
                            } else {
                                $('#console').append('<div class="error cmd">Illegal input of ' + column + '</div>')
                                reject("Illegal input")
                            }
                        }
                    })
                })
            };

            loadUserMeta({}, "name", /^.*$/).then(obj => {
                return loadUserMeta(obj, "email", emailregex)
            }).then(obj => {
                return loadUserMeta(obj, "quote", /^.*$/)
            }).then(obj => { // Done loading user data
                console.log(obj)
                database.ref().child('contact').push().set(obj);
                doneCommand()
            }).catch(error => {
                console.log(error)
                doneCommand()
            })

        }
    },
    sudo: {
        reg: /^sudo$/,
        exec: loginGoogle
    },
    login: {
        reg: /^login$/,
        exec: loginGoogle
    },
    cat: {
        reg: /^cat.*$/,
        exec: function(command) {
            ascii['cat'].forEach((line, idx, array) => {
                if (idx === 3) {
                    let sentence = command.split(' ').slice(1).join(' ')
                    $('#console').append('<div class="cmd">'+line+'&nbsp;&nbsp;&nbsp;&nbsp;Meow: "'+sentence+'"</div>')
                } else {
                    $('#console').append('<div class="cmd">'+line+'</div>')
                }
            })
            doneCommand()
        }
    },
    dog: {
        reg: /^dog.*$/,
        exec: function(command) {
            let target = "<div class='cmd'><pre>"
            ascii['dog'].forEach((line, idx, array) => {
                target += line
                if (idx === 3) {
                    target += '&nbsp;&nbsp;' + command.split(' ').slice(1).join(' ')
                }
                target += '\n'
            })
            target += "</pre></div>"
            $('#console').append(target)
            doneCommand()
        }
    }
}

function enterSecret() {
    $("#console").append('<div class="sudo cmd">Enter password: ' +
        '<input type="password" id="password"></input></div>')
    $('#password').focus().keyup(function(e) {
        if (e.which == 13) {
            alert("Password:" + $('#password').val())
            doneCommand()
        }
    })
}

function loginGoogle() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
        console.log("Login:", user)
        $('#console').append('<div class="cmd">Welcome, <span id="p-h">' + user.displayName + '</span></div>')
        userLogin.name = user.displayName
        userLogin.email = user.email
        doneCommand()
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(errorCode, errorMessage)
        $('#console').append('<div class="error cmd"><span id="p-d">Error! </span>' +
            errorMessage + '</div>')
        doneCommand()
    });
}



function doneCommand() {
    // prompt()
    Prompts.done()
}

/*
function runcommand(command) {
    console.log("Get command:", command)
    for (let prop in law) {
        if (law.hasOwnProperty(prop) && law[prop].reg.test(command)) {
            law[prop].exec(command)
            return;
        }
    }
    doneCommand()
}
*/


var ascii = {
    cat: ["&nbsp;&nbsp;/\\ ___ /\\"
         ,"&nbsp;(&nbsp;&nbsp;o&nbsp;&nbsp;&nbsp;o&nbsp;&nbsp;) "
         ,"&nbsp;&nbsp;\\&nbsp;&nbsp;>#<&nbsp;&nbsp;/"
         ,"&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\\  "
         ,"&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\\&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;^ "
         ,"|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;//"
         ,"&nbsp;\\&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ &nbsp;&nbsp;// "
         ,"&nbsp;&nbsp;///&nbsp;&nbsp;///&nbsp;&nbsp;--"],
    dog: [  "                                 ,:'/   _...       ",
            "                                // ( `\"\"-.._.'     ",
            "                                \\| /    6\\___       /",
            "                                |     6      4     ",
            "                                |            /      \\",
            "                                \\_       .--'      ",
            "                                (_\'---\'`)          ",
            "                                / `\'---`()         ",
            "                              ,\'        |          ",
            "              ,            .\'`          |          ",
            "              )\       _.-\'             ;          ",
            "             / |    .\'`   _            /           ",
            "           /` /   .\'       '.        , |           ",
            "          /  /   /           \   ;   | |           ",
            "          |  \  |            |  .|   | |           ",
            "           \  `\"|           /.-\' |   | |           ",
            "            '-..-\       _.;.._  |   |.;-.         ",
            "                  \    <`.._  )) |  .;-. ))        ",
            "                  (__.  `  ))-\'  \_    ))'         ",
            "                      `\'--\"`  jgs  `\"\"\"`           "
            ]


};

