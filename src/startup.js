"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.start = void 0;
const telegraf_1 = require("telegraf");
const ConfigManager_1 = require("./ConfigManager");
const Logger_1 = require("./Bot/utils/Logger");
const SqliteStorage_1 = require("./Storage/SqliteStorage");
const structs_1 = require("./structs");
const BotMenu_1 = require("./Bot/BotMenu");
const cache = __importStar(require("node-cache"));
const strings_1 = require("../strings");
const index_1 = __importDefault(require("./converter/index"));
const RateLimiter_1 = require("./Bot/utils/RateLimiter");
const Requests_1 = require("./Bot/utils/Requests");
const BillingWorker_1 = require("./Bot/utils/BillingWorker");
const logLocation = 'start';
const start = (token, dbPath) => __awaiter(void 0, void 0, void 0, function* () {
    ConfigManager_1.ConfigManager.UsersCache = new cache.default({ checkperiod: ConfigManager_1.ConfigManager.ChacheUserSaveTimeout, deleteOnExpire: true, useClones: false });
    ConfigManager_1.ConfigManager.RequestsCache = new cache.default({ checkperiod: ConfigManager_1.ConfigManager.ChacheUserSaveTimeout, deleteOnExpire: true, useClones: false });
    ConfigManager_1.ConfigManager.strings = new strings_1.Strings();
    (0, structs_1.getCurrenciesButtons)(ConfigManager_1.ConfigManager.strings.currencies);
    (0, structs_1.getConfirmButtons)(ConfigManager_1.ConfigManager.strings.ButtonTextConfirm, ConfigManager_1.ConfigManager.strings.ButtonTextCancel);
    ConfigManager_1.ConfigManager.converter = new index_1.default();
    yield ConfigManager_1.ConfigManager.converter.ready();
    yield ConfigManager_1.ConfigManager.converter.addCurrency('RUB', 'USD', () => __awaiter(void 0, void 0, void 0, function* () {
        let data = yield Requests_1.requests.request({ host: 'www.cbr-xml-daily.ru', path: '/latest.js', method: 'GET' });
        try {
            let tmp = JSON.parse(data.data);
            let currency = tmp['rates']['USD'];
            return currency;
        }
        catch (ex) {
            Logger_1.Logger.error(logLocation, 'Get currencies failed(RUB)', ex);
        }
        return 0.01110038;
    }));
    yield ConfigManager_1.ConfigManager.converter.addCurrency('BSC', 'USD', () => __awaiter(void 0, void 0, void 0, function* () {
        return 0.0164;
    }));
    yield ConfigManager_1.ConfigManager.converter.addCurrency('AVA', 'USD', () => __awaiter(void 0, void 0, void 0, function* () {
        let data = yield Requests_1.requests.request({ host: 'api.coinbase.com', path: '/v2/prices/ava-USD/buy', method: 'GET' });
        try {
            let tmp = JSON.parse(data.data);
            let currency = tmp['data']['amount'];
            return currency;
        }
        catch (ex) {
            Logger_1.Logger.error(logLocation, `Get currencies failed(AVA)`, ex);
        }
        return 0.6629165979969;
    }));
    yield ConfigManager_1.ConfigManager.converter.SOL;
    let limiter = new RateLimiter_1.RateLimiter();
    ConfigManager_1.ConfigManager.rateLimiter = limiter;
    ConfigManager_1.ConfigManager.billings = new BillingWorker_1.BillingWorker();
    Logger_1.Logger.info(logLocation, 'Starting application');
    Logger_1.Logger.info(logLocation, 'Launching db');
    let db = new SqliteStorage_1.SqliteStorage(dbPath);
    yield db.start();
    ConfigManager_1.ConfigManager.billings.saveMe = db.saveBills.bind(db);
    Logger_1.Logger.info(logLocation, 'Importing data');
    let data = yield db.getConfig();
    for (let x of data) {
        if (x.Key === structs_1.ConfigNames.Admins) {
            ConfigManager_1.ConfigManager.admins = x.Value.split('|');
            Logger_1.Logger.info('startup', 'Admins list initialized');
        }
        else if (x.Key === structs_1.ConfigNames.BotActive) {
            ConfigManager_1.ConfigManager.Active = (x.Value == 'true');
        }
        else if (x.Key.startsWith(structs_1.ConfigNames.Billing)) {
            let currency = x.Key.split('|')[1];
            ConfigManager_1.ConfigManager.billings.importData(currency, x.Value);
            //ConfigManager.billing[currency] = x.Value;
        }
        else if (x.Key === (structs_1.ConfigNames.HelpLink)) {
            ConfigManager_1.ConfigManager.helpLink = x.Value;
        }
    }
    let chats = yield db.getChats();
    for (let x of chats) {
        ConfigManager_1.ConfigManager.chats[x.ID] = x;
        if (x.status == structs_1.ChatStatuses.Active) {
            ConfigManager_1.ConfigManager.activeChat = x.ID;
        }
    }
    Logger_1.Logger.info(logLocation, 'Data imported');
    Logger_1.Logger.info(logLocation, 'Starting bot');
    const client = new telegraf_1.Telegraf(token);
    client.launch();
    let botmenu = new BotMenu_1.BotMenu(client, db);
    Logger_1.Logger.errorLogs.push(botmenu.LogToAdmin);
    Logger_1.Logger.info("Startup", 'Bot is completely active');
});
exports.start = start;
