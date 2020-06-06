const config = require('config');

const setDefaultParams = body => {
    if(!body.encoding)
        body.encoding = config.get('DEFAULT_ENCODING');
    if(!body.numChannels)
        body.numChannels = config.get('DEFAULT_NUM_CHANNELS');
}

module.exports = async (req, res, next) => {
    if (!req.body.base64)
        return await res.status(400).json({message: 'Empty base64 field'});
    setDefaultParams(req.body);
    next();
}