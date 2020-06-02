const express = require('express');
const config = require('config');

const app = express();

app.use('/voicekit', require('./routes/voicekit.routes'));

const PORT = config.get('port') || 3001;
async function start(){
    try{
        app.listen(PORT, ()=>{
            console.log("Server started");
        });
    } catch(e) {
        console.log('Server Error:', e.message);
        process.exit(1);
    }
}

start();