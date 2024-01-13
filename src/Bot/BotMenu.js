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
exports.RootPaths = exports.BotMenu = void 0;
const AdminMenu_1 = require("./AdminMenu/AdminMenu");
const ChatMenu_1 = require("./ChatMenu/ChatMenu");
const filters_1 = require("telegraf/filters");
const UserMenu_1 = require("./UserMenu/UserMenu");
const Logger_1 = require("./utils/Logger");
const ConfigManager_1 = require("../ConfigManager");
var RootPaths;
(function (RootPaths) {
    RootPaths["Chat"] = "chat";
    RootPaths["Admin"] = "admin";
    RootPaths["User"] = "user";
})(RootPaths || (exports.RootPaths = RootPaths = {}));
class BotMenu {
    constructor(client, dataStorage) {
        this.client = client;
        this.dataStorage = dataStorage;
        this.adminMenu = new AdminMenu_1.AdminMenu(client, dataStorage);
        this.chatMenu = new ChatMenu_1.ChatMenu(client, dataStorage);
        this.userMenu = new UserMenu_1.UserMenu(client, dataStorage);
        client.on((0, filters_1.message)(), this.newMessage.bind(this));
        client.on('callback_query', this.newCallback.bind(this));
        client.telegram.getMe().then(me => {
            ConfigManager_1.ConfigManager.myID = me.id.toString();
        });
    }
    newCallback(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            try {
                if (update && ('callback_query' in update)) {
                    if ('data' in update.callback_query) {
                        let data = update.callback_query.data;
                        if (data.startsWith(RootPaths.Admin)) {
                            if (ConfigManager_1.ConfigManager.admins.includes(update.callback_query.from.id.toString())) {
                                yield this.adminMenu.CallbackMenu(event, data.replace(`${RootPaths.Admin}|`, ''));
                            }
                            return;
                        }
                        else if (data.startsWith(RootPaths.User)) {
                            yield this.userMenu.CallbackMenu(event, data);
                        }
                        else if (data.startsWith(RootPaths.Chat)) {
                            yield this.chatMenu.CallbackMenu(event, data);
                        }
                    }
                }
            }
            catch (ex) {
                Logger_1.Logger.error('Callback menu', 'newCallback', ex);
            }
        });
    }
    newMessage(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            try {
                if (update && ('message' in update)) {
                    if (update.message.from.id == update.message.chat.id) { //User writen message
                        if (ConfigManager_1.ConfigManager.admins.includes(update.message.from.id.toString())) {
                            yield ConfigManager_1.ConfigManager.rateLimiter.getToken();
                            yield this.adminMenu.MainMenu(event);
                        }
                        else {
                            yield ConfigManager_1.ConfigManager.rateLimiter.getToken();
                            yield this.userMenu.MainMenu(event);
                        }
                    }
                    else if (ConfigManager_1.ConfigManager.Active) { //Message from chat
                        if (ConfigManager_1.ConfigManager.activeChat == update.message.chat.id.toString()) { //if such chat is saved in db
                            yield ConfigManager_1.ConfigManager.rateLimiter.getToken();
                            return yield this.chatMenu.MainMenu(event);
                        }
                        else { //If it is a new chat for this bot - save it
                            if ('title' in update.message.chat) {
                                yield this.dataStorage.addGroup(update.message.chat.id.toString(), update.message.chat.title);
                            }
                            else {
                                yield this.dataStorage.addGroup(update.message.chat.id.toString(), 'null');
                            }
                        }
                    }
                }
            }
            catch (ex) {
                Logger_1.Logger.error('Bot menu', 'newMessage error', ex);
            }
        });
    }
    adminLog(location, message, date, additionalData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (let x of ConfigManager_1.ConfigManager.admins) {
                    yield this.client.telegram.sendMessage(x, `location:${location}\nMessage:${message}\nError:${JSON.stringify(additionalData)}\ndate:${date}`);
                }
            }
            catch (ex) {
                console.log(ex);
            }
        });
    }
    get LogToAdmin() {
        return this.adminLog.bind(this);
    }
}
exports.BotMenu = BotMenu;
