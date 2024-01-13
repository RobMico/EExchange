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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteStorage = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const ConfigManager_1 = require("../ConfigManager");
const structs_1 = require("../structs");
const Logger_1 = require("../Bot/utils/Logger");
const all = (db, query) => {
    return new Promise((res, rej) => {
        db.all(query, (err, rows) => {
            if (err) {
                rej(err);
            }
            else {
                res(rows);
            }
        });
    });
};
const exec = (db, query) => {
    return new Promise((res, rej) => {
        db.exec(query, (err) => {
            if (err) {
                rej(err);
            }
            else {
                res(true);
            }
        });
    });
};
const logLocation = 'SqliteStorage';
class SqliteStorage {
    constructor(dbPath) {
        this.dbPath = dbPath;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            Logger_1.Logger.info(logLocation, 'Initializing db');
            this.db = new sqlite3.Database(this.dbPath);
            try {
                yield all(this.db, 'SELECT * FROM Config');
                Logger_1.Logger.info(logLocation, 'DB is initialized');
            }
            catch (ex) {
                if (ex.message.includes('no such table')) {
                    Logger_1.Logger.info(logLocation, 'DB is not initilized');
                    yield exec(this.db, `CREATE TABLE Config (
                    Key TEXT,
                    Value TEXT,
                    PRIMARY KEY(Key)
                )`);
                    yield exec(this.db, `CREATE TABLE Chats (
                    ID TEXT,
                    Title TEXT,
                    status INTEGER,
                    PRIMARY KEY(ID)
                 )`);
                    yield exec(this.db, `CREATE TABLE MessageLog (
                    SenderID TEXT,
                    MessageID TEXT,
                    Text TEXT,
                    Date TEXT,
                    PRIMARY KEY(SenderID, MessageID)
                )`);
                    yield exec(this.db, `INSERT INTO Config(Key, Value) VALUES('${structs_1.ConfigNames.Admins}', '6555436577')`);
                    Logger_1.Logger.info(logLocation, 'DB initialized');
                }
            }
        });
    }
    addGroup(id, title) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec(this.db, `INSERT INTO Chats(ID, Title, status) VALUES('${id}', '${title}', '${structs_1.ChatStatuses.Inactive}')`);
            let chat = new structs_1.ChatData();
            chat.ID = id;
            chat.Title = title;
            chat.status = structs_1.ChatStatuses.Inactive;
            ConfigManager_1.ConfigManager.chats[id] = chat;
        });
    }
    updateGroupStatus(ID, status) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec(this.db, `UPDATE Chats SET status='${status}' WHERE ID='${ID}'`);
            ConfigManager_1.ConfigManager.chats[ID].status = status;
        });
    }
    SaveMessagesLog() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    removeConfig(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec(this.db, `DELETE FROM Config WHERE Key='${key}'`);
        });
    }
    saveConfig(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec(this.db, `INSERT INTO Config(Key, Value) VALUES('${key}', '${value}')ON CONFLICT (Key) DO UPDATE SET Value='${value}'`);
        });
    }
    getConfig(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (key) {
                let tmp = yield all(this.db, `SELECT * FROM Config WHERE Key='${key}'`);
                return tmp;
            }
            else {
                let tmp = yield all(this.db, 'SELECT * FROM Config');
                return tmp;
            }
        });
    }
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            let tmp = yield all(this.db, 'SELECT * FROM Chats');
            let chats = [];
            for (let x of tmp) {
                let chat = new structs_1.ChatData();
                chat.ID = x.ID;
                chat.status = x.status;
                chat.Title = x.Title;
                chats.push(chat);
            }
            return chats;
        });
    }
    saveBills(billing) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = billing.exportData();
            let resolve = [];
            for (let x of data) {
                resolve.push(exec(this.db, `INSERT INTO Config(Key, Value) VALUES('${structs_1.ConfigNames.Billing}|${x[0]}', '${x[1]}')ON CONFLICT (Key) DO UPDATE SET Value='${x[1]}'`));
            }
            let res = yield Promise.allSettled(resolve);
            for (let x of res) {
            }
        });
    }
}
exports.SqliteStorage = SqliteStorage;
