const fs = require('fs');
const {createSttClient, checkWavFormat} = require('./common.js');
const wav = require('wav');
const concat = require('concat-stream');

const recognize = (file, encoding, rate, numChannels) => {
    const argv = {
        file: file,
        encoding: encoding,
        rate: rate,
        languageCode: 'ru-RU',
        maxAlternatives: 1,
        numChannels: numChannels,
        automaticPunctuation: true,
        performVad: true,
        silenceDurationThreshold: 0.6
    }
    const recognizePromise = new Promise((resolve,reject) => {
        const sttClient = createSttClient();
        const reader = fs.createReadStream(argv.file);
        reader.on('error', (err) => {
            reject('File reading error');
        });
        const concatStream = concat((buf) => {
            const unaryCall = sttClient.Recognize({
                config: {
                    encoding: argv.encoding,
                    sampleRateHertz: argv.rate,
                    languageCode: argv.languageCode,
                    maxAlternatives: argv.maxAlternatives,
                    numChannels: argv.numChannels,
                    enableAutomaticPunctuation: argv.automaticPunctuation,
                    doNotPerformVad: (argv.performVad ? undefined : true),
                    vadConfig: (!argv.performVad ? undefined : {
                        silenceDurationThreshold: argv.silenceDurationThreshold
                    }),
                },
                audio: {
                    content: buf,
                }
            }, (error, response) => {
                if (error != null) {
                    reject('sttClient error');
                } else {
                    fs.unlinkSync(file);
                    resolve(response);
                }
            });
            unaryCall.on('status', () => {
                sttClient.close();
            });
        });

        if (argv.file.endsWith(".wav")) {
            const wavReader = wav.Reader();
            wavReader.on('format', (format) => {
                const checkResult = checkWavFormat(format, argv);
                if (!checkResult.result) {
                    reject(checkResult.msg);
                } else {
                    wavReader.pipe(concatStream);
                }
            });
            reader.pipe(wavReader);
        } else {
            reader.pipe(concatStream);
        }
    });

    return recognizePromise;
}
module.exports = recognize;