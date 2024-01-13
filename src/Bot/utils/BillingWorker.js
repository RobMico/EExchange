"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingWorker = void 0;
const ConfigManager_1 = require("../../ConfigManager");
const structs_1 = require("../../structs");
const Logger_1 = require("./Logger");
const logLocation = 'Bill worker';
class BillRequest {
    constructor() {
        this.type = structs_1.BillingTypes.ask;
    }
}
class BillStatic {
    constructor() {
        this.type = structs_1.BillingTypes.static;
    }
}
class BillPool {
    constructor() {
        this.type = structs_1.BillingTypes.pool;
        this.currentIndex = 0;
    }
    validateIndex() {
        if (this.data.length == 0) {
            return false;
        }
        this.currentIndex = this.currentIndex % this.data.length;
        return true;
    }
}
class BillingWorker {
    constructor() {
        this.billings = {};
    }
    requestBill(currency) {
        let bill = this.billings[currency];
        if (!bill) {
            return false;
        }
        else if (bill.type === structs_1.BillingTypes.static) {
            return bill.data;
        }
        else if (bill.type === structs_1.BillingTypes.pool) {
            if (!bill.validateIndex()) {
                Logger_1.Logger.error(logLocation, 'Bills ended', {});
                bill = new BillRequest();
                this.billings[currency] = bill;
            }
            else {
                let billStr = bill.data[bill.currentIndex];
                bill.currentIndex++;
                return billStr;
            }
        }
        if (bill.type === structs_1.BillingTypes.ask) {
            return false;
        }
    }
    removeBillFromPool(currency, bill) {
        let tmp = this.billings[currency];
        if (tmp && tmp.type === structs_1.BillingTypes.pool) {
            let length = tmp.data.length;
            tmp.data = tmp.data.filter(e => e != bill);
            if (tmp.data.length === 0) {
                Logger_1.Logger.error('Billing worker', 'Bills pool exhausted, new bill type - request', { currency: currency });
                this.billings[currency] = new BillRequest();
                if (length > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            if (this.saveMe) {
                this.saveMe(this);
            }
            if (length != tmp.data.length) {
                return true;
            }
            return false;
        }
        else {
            return false;
        }
    }
    newBill(currency, type, data) {
        if (!Object.values(ConfigManager_1.ConfigManager.strings.CurrenciesToShort).includes(currency)) {
            return;
        }
        if (type == structs_1.BillingTypes.ask) {
            this.billings[currency] = new BillRequest();
        }
        else if (type == structs_1.BillingTypes.static) {
            let tmp = new BillStatic();
            tmp.data = data;
            this.billings[currency] = tmp;
        }
        else if (type == structs_1.BillingTypes.pool) {
            let tmp = new BillPool();
            tmp.data = data;
            this.billings[currency] = tmp;
        }
        if (this.saveMe) {
            this.saveMe(this);
        }
    }
    pullToPool(currency, data) {
        let tmp = this.billings[currency];
        if (tmp && tmp.type == structs_1.BillingTypes.pool) {
            tmp.data = tmp.data.concat(data);
        }
        if (this.saveMe) {
            this.saveMe(this);
        }
    }
    importData(currency, value) {
        let data = value.split('|');
        if (data) {
            let type = data[0];
            if (type) {
                if (type == structs_1.BillingTypes.ask.toString()) {
                    this.billings[currency] = new BillRequest();
                }
                else if (type == structs_1.BillingTypes.static.toString()) {
                    if (data[1]) {
                        let tmp = new BillStatic();
                        tmp.data = data[1];
                        this.billings[currency] = tmp;
                    }
                }
                else if (type == structs_1.BillingTypes.pool.toString()) {
                    if (data[1]) {
                        let tmp = new BillPool();
                        tmp.data = [];
                        for (let i = 1; i < data.length; i++) {
                            if (data[i]) {
                                tmp.data.push(data[i]);
                            }
                        }
                        this.billings[currency] = tmp;
                    }
                }
            }
        }
    }
    exportData() {
        return Object.keys(this.billings).map(currency => {
            let tmp = this.billings[currency], str = '';
            if (tmp.type == structs_1.BillingTypes.pool) {
                str = tmp.data.join('|');
            }
            else if (tmp.type == structs_1.BillingTypes.static) {
                str = tmp.data;
            }
            return [currency, this.billings[currency].type + '|' + str];
        });
    }
    getStatus() {
        return Object.keys(this.billings).map(currency => {
            let tmp = this.billings[currency], str = '';
            let type;
            if (tmp.type == structs_1.BillingTypes.pool) {
                str = tmp.data.join('\n\t');
                type = "Pool";
            }
            else if (tmp.type == structs_1.BillingTypes.static) {
                str = tmp.data;
                type = "Static";
            }
            else {
                type = "Query each";
            }
            return `${currency}(${type}):${str}`;
        }).join('\n');
    }
}
exports.BillingWorker = BillingWorker;
