const {Router} = require('express');
const checkAccess = require('../middlewares/access.middleware');
const checkBody = require('../middlewares/checkBody.middleware');
const recognize = require('../voicekit/recognize');
const {getFileFromBase64, parseResponse} = require('../handlers/audio.handler');

const router = Router();

// /voicekit/recognize

router.post(
    '/recognize',
    checkAccess,
    checkBody,
    async (req,res)=>{
        try {
            const {filePath, rate} = await getFileFromBase64(req.body.base64);
            const {encoding, numChannels} = req.body;

            const response = await recognize(filePath, encoding, rate, numChannels);
            const result = parseResponse(response);

            if(!result)
                return res.status(400).json({message: "Voiceless audio"});

            return res.status(200).json({result: result});
        }catch(e){
            return await res.status(400).json({message: e});
        }
    }
);

module.exports = router;
