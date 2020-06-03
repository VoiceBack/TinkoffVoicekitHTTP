const {Router} = require('express');
const multer = require('multer');
const config = require('config');

const checkAccess = require('../middlewares/access.middleware');

const recognize = require('../voicekit/recognize');

const util = require('util');

const router = Router();

// /voicekit/recognize

const imgFilter = (req, file, cb) => {
    if(file.mimetype === "audio/wav"){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage:storageConfig,
    fileFilter: imgFilter
});

const setDefaultParams = body => {
    if(!body.encoding)
        body.encoding = config.get('DEFAULT_ENCODING');
    if(!body.rate)
        body.rate = config.get('DEFAULT_RATE');
    if(!body.numChannels)
        body.numChannels = config.get('DEFAULT_NUM_CHANNELS');
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
    upload.single('record'),
    async (req,res)=>{
        if(!req.file){
            return await res.status(400).json({ message: 'Не указан файл для распознавания'});
        }
        setDefaultParams(req.body);
        const {encoding, numChannels, rate} = req.body;
        recognize(req.file.path, encoding, rate, numChannels)
            .then(r=>{
                const result = parseResponse(r);
                if(!result)
                    return res.status(400).json({ message: "Voiceless audio" });
                return res.status(200).json({ result: result });
            })
            .catch(err=>{
                return res.status(400).json({ message: err });
            })
    }
);

module.exports = router;
