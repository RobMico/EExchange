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
exports.UserMenu = void 0;
const telegraf_1 = require("telegraf");
const structs_1 = require("../../structs");
const ConfigManager_1 = require("../../ConfigManager");
const Logger_1 = require("../utils/Logger");
const logLocation = 'user menu';
class UserMenu {
    constructor(client, dataStorage) {
        this.client = client;
        this.dataStorage = dataStorage;
        ConfigManager_1.ConfigManager.connector.gotBillCallback = this.GotExchangeBill.bind(this);
        ConfigManager_1.ConfigManager.UsersCache.on('expired', (key, value) => {
            //if ('type' in value && value.type === UsersCacheTypes.UserData) {
            this.userExpired(key);
            //}
        });
    }
    CallbackMenu(event, data) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    MainMenu(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            if (update && ('message' in update)) {
                let user = ConfigManager_1.ConfigManager.UsersCache.get(update.message.from.id.toString());
                if (!user) {
                    user = new structs_1.UserData();
                    user.Id = update.message.from.id.toString();
                    user.nick = (event.message.from.first_name + ' ' + (event.message.from.last_name || ''));
                    ConfigManager_1.ConfigManager.UsersCache.set(user.Id, user, ConfigManager_1.ConfigManager.ChacheUserSaveTimeout);
                }
                else {
                    if ('text' in update.message && (update.message.text === '/start' || update.message.text === ConfigManager_1.ConfigManager.strings.ButtonRestart)) {
                        user = new structs_1.UserData();
                        user.Id = update.message.from.id.toString();
                        ConfigManager_1.ConfigManager.UsersCache.set(user.Id, user, ConfigManager_1.ConfigManager.ChacheUserSaveTimeout);
                    }
                    else if ('text' in update.message && (update.message.text === ConfigManager_1.ConfigManager.strings.ButtonHelp)) {
                        return yield this.CallHelp(event, user);
                    }
                }
                if (user.InputStage === structs_1.UserInputStages.AwaitingStart) {
                    yield this.CallStart(event, user);
                    ConfigManager_1.ConfigManager.UsersCache.set(user.Id, user, ConfigManager_1.ConfigManager.ChacheUserSaveTimeout);
                }
                else if (user.InputStage === structs_1.UserInputStages.SelectFromCurrency) {
                    yield this.CallCooseFromCurrency(event, user);
                    ConfigManager_1.ConfigManager.UsersCache.set(user.Id, user, ConfigManager_1.ConfigManager.ChacheUserSaveTimeout);
                }
                else if (user.InputStage === structs_1.UserInputStages.SelectToCurrency) {
                    yield this.CallCooseToCurrency(event, user);
                    ConfigManager_1.ConfigManager.UsersCache.set(user.Id, user, ConfigManager_1.ConfigManager.ChacheUserSaveTimeout);
                }
                else if (user.InputStage === structs_1.UserInputStages.SelectSum) {
                    yield this.CallTypeSum(event, user);
                    ConfigManager_1.ConfigManager.UsersCache.set(user.Id, user, ConfigManager_1.ConfigManager.ChacheUserSaveTimeout);
                }
                else if (user.InputStage === structs_1.UserInputStages.SelectBill) {
                    yield this.CallSelectBill(event, user);
                    ConfigManager_1.ConfigManager.UsersCache.set(user.Id, user, ConfigManager_1.ConfigManager.ChacheUserSaveTimeout);
                }
                else if (user.InputStage === structs_1.UserInputStages.Confirm) {
                    yield this.CallConfirm(event, user);
                    ConfigManager_1.ConfigManager.UsersCache.set(user.Id, user, ConfigManager_1.ConfigManager.ChacheUserSaveTimeout);
                }
                else if (user.InputStage === structs_1.UserInputStages.SendCheque) {
                    yield this.CallSendCheque(event, user);
                    ConfigManager_1.ConfigManager.UsersCache.set(user.Id, user, ConfigManager_1.ConfigManager.ChacheUserSaveTimeout);
                }
                else if (user.InputStage === structs_1.UserInputStages.AwaitingExchangeBill) {
                    yield this.CallWhileWaitingBill(event, user);
                }
                if (user.InputStage == structs_1.UserInputStages.Done) {
                    ConfigManager_1.ConfigManager.UsersCache.del(user.Id);
                }
            }
        });
    }
    CallWhileWaitingBill(event, user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.QuestionAwaitBill, user), this.getMarkup(user.InputStage));
        });
    }
    CallStart(event, user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.InputStage++; // = UserInputStages.SelectFromCurrency;
            yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.QuestionGreeting, user), (this.getMarkup(user.InputStage)));
        });
    }
    CallCooseFromCurrency(event, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            if (update && ('message' in update) && ('text' in update.message)) {
                let message = update.message;
                let short = ConfigManager_1.ConfigManager.strings.CurrenciesToShort[message.text];
                if (!short) {
                    return yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.ErrorFalseInput, user));
                }
                user.InputStage++; // = UserInputStages.SelectToCurrency;
                user.fromCurrency = short;
                return yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.QuestionSelectReceivedCurrency, user), this.getMarkup(user.InputStage));
            }
            return yield event.reply(ConfigManager_1.ConfigManager.strings.ErrorUnknown, this.getMarkup(user.InputStage));
        });
    }
    CallCooseToCurrency(event, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            if (update && ('message' in update) && ('text' in update.message)) {
                let message = update.message;
                let short = ConfigManager_1.ConfigManager.strings.CurrenciesToShort[message.text];
                if (!short) {
                    return yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.ErrorFalseInput, user), this.getMarkup(user.InputStage));
                }
                if (short == user.fromCurrency) {
                    return yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.ErrorSameCurrency, user), this.getMarkup(user.InputStage));
                }
                user.InputStage++; // = UserInputStages.SelectSum;
                user.toCurrency = short;
                user.course = ConfigManager_1.ConfigManager.converter[user.fromCurrency][user.toCurrency](1);
                let text = (0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.QuestionTypeSum, user); // .replace('$1', user.fromCurrency).replace('$2', user.course.toString());
                return yield event.reply(text, this.getMarkup(user.InputStage));
            }
            return yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.ErrorUnknown, user), this.getMarkup(user.InputStage));
        });
    }
    CallTypeSum(event, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            if (update && ('message' in update) && ('text' in update.message)) {
                let message = update.message;
                let sum;
                try {
                    sum = parseFloat(message.text);
                }
                catch (ex) {
                    return yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.ErrorSumInput, user));
                }
                user.InputStage++; // = UserInputStages.SelectBill;
                user.sumToExchange = sum;
                let res = ConfigManager_1.ConfigManager.converter[user.fromCurrency][user.toCurrency](user.sumToExchange);
                user.sumToReceive = res;
                let text = (0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.QuestionSelectBill, user);
                //let text = ConfigManager.strings.QuestionConfirm.replace('$1', user.fromCurrency).replace('$2', user.sumToReceive.toString());
                //return await event.reply(text, Markup.keyboard(getConfirmButtons()));
                return yield event.reply(text, this.getMarkup(user.InputStage));
            }
        });
    }
    CallConfirm(event, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            if (update && ('message' in update) && ('text' in update.message)) {
                let message = update.message;
                if (message.text === ConfigManager_1.ConfigManager.strings.ButtonTextConfirm) {
                    user.InputStage = structs_1.UserInputStages.SendCheque;
                    return yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.QuestionCheque, user), this.getMarkup(user.InputStage));
                }
                else if (message.text === ConfigManager_1.ConfigManager.strings.ButtonTextCancel) {
                    user.InputStage++; // = UserInputStages.AwaitingStart;
                    user.fromCurrency = null;
                    user.toCurrency = null;
                    user.sumToExchange = null;
                    user.sumToReceive = null;
                    return yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.QuestionCancelChoose, user), this.getMarkup(user.InputStage));
                }
                else {
                    return yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.ErrorFalseInput, user));
                }
            }
        });
    }
    GotExchangeBill(user, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (user.InputStage === structs_1.UserInputStages.AwaitingExchangeBill) {
                    if (status) {
                        user.InputStage = structs_1.UserInputStages.Confirm;
                        let text = (0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.QuestionConfirmChoose, user);
                        return yield this.client.telegram.sendMessage(user.Id, text, this.getMarkup(user.InputStage));
                    }
                    else {
                        ConfigManager_1.ConfigManager.UsersCache.del(user.Id);
                        return yield this.client.telegram.sendMessage(user.Id, ConfigManager_1.ConfigManager.strings.QuestionDeclined, this.getMarkup(user.InputStage));
                    }
                }
            }
            catch (ex) {
                //Logger.lo
            }
        });
    }
    CallSelectBill(event, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            if (update && ('message' in update) && ('text' in update.message)) {
                let message = update.message;
                //message.text;//validate
                user.bill = message.text;
                user.InputStage++;
                if (!user.exchangeBill) {
                    let bill = ConfigManager_1.ConfigManager.billings.requestBill(user.toCurrency);
                    if (bill) {
                        user.exchangeBill = bill;
                    }
                    else {
                        user.InputStage = structs_1.UserInputStages.AwaitingExchangeBill;
                        ConfigManager_1.ConfigManager.connector.requestBill(user);
                        return yield event.reply((0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.QuestionAwaitBill, user), this.getMarkup(user.InputStage));
                    }
                }
                //user.InputStage++;
                let text = (0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.QuestionConfirmChoose, user);
                return yield event.reply(text, this.getMarkup(user.InputStage));
                //return await event.reply(ConfigManager.strings.)
            }
        });
    }
    CallSendCheque(event, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = event.update;
            if (update && ('message' in update)) {
                //document application/pdf application/pdf image/png image/webp
                //photo
                if (('photo' in update.message) || ('document' in update.message
                    && (update.message.document.mime_type == 'image/webp' ||
                        update.message.document.mime_type == 'image/png' ||
                        update.message.document.mime_type == 'application/pdf'))) {
                    if (ConfigManager_1.ConfigManager.activeChat) {
                        let message = yield event.forwardMessage(ConfigManager_1.ConfigManager.activeChat);
                        let del = ConfigManager_1.ConfigManager.billings.removeBillFromPool(user.toCurrency, user.exchangeBill);
                        let text = (0, structs_1.fillString)(ConfigManager_1.ConfigManager.strings.ChatResultMessage, user);
                        if (del) {
                            text += '\nUsed bill deleted';
                        }
                        yield this.client.telegram.sendMessage(ConfigManager_1.ConfigManager.activeChat, text, { reply_to_message_id: message.message_id });
                        yield event.reply(ConfigManager_1.ConfigManager.strings.QuestionFinishDone);
                        user.InputStage++;
                    }
                }
            }
        });
    }
    CallHelp(event, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield event.reply(ConfigManager_1.ConfigManager.strings.QuestionHelp, { reply_markup: { inline_keyboard: [[{ text: ConfigManager_1.ConfigManager.strings.ButtonHelpDirect, url: ConfigManager_1.ConfigManager.helpLink }]] } }); //([[]]))
        });
    }
    userExpired(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.telegram.sendMessage(chatId, ConfigManager_1.ConfigManager.strings.ErrorTimeout, this.getMarkup(structs_1.UserInputStages.AwaitingStart));
            }
            catch (ex) {
                Logger_1.Logger.error(logLocation, 'Send expire failed', ex);
            }
        });
    }
    getMarkup(stage) {
        if (stage === structs_1.UserInputStages.AwaitingStart) {
            return telegraf_1.Markup.keyboard([ConfigManager_1.ConfigManager.strings.ButtonRestart, ConfigManager_1.ConfigManager.strings.ButtonHelp]).resize(true);
        }
        if (stage === structs_1.UserInputStages.Confirm) {
            let btns = (0, structs_1.getConfirmButtons)();
            //btns.push([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]);
            return telegraf_1.Markup.keyboard(btns).resize(true);
        }
        if (stage === structs_1.UserInputStages.Done) {
            return telegraf_1.Markup.keyboard([ConfigManager_1.ConfigManager.strings.ButtonRestart, ConfigManager_1.ConfigManager.strings.ButtonHelp]).resize(true);
        }
        if (stage === structs_1.UserInputStages.SelectBill) {
            return telegraf_1.Markup.keyboard([ConfigManager_1.ConfigManager.strings.ButtonRestart, ConfigManager_1.ConfigManager.strings.ButtonHelp]).resize(true);
        }
        if (stage === structs_1.UserInputStages.SelectFromCurrency) {
            let btns = (0, structs_1.getCurrenciesButtons)();
            //btns.push([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]);
            return telegraf_1.Markup.keyboard(btns);
        }
        if (stage === structs_1.UserInputStages.SelectSum) {
            return telegraf_1.Markup.keyboard([ConfigManager_1.ConfigManager.strings.ButtonRestart, ConfigManager_1.ConfigManager.strings.ButtonHelp]).resize(true);
        }
        if (stage === structs_1.UserInputStages.SelectToCurrency) {
            let btns = (0, structs_1.getCurrenciesButtons)();
            //btns.push([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]);
            return telegraf_1.Markup.keyboard(btns);
        }
        if (stage === structs_1.UserInputStages.SendCheque) {
            return telegraf_1.Markup.keyboard([ConfigManager_1.ConfigManager.strings.ButtonRestart, ConfigManager_1.ConfigManager.strings.ButtonHelp]).resize(true);
        }
        if (stage === structs_1.UserInputStages.AwaitingExchangeBill) {
            return telegraf_1.Markup.removeKeyboard();
        }
    }
}
exports.UserMenu = UserMenu;
