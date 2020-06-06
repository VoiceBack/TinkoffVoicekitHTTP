const fs = require('fs');
const wav = require('node-wav');

const getFileFromBase64 = async base64 => {
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
        const sentence = result.alternatives.pop();
        if(sentence) {
            const text = sentence.transcript;
            if (text)
                resText += text + " ";
        }
    }
    resText = resText.trim();
    if(resText.length>0)
        return resText;

    return false;

}

module.exports = {
    getFileFromBase64,
    parseResponse
}