const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const keys = require('./config/keys');
const socketio = require('socket.io');
const app = express();
const port = 3000;

// Init Nexmo
const nexmo = new Nexmo({
    apiKey: keys.apiKey,
    apiSecret: keys.apiSecret
}, {debug: true});

// ejs middleware
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Public folder setup
app.use(express.static(__dirname + '/public'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Index route
app.get('/', (req, res) => {
    res.render('index');
});

// Catch form submit
app.post('/', (req, res) => {
    const number = req.body.number;
    const text = req.body.text;

    console.log(nexmo);
    
    nexmo.message.sendSms(
        '16052107009', number, text, {type: 'unicode'},
        (err, responseData) => {
            if(err) {
                console.log(err);
            } else {
                console.dir(responseData);
                // Get data from response
                const data = {
                    id: responseData.messages[0]['message-id'],
                    number: responseData.messages[0]['to']
                }

                // Emit to the client
                io.emit('smsStatus', data);
            }
        }
    );
})

// Start server
const server = app.listen(port, () => {
    console.log(`server started on port ${port}`);
});

// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
    console.log('Connected to socket.io');
    io.on('disconnected', () => {
        console.log('Disconnected from socket.io');
    });
})
