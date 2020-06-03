const {Router} = require('express');
const config = require('config');
const fs = require('fs');
const wav = require('node-wav');
const checkAccess = require('../middlewares/access.middleware');

const recognize = require('../voicekit/recognize');


const router = Router();

// /voicekit/recognize

const setDefaultParams = body => {
    if(!body.encoding)
        body.encoding = config.get('DEFAULT_ENCODING');
    if(!body.numChannels)
        body.numChannels = config.get('DEFAULT_NUM_CHANNELS');
}

const getFileFromBase64 = async (base64, timeout) => {
    return new Promise((resolve,reject)=>{
        const fName = `uploads/${Date.now()}.wav`
        fs.writeFile(fName, base64, {encoding: 'base64'}, (err)=>{
            if(err) {
                fs.unlinkSync(fName);
                reject(err);
            }
            else {
                try {
                    const buffer = fs.readFileSync(fName);
                    const result = wav.decode(buffer);
                    resolve({
                        filePath: fName,
                        rate: result.sampleRate
                    });
                }catch(e){
                    reject('Invalid .wav file')
                }
            }
        })
    });
}

const parseResponse = response => {
    const results = response.results;
    if(!results)
        return false;

    let resText = '';
    for(let k in results){
        const result = results[k];
        const text = result.alternatives.pop().transcript;
        if(text)
            resText += text + " ";
    }
    resText = resText.trim();
    if(resText.length>0)
        return resText;

    return false;

}

router.post(
    '/recognize',
    checkAccess,
    async (req,res)=>{
        if (!req.body.base64)
            return await res.status(400).json({message: 'Empty base64 field'});

        try {
            const {filePath, rate} = await getFileFromBase64(req.body.base64, 10);
            setDefaultParams(req.body);
            const {encoding, numChannels} = req.body;
            recognize(filePath, encoding, rate, numChannels)
                .then(r => {
                    const result = parseResponse(r);
                    if (!result)
                        return res.status(400).json({message: "Voiceless audio"});
                    return res.status(200).json({result: result});
                })
                .catch(err => {
                    return res.status(400).json({message: err});
                })
        }catch(e){
            return await res.status(401).json({message: e});
        }
    }
);

module.exports = router;
