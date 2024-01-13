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
exports.ChatMenu = void 0;
const ConfigManager_1 = require("../../ConfigManager");
const structs_1 = require("../../structs");
class ChatMenu {
    constructor(client, dataStorage) {
        this.client = client;
        this.dataStorage = dataStorage;
        ConfigManager_1.ConfigManager.connector.requestBill = this.requestBill.bind(this);
        ConfigManager_1.ConfigManager.RequestsCache.on('expired', (key, value) => {
            //if ('type' in value && value.type === UsersCacheTypes.UserData) {
            console.log('expired key', key);
            //}
        });
    }
    requestBill(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = yield this.client.telegram.sendMessage(ConfigManager_1.ConfigManager.activeChat, (0, structs_1.fillString)(`User $8 requested $1 bill\n Exchange data: 
        Course:1$1=$5$2
        Input sum:$3 $1
        Output sum:$4 $2
        Client billing:$6
        Reply to this message to specify billing(type ~\`cancel\`~ to canel user operation)`, user));
            ConfigManager_1.ConfigManager.RequestsCache.set(message.message_id, user);
        });
    }
    CallbackMenu(event, data) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    MainMenu(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if ('reply_to_message' in event.message && 'text' in event.message) {
                if (event.message.reply_to_message.from.id.toString() == ConfigManager_1.ConfigManager.myID) {
                    let tmp = ConfigManager_1.ConfigManager.RequestsCache.get(event.message.reply_to_message.message_id);
                    if (tmp) {
                        tmp.exchangeBill = event.message.text;
                        ConfigManager_1.ConfigManager.connector.gotBillCallback(tmp, event.message.text != 'cancel');
                        ConfigManager_1.ConfigManager.RequestsCache.del(event.message.reply_to_message.message_id);
                    }
                }
            }
        });
    }
    sendToChat() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    BanUserCallback(event, data) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    ConfirmUserCallback(event, data) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.ChatMenu = ChatMenu;
