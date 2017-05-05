let hist = Array()
let hist_id = 0
let prev_command = ""
let major_url = 'https://hackntu.tumblr.com';

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


/*=========================================
=            Prompt components            =
=========================================*/


/*----------  ASCII Art  ----------*/

var Art = {
    dog: {
        name: 'dog',
        template: `<div>
                                 ,:'/   _...      
                                // ( \`\"\"-.._.'    
                                \\| /    6\\___       /
                                |     6      4       {{yelp}}
                                |            /      \\
                                \\_       .--'      
                                (_\'---\'\`)          
                                / \`\'---\`()         
                              ,\'        |          
              ,            .\'\`          |          
              )\       _.-\'             ;          
             / |    .\'\`   _            /           
           /\` /   .\'       '.        , |           
          /  /   /           \   ;   | |           
          |  \  |            |  .|   | |           
           \  \`\"|           /.-\' |   | |           
            '-..-\       _.;.._  |   |.;-.         
                  \    <\`.._  )) |  .;-. ))        
                  (__.  \`  ))-\'  \_    ))'         
                      \`\'--\"\`       \`\"\"\"\`          
        </div>`.replace(/ /g, "&nbsp;").replace(/\n/g, "<br>"),
        props: {
            options: Object,
        },
        computed: {
            yelp() {
                return this.options.yelp;
            }
        },
    },
    cat: {
        name: 'cat',
        template: `<div>
              /\\ ___ /\\
             (  o   o  )            / 
              \\  >#<  /       Meow: "{{ yelp }}"     
              /       \\            \\
             /         \\       ^
            |           |     //
             \\         /    //
              ///  ///   --
      
        </div>`.replace(/ /g, "&nbsp;").replace(/\n/g, "<br>"),
        props: {
            options: Object,
        },
        computed: {
            yelp() {
                return this.options.yelp;
            }
        },
    },
    help: {
        name: 'help',
        template: `<div v-html="usage"></div>`,
        props: {
            options: Object,
        },
        computed: {
            usage() {
                let help = `
                Here is all the commands available.
                -----------------------------------------------------\n`;
                for (let prop in law) {
                    help += `                ${prop}: ${law[prop].help}\n`;
                }
                return help.replace(/ /g, "&nbsp;").replace(/\n/g, "<br>");
            }
        }
    }
}

/*=====  End of Prompt components  ======*/


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
      <component v-if="componentExist" :is="content" :options="options"></component>
    </div >
    `,
    // <div v-html="content"></div>
    created() {
        console.log("Prompted.", this.time)

    },
    data() {
        return {
            // hr: '',
            // min: '',
            dir: '~',
            // time: '10:00:00', //debug
            input: 'dog yelp', //test
            cursorIndex: 0,
        }
    },
    props: {
        time: String,
        control: Boolean,
        text: String,
        content: String,
        index: Number,
        options: Object,
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
        // TODO: promptId + this.index
        promptId: () => 'prompt-' + commands.length,
        front() {
            return ((this.cursorIndex < 0) ? this.input.slice(0, this.cursorIndex) : this.input)
        },
        cursorText() {
            return ((this.cursorIndex < 0) ? this.input.substr((this.cursorIndex), 1) : ' ')
        },
        back() {
            return ((this.cursorIndex < -1) ? this.input.slice(this.cursorIndex + 1) : '')
        },
        // check component exist
        componentExist() {
            return this.$options.components[this.content] ? true : false
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
            console.log("Enter command:", this.input, " init @ ", this.time)
            let command = {}
            command = this.$parent.run(this.input)
            command.time = this.time

            commands.push(command);
            // if (this.input.length == 0)
            // return;

            this.input = '' //clean input
            this.cursorIndex = 0
        },
        updateHistory() {
            prev_command = ""
            if (this.input.length == 0)
                return;

            hist.push(this.input)
            hist_id = hist.length
        },
        prevHistory() {

            if (hist_id == hist.length) {
                prev_command = this.input
            }
            if (hist_id > 0) {
                this.input = hist[hist_id - 1]
            }
            hist_id = Math.max(hist_id - 1, 0);
            console.log("Hist id:", hist_id, "history:", hist, "prev:", prev_command)
        },
        nextHistory() {

            this.input = (hist_id >= hist.length - 1) ? prev_command : hist[hist_id + 1]
            hist_id = Math.min(hist_id + 1, hist.length)
            console.log("Hist id:", hist_id, "history:", hist, "prev:", prev_command)
        },
        keyup(e) {
            // scroll to bottom
            window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight)

            switch (e.which) {
                case 37: // Left
                    this.moveCursor('left');
                    break;
                case 38: // Up
                    console.log("Up key!")
                    this.prevHistory();
                    break;
                case 39: // Right
                    this.moveCursor('right');
                    break;
                case 40: // Down
                    console.log("Down key!")
                    this.nextHistory();
                    break;
                case 13: // Enter
                    this.updateHistory();
                    this.enter();
                    break;
                default:
                    break;
            }
        },
    },
    components: {
        dog: Art.dog,
        cat: Art.cat,
        help: Art.help,
        default: {
            name: 'default',
            template: `<div>{{ result }}</div>`.replace(/ /g, "&nbsp;").replace(/\n/g, "<br>"),
            props: {
                options: Object,
            },
            computed: {
                result() {
                    return this.options.result;
                }
            },
        },
    }
}


let Prompts = new Vue({
    el: '#prompts',
    template: `
    <div id="console">
      <template v-for="(command, index) in commands">
        <prompt :index="index + 1" :time="command.time" :text="command.text" :content="command.content" :options="command.options"></prompt>
      </template>
      <prompt :index="0" :time="time" :control="control"></prompt>
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

        setInterval(() => {
            this.time = new Date().toTimeString().substring(0, 5)

            // this.time = new Date().toTimeString().substring(0, 8) //debug
        }, 500)

    },
    data() {
        return {
            dir: '~',
            control: true,
            time: new Date().toTimeString().substring(0, 5), // preview
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
            if (command == '') {
                this.done()
                return { text: command, content: 'default', options: { result: '' } }
            }
            for (let prop in law) {
                if (law.hasOwnProperty(prop) && law[prop].reg.test(command)) {
                    return law[prop].exec(command);
                }
            }
            console.log("Command not found.")
            this.done()
            return {
                text: command,
                content: 'default',
                options: {
                    result: "  Command `" + command + "` not found."
                }
            }
        },
        done() {
            this.$nextTick(function() {
                // scroll to bottom
                window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight)

                this.control = true

            })
        },
    }

});



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


var law = {
    bye: {
        reg: /^bye$/,
        exec: function() {
            if (confirm("Ready to say goodbye?")) {
                setInterval(function() {
                    window.open('about:blank', '_self');
                }, 500)
            }
            doneCommand()
        },
        help: "Honey plz don't leave me....",
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

        },
        help: "Contact us!",
    },
    sudo: {
        reg: /^sudo$/,
        exec: loginGoogle,
        help: "Hack me.",
    },
    login: {
        reg: /^login$/,
        exec: loginGoogle,
        help: "I wonder what a login user can do.",
    },
    cat: {
        reg: /^cat.*$/,
        exec: function(command) {
            doneCommand()
            return {
                text: command,
                content: 'cat',
                options: {
                    yelp: command.split(' ').slice(1).join(' '),
                }
            }
        },
        help: "Programmer loves cat, right?",
    },
    dog: {
        reg: /^dog.*$/,
        exec: function(command) {
            doneCommand()
            return {
                text: command,
                content: 'dog',
                options: {
                    yelp: command.split(' ').slice(1).join(' '),
                }
            }
        },
        help: "No, dog is the best!!!",
    },
    help: {
        reg: /^help$/,
        exec: (command) => {
            doneCommand()
            return {
                text: command,
                content: 'help',
            }
        },
        help: "Show this to you!",
    },
    attend: {
        reg: /(^|.*[ ])(attend|start|go|dev|develop|hack|attend|join|sponsor|install|register)([ ].*|$)/,
        exec: (command) => {
            window.location.href = major_url;
        },
        help: "Navigate to 2017 Hackathon website!",
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
