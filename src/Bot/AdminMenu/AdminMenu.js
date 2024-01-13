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
exports.AdminMenu = void 0;
const telegraf_1 = require("telegraf");
const ConfigManager_1 = require("../../ConfigManager");
const structs_1 = require("../../structs");
const AdminStorage_1 = require("./AdminStorage");
var AdminCommands;
(function (AdminCommands) {
    AdminCommands["help"] = "/help";
    AdminCommands["chats"] = "/chats";
    AdminCommands["billings"] = "/billings";
    AdminCommands["toggle"] = "/toggle";
    AdminCommands["BillOnRequest"] = "Bill on request";
    AdminCommands["BillStatic"] = "Static bill";
    AdminCommands["BillPoolNew"] = "Pool of bills";
    AdminCommands["BillPoolAdd"] = "Add bills to pool";
})(AdminCommands || (AdminCommands = {}));
var AdminCallbacks;
(function (AdminCallbacks) {
    AdminCallbacks["chatsCallback"] = "admin_chat_toggle";
    AdminCallbacks["setBilling"] = "set_billing";
    AdminCallbacks["setHelpLink"] = "set_help_link";
})(AdminCallbacks || (AdminCallbacks = {}));
class AdminMenu {
    constructor(client, dataStorage) {
        this.client = client;
        this.dataStorage = dataStorage;
        this.admStorage = new AdminStorage_1.AdminStorage();
    }
    CallbackMenu(event, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.startsWith(AdminCallbacks.chatsCallback)) {
                yield this.callbackChatToggle(event, data);
            }
            else if (data.startsWith(AdminCallbacks.setBilling)) {
                yield this.callbackBilling(event, data);
            }
            else if (data.startsWith(AdminCallbacks.setHelpLink)) {
                yield this.callbackHelpLink(event, data);
            }
        });
    }
    MainMenu(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            if (update && ('message' in update)) {
                if ('text' in update.message) {
                    if (update.message.text == AdminCommands.help) {
                        yield this.CallHelp(event);
                    }
                    else if (update.message.text == AdminCommands.chats) {
                        yield this.CallChats(event);
                    }
                    else if (update.message.text == AdminCommands.toggle) {
                        yield this.callToggle(event);
                    }
                    else if (update.message.text == AdminCommands.billings) {
                        yield this.CallBillings(event);
                    }
                    else if (this.admStorage.awaitingInput) {
                        this.admStorage.awaitingInput = false;
                        yield this.gotInput(event, update.message.text);
                    }
                }
            }
        });
    }
    gotInput(event, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.admStorage.stage == AdminStorage_1.AdminMenuStage.EditBillSelectType) {
                yield this.inputBillingType(event, message);
            }
            else if (this.admStorage.stage == AdminStorage_1.AdminMenuStage.EditBillTypeBill) {
                yield this.inputBilling(event, message);
            }
            else if (this.admStorage.stage == AdminStorage_1.AdminMenuStage.EditHelpLink) {
                yield this.inputHelpLink(event, message);
            }
        });
    }
    inputBillingType(event, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.admStorage.data || typeof this.admStorage.data != 'object' || !('currency' in this.admStorage.data)) {
                return;
            }
            if (message == AdminCommands.BillOnRequest) {
                this.admStorage.stage = AdminStorage_1.AdminMenuStage.Nothing;
                ConfigManager_1.ConfigManager.billings.newBill(this.admStorage.data.currency, structs_1.BillingTypes.ask);
                this.admStorage.data = null;
                return yield event.reply('Done', telegraf_1.Markup.removeKeyboard());
            }
            else if (message == AdminCommands.BillStatic) {
                this.admStorage.stage = AdminStorage_1.AdminMenuStage.EditBillTypeBill;
                this.admStorage.awaitingInput = true;
                this.admStorage.data.billType = structs_1.BillingTypes.static;
                return yield event.reply('Type new bill', telegraf_1.Markup.removeKeyboard());
            }
            else if (message == AdminCommands.BillPoolAdd || message == AdminCommands.BillPoolNew) {
                this.admStorage.stage = AdminStorage_1.AdminMenuStage.EditBillTypeBill;
                this.admStorage.data.billType = structs_1.BillingTypes.pool;
                this.admStorage.awaitingInput = true;
                if (message == AdminCommands.BillPoolAdd) {
                    this.admStorage.data.append = true;
                }
                return yield event.reply('Type new bills(each message - new bill, type `stop` to stop)', telegraf_1.Markup.removeKeyboard());
            }
            else {
                this.admStorage.stage = AdminStorage_1.AdminMenuStage.Nothing;
                return yield event.reply('Editing bill was canceled', telegraf_1.Markup.removeKeyboard());
            }
        });
    }
    inputBilling(event, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.admStorage.data || typeof this.admStorage.data != 'object' || !('currency' in this.admStorage.data)) {
                return;
            }
            if (this.admStorage.data.billType === structs_1.BillingTypes.static) {
                ConfigManager_1.ConfigManager.billings.newBill(this.admStorage.data.currency, this.admStorage.data.billType, message);
                this.admStorage.stage = AdminStorage_1.AdminMenuStage.Nothing;
                this.admStorage.data = null;
                return yield event.reply('DONE');
            }
            else if (this.admStorage.data.billType === structs_1.BillingTypes.pool && message == 'stop') {
                if (!Array.isArray(this.admStorage.data.data)) {
                    this.admStorage.data.data = [];
                }
                if (this.admStorage.data.append) {
                    ConfigManager_1.ConfigManager.billings.pullToPool(this.admStorage.data.currency, this.admStorage.data.data);
                }
                else {
                    ConfigManager_1.ConfigManager.billings.newBill(this.admStorage.data.currency, this.admStorage.data.billType, this.admStorage.data.data);
                }
                this.admStorage.stage = AdminStorage_1.AdminMenuStage.Nothing;
                this.admStorage.data = null;
                return yield event.reply('DONE');
            }
            else if (this.admStorage.data.billType === structs_1.BillingTypes.pool) {
                if (!Array.isArray(this.admStorage.data.data)) {
                    this.admStorage.data.data = [];
                }
                this.admStorage.data.data.push(message);
                this.admStorage.awaitingInput = true;
            }
            return;
        });
    }
    inputHelpLink(event, message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dataStorage.saveConfig(`${structs_1.ConfigNames.HelpLink}`, message);
            ConfigManager_1.ConfigManager.helpLink = message;
            this.admStorage.stage = AdminStorage_1.AdminMenuStage.Nothing;
            this.admStorage.data = null;
            yield event.reply('DONE');
            return;
        });
    }
    callbackHelpLink(event, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.admStorage.awaitingInput = true;
            this.admStorage.stage = AdminStorage_1.AdminMenuStage.EditHelpLink;
            yield event.answerCbQuery();
            yield event.reply(`Type a new help link:`);
        });
    }
    callbackBilling(event, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let currency = data.split('|')[1];
            this.admStorage.data = { currency: currency };
            this.admStorage.stage = AdminStorage_1.AdminMenuStage.EditBillSelectType;
            this.admStorage.awaitingInput = true;
            yield event.answerCbQuery();
            if (ConfigManager_1.ConfigManager.billings.billings[currency] && ConfigManager_1.ConfigManager.billings.billings[currency].type === structs_1.BillingTypes.pool) {
                yield event.reply(`Select billing type for ${currency}:`, telegraf_1.Markup.keyboard([AdminCommands.BillStatic, AdminCommands.BillPoolNew, AdminCommands.BillPoolAdd, AdminCommands.BillOnRequest]));
            }
            else {
                yield event.reply(`Select billing type for ${currency}:`, telegraf_1.Markup.keyboard([AdminCommands.BillStatic, AdminCommands.BillPoolNew, AdminCommands.BillOnRequest]));
            }
        });
    }
    callbackChatToggle(event, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            if (update && ('callback_query' in update)) {
                let chat = data.split('|')[1];
                if (!chat) {
                    return;
                }
                let chatData = ConfigManager_1.ConfigManager.chats[chat];
                if (!chatData) {
                    return;
                }
                if (chatData.status == structs_1.ChatStatuses.Inactive) {
                    if (ConfigManager_1.ConfigManager.activeChat) {
                        yield this.dataStorage.updateGroupStatus(ConfigManager_1.ConfigManager.activeChat, structs_1.ChatStatuses.Inactive);
                    }
                    yield this.dataStorage.updateGroupStatus(chatData.ID, structs_1.ChatStatuses.Active);
                    ConfigManager_1.ConfigManager.activeChat = chatData.ID;
                }
                else if (chatData.status == structs_1.ChatStatuses.Active) {
                    yield this.dataStorage.updateGroupStatus(chatData.ID, structs_1.ChatStatuses.Inactive);
                    ConfigManager_1.ConfigManager.activeChat = null;
                }
                if (update.callback_query.message) {
                    let { message, keyboard } = this.utilsCreateChatsMessage();
                    return yield this.client.telegram.editMessageText(update.callback_query.message.chat.id, update.callback_query.message.message_id, null, message, {
                        reply_markup: {
                            inline_keyboard: keyboard
                        }
                    });
                }
            }
        });
    }
    CallBillings(event) {
        return __awaiter(this, void 0, void 0, function* () {
            let { message, keyboard } = this.utilsCreateBillingMessage();
            return yield event.reply(message, {
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });
        });
    }
    CallHelp(event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield event.reply(ConfigManager_1.ConfigManager.strings.BotAdminHelp);
        });
    }
    CallChats(event) {
        return __awaiter(this, void 0, void 0, function* () {
            let { message, keyboard } = this.utilsCreateChatsMessage();
            return yield event.reply(message, {
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });
        });
    }
    callToggle(event) {
        return __awaiter(this, void 0, void 0, function* () {
            ConfigManager_1.ConfigManager.Active = !ConfigManager_1.ConfigManager.Active;
            yield this.dataStorage.saveConfig(structs_1.ConfigNames.BotActive, ConfigManager_1.ConfigManager.Active.toString());
            if (ConfigManager_1.ConfigManager.Active) {
                return yield event.reply("Now bot is active");
            }
            else {
                return yield event.reply('Now bot is disabled');
            }
        });
    }
    utilsCreateBillingMessage() {
        let message = 'Billings:\n';
        let keyboard = [], rows;
        let counter = 0;
        for (let x of Object.values(ConfigManager_1.ConfigManager.strings.CurrenciesToShort)) {
            if (counter % 4 === 0) {
                rows = [];
                keyboard.push(rows);
            }
            rows.push({ text: `Set ${x}`, callback_data: `admin|${AdminCallbacks.setBilling}|${x}` });
            counter++;
        }
        message += ConfigManager_1.ConfigManager.billings.getStatus();
        return { message: message, keyboard: keyboard };
    }
    utilsCreateChatsMessage() {
        let responce = `Help link:${ConfigManager_1.ConfigManager.helpLink}\nAvaliable chats:\n`;
        let inlineKeyboard = [[{ text: 'Set help link', callback_data: `admin|${AdminCallbacks.setHelpLink}` }]];
        for (let x of Object.keys(ConfigManager_1.ConfigManager.chats)) {
            let chat = ConfigManager_1.ConfigManager.chats[x];
            responce += `${x}|${chat.Title}|${chat.status == structs_1.ChatStatuses.Active ? 'Active' : 'Inactive'}\n`;
            let action = (chat.status == structs_1.ChatStatuses.Active ? 'Disable' : 'Enable');
            inlineKeyboard.push([{ text: `${action} ${x}`, callback_data: `admin|${AdminCallbacks.chatsCallback}|${x}` }]);
        }
        return { message: responce, keyboard: inlineKeyboard };
    }
}
exports.AdminMenu = AdminMenu;
