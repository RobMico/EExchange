"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
function StringifyError(err) {
    let copy = Object.assign({}, err);
    if (err.message) {
        copy.message = err.message;
    }
    if (err.name) {
        copy.name = err.name;
    }
    if (err.stack) {
        copy.stack = err.stack;
    }
    return copy;
}
class Logger {
    static setDefaultConsole() {
        Logger.infoLogs.push((location, message, date, additionalData) => {
            console.log(`INFO//${date.toLocaleTimeString()}//${location}:${message}`);
            if (additionalData) {
                console.log(additionalData);
            }
        });
        Logger.errorLogs.push((location, message, date, additionalData) => {
            console.log(`ERROR//${date.toLocaleTimeString()}//${location}:${message}`);
            if (additionalData) {
                console.log(additionalData);
            }
        });
    }
    static info(location, log, additionalData) {
        for (let x of Logger.infoLogs) {
            x(location, log, new Date(), (additionalData && StringifyError(additionalData)));
        }
    }
    static error(location, message, additionalData) {
        for (let x of Logger.errorLogs) {
            x(location, message, new Date(), StringifyError(additionalData));
        }
    }
}
exports.Logger = Logger;
Logger.errorLogs = [];
Logger.infoLogs = [];
