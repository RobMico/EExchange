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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    constructor() {
        this.tokens = 20;
        this.tokenAwaiters = [];
        this.interval = setInterval(() => {
            this.tokens = 20;
            if (this.tokenAwaiters.length > 0) {
                for (; this.tokens > 0;) {
                    let callback = this.tokenAwaiters.shift();
                    if (!callback) {
                        break;
                    }
                    callback();
                    this.tokens--;
                }
            }
        }, 1000);
    }
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tokens > 0) {
                this.tokens--;
                return;
            }
            yield new Promise((res) => {
                this.tokenAwaiters.push(() => {
                    res(true);
                });
            });
            return;
        });
    }
}
exports.RateLimiter = RateLimiter;
