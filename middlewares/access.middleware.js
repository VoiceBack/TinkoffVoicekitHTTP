const config = require('config');

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS'){
        return next();
    }
    try{
        const secret = req.headers.authorization;
        if(!secret){
            return res.status(401).json({message: 'Не указан токен авторизации'})
        }
        if(secret!==config.get('secret')){
            return res.status(401).json({message: 'Неверный токен авторизации'})
        }
        next();
    }catch(e){
        return res.status(500).json({message: 'Ошибка'})
    }
};