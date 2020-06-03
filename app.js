const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const app = express();

//const ngrok = require('ngrok');

app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use('/voicekit', require('./routes/voicekit.routes'));

const PORT = process.env.PORT || config.get('port');
async function start(){
    try{
        app.listen(PORT, ()=>{
            console.log("Server started");
            // ngrok.connect({
            //     addr: PORT,
            // }).then(r=>{
            //     console.log(r);
            // });
        });
    } catch(e) {
        console.log('Server Error:', e.message);
        process.exit(1);
    }
}

start();