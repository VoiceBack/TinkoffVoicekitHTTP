const config = require('config');
const protoLoader = require('@grpc/proto-loader');
const grpcLibrary = require('grpc');

const jwtMetadataGenerator = require('./auth');

const packageDefinition = protoLoader.loadSync(
    [
        __dirname + '/../voicekit/apis/tinkoff/cloud/stt/v1/stt.proto',
        __dirname + '/../voicekit/apis/tinkoff/cloud/tts/v1/tts.proto',
    ],
    {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const sttProto = grpcLibrary.loadPackageDefinition(packageDefinition).tinkoff.cloud.stt.v1;
const ttsProto = grpcLibrary.loadPackageDefinition(packageDefinition).tinkoff.cloud.tts.v1;

function createAuthCredentials() {
    const apiKey = config.get('VOICEKIT_API_KEY');
    const secretKey = config.get('VOICEKIT_SECRET_KEY');

    const channelCredentials = grpcLibrary.credentials.createSsl();
    const callCredentials = grpcLibrary.credentials.createFromMetadataGenerator(
        jwtMetadataGenerator(apiKey, secretKey, "test_issuer", "test_subject"));

    return grpcLibrary.credentials.combineChannelCredentials(channelCredentials, callCredentials);
}


function createSttClient() {
    return new sttProto.SpeechToText("stt.tinkoff.ru:443", createAuthCredentials());
}

function createTtsClient() {
    return new ttsProto.TextToSpeech("tts.tinkoff.ru:443", createAuthCredentials());
}

function checkWavFormat(format, argv) {
    const formatTags = {
        'LINEAR16': 0x0001,
        'ALAW': 0x0006,
        'MULAW': 0x0007,
    };
    const bitDepth = {
        'LINEAR16': 16,
        'ALAW': 8,
        'MULAW': 8,
    };

    if (format.endianness !== 'LE') {
        return {
            result: false,
            msg: `${format.endianness} endian not supported`
        }
    }
    if (format.channels !== argv.numChannels) {
        return {
            result: false,
            msg: `Specified ${argv.numChannels} channels but wav header reports ${format.channels} channels`
        }
    }
    if (format.sampleRate !== argv.rate) {
        return {
            result: false,
            msg: `Specified sample rate ${argv.rate}Hz but wav header reports ${format.sampleRate}Hz`
        }
    }
    if (format.audioFormat !== formatTags[argv.encoding]) {
        return {
            result: false,
            msg: `Specified encoding ${argv.encoding} but wav header reports format tag ${format.audioFormat}`
        }
    }
    if (format.bitDepth !== bitDepth[argv.encoding]) {
        return {
            result: false,
            msg: `Specified encoding ${argv.encoding} but wav header reports bit depth ${format.bitDepth}`
        }
    }
    return {
        result: true
    }
}

module.exports = {
    createSttClient,
    createTtsClient,
    checkWavFormat,
};
