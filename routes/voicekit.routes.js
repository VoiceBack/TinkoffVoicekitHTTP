const {Router} = require('express');
const {body, validationResult} = require('express-validator');
const multer = require('multer');

const checkAccess = require('../middlewares/access.middleware');

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

router.post(
    '/recognize',
    checkAccess,
    upload.single('record'),
    async (req,res)=>{
        if(!req.file){
            return await res.status(400).json({ message: 'Не указан файл для распознавания'});
        }
    }
);

module.exports = router;
