"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requests = void 0;
const https_1 = __importDefault(require("https"));
const stream_1 = require("stream");
class requests {
    static request(options, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let req = https_1.default.request(options, (res) => {
                    res.setEncoding('utf8');
                    let body = '';
                    res.on('data', function (chunk) {
                        body = body + chunk;
                    });
                    res.on('end', function () {
                        resolve({ headers: res.headers, data: body, statusCode: res.statusCode });
                    });
                });
                req.on('error', function (e) {
                    reject(e);
                });
                if (body) {
                    req.write(body);
                }
                req.end();
            });
        });
    }
    static requestStream(options, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = new stream_1.Readable({ highWaterMark: 1024 * 1024 });
            stream._read = () => { };
            return new Promise((resolve, reject) => {
                let req = https_1.default.request(options, (res) => {
                    resolve({ headers: res.headers, stream: stream, statusCode: res.statusCode });
                    res.on('data', function (chunk) {
                        stream.push(chunk); //?
                    });
                    res.on('end', function () {
                        stream.push(null); //?
                    });
                });
                req.on('error', function (e) {
                    reject(e);
                });
                if (body) {
                    req.write(body);
                }
                req.end();
            });
        });
    }
}
exports.requests = requests;
