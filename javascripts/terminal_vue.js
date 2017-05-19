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
                let help = `<pre>
                Here is all the commands available.
                -----------------------------------------------------\n`;
                for (let prop in law) {
                    help += `                <span class='p-s'>${prop}</span>: ${law[prop].help}\n`;
                }
                return help + '</pre>';
            }
        }
    },
    loading: {
        name: 'loading',
        template: `<div class="cmd">[{{spinner}}] Loading{{dots}} </div>`,
        created() {
            this.timer = setInterval(() => {
                this.dots = this.dots.length < 20 ? this.dots + '.' : '.'
            }, 300)
        },
        props: { options: Object },
        data() {
            return {
                dots: '.',
                timer: '',
            };
        },
        computed: {
            spinner() {
                return '|/-\\'.split('')[this.dots.length % 4];
            },
        },
        beforeDestroy() {
            this.timer = clearInterval(this.timer)
        },
    },
    login: {
        name: 'login',
        template: `<div class="cmd">Welcome, <span class="p-h">{{ name }}</span></div>`,
        props: { options: Object },
        computed: {
            name() {
                return this.options.name;
            },
            progress() {
                return this.options.progress;
            },
        }
    },
    contact: {
        name: 'contact',
        template: `<div>
        \>\> Hey bro, feel free to 
        <a href="mailto:hackntu@gmail.com?subject=[Contact from website]">email Us!</a>
        </div>`,
    },
    error: {
        name: 'error',
        template: `<div class="error cmd"><span class="p-d">Error! </span>{{ errorMsg }}</div>`,
        props: { options: Object },
        computed: {
            errorMsg() {
                return this.options.errorMessage
            },
        }
    }
}

/*=====  End of Prompt components  ======*/


let Prompt = {
    template: `
    <div :id="promptId" class="cmd">
      <span class="p-h">{{ name }}@taipei</span>
      <span class="p-t"> {{ time }}</span>&nbsp;
      <span class="p-d"> {{ dir }} </span> 
      <span class="p-s">$</span > 
      <span id="p-text">{{ text }}</span > 
      <template id="control" v-if="control">
        <span id="_front" >{{front}}</span><span id="cursor" v-html="cursorText"></span><span id="_back">{{back}}</span >
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
            console.log('HERE:', this.input.length > 0 && this.cursorIndex < 0)
            return ((this.input.length > 0 && this.cursorIndex < 0) ? this.input.substr((this.cursorIndex), 1) : '&nbsp;')
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
        loading: Art.loading,
        login: Art.login,
        contact: Art.contact,
        error: Art.error,
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
      <prompt v-show="control" :index="0" :time="time" :control="control"></prompt>
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
        exec: function(command) {
            doneCommand();
            return {
                text: command,
                content: 'contact',
            };
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

function loginGoogle(command) {

    let loginResult = {
        text: command,
        content: 'loading',
        options: {},
    };

    firebase.auth().signInWithPopup(provider).then(result => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
        console.log("Login:", user)
        userLogin.name = user.displayName
        userLogin.email = user.email

        loginResult.content = 'login'
        loginResult.options = {
            name: user.displayName,
        }

        doneCommand()
    }).catch((error) => {

        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(errorCode, errorMessage)

        loginResult.content = 'error'
        loginResult.options = {
            errorMessage,
        }
        doneCommand()

    })

    return loginResult;
}



function doneCommand() {
    // prompt()
    Prompts.done()
}
