"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingTypes = exports.fillString = exports.getConfirmButtons = exports.getCurrenciesButtons = exports.CacheTypes = exports.UserInputStages = exports.UserData = exports.ConfigNames = exports.ChatStatuses = exports.ChatData = void 0;
const ConfigManager_1 = require("./ConfigManager");
let currenciesButtons;
const getCurrenciesButtons = (currencies = [], columnsCount = 3) => {
    if (currenciesButtons) {
        return currenciesButtons;
    }
    currenciesButtons = [];
    let currentArr = [];
    for (let i = 0; i < currencies.length; i++) {
        if (i % columnsCount === 0) {
            currentArr = [];
            currenciesButtons.push(currentArr);
        }
        currentArr.push(currencies[i]);
    }
    currenciesButtons.push([ConfigManager_1.ConfigManager.strings.ButtonRestart, ConfigManager_1.ConfigManager.strings.ButtonHelp]);
    return currenciesButtons;
};
exports.getCurrenciesButtons = getCurrenciesButtons;
let confirmButtons;
const getConfirmButtons = (Confirm = null, Cancel = null, vertical = true) => {
    if (confirmButtons) {
        return confirmButtons;
    }
    if (vertical) {
        confirmButtons = [[Confirm], [Cancel]];
    }
    else {
        confirmButtons = [[Confirm, Cancel]];
    }
    confirmButtons.push([ConfigManager_1.ConfigManager.strings.ButtonRestart, ConfigManager_1.ConfigManager.strings.ButtonHelp]);
    return confirmButtons;
};
exports.getConfirmButtons = getConfirmButtons;
var ChatStatuses;
(function (ChatStatuses) {
    ChatStatuses[ChatStatuses["Active"] = 0] = "Active";
    ChatStatuses[ChatStatuses["Inactive"] = 1] = "Inactive";
})(ChatStatuses || (exports.ChatStatuses = ChatStatuses = {}));
class ChatData {
}
exports.ChatData = ChatData;
var BillingTypes;
(function (BillingTypes) {
    BillingTypes[BillingTypes["static"] = 0] = "static";
    BillingTypes[BillingTypes["pool"] = 1] = "pool";
    BillingTypes[BillingTypes["ask"] = 2] = "ask";
})(BillingTypes || (exports.BillingTypes = BillingTypes = {}));
var ConfigNames;
(function (ConfigNames) {
    ConfigNames["Admins"] = "admins";
    ConfigNames["BotActive"] = "botActive";
    ConfigNames["Billing"] = "billing";
    ConfigNames["HelpLink"] = "help_link";
})(ConfigNames || (exports.ConfigNames = ConfigNames = {}));
var UserInputStages;
(function (UserInputStages) {
    UserInputStages[UserInputStages["AwaitingStart"] = 0] = "AwaitingStart";
    UserInputStages[UserInputStages["SelectFromCurrency"] = 1] = "SelectFromCurrency";
    UserInputStages[UserInputStages["SelectToCurrency"] = 2] = "SelectToCurrency";
    UserInputStages[UserInputStages["SelectSum"] = 3] = "SelectSum";
    UserInputStages[UserInputStages["SelectBill"] = 4] = "SelectBill";
    UserInputStages[UserInputStages["Confirm"] = 5] = "Confirm";
    UserInputStages[UserInputStages["SendCheque"] = 6] = "SendCheque";
    UserInputStages[UserInputStages["Done"] = 7] = "Done";
    UserInputStages[UserInputStages["AwaitingExchangeBill"] = 8] = "AwaitingExchangeBill";
})(UserInputStages || (exports.UserInputStages = UserInputStages = {}));
var CacheTypes;
(function (CacheTypes) {
    CacheTypes[CacheTypes["UserData"] = 0] = "UserData";
})(CacheTypes || (exports.CacheTypes = CacheTypes = {}));
class UserData {
    constructor() {
        this.type = CacheTypes.UserData;
        this.InputStage = UserInputStages.AwaitingStart;
    }
}
exports.UserData = UserData;
//$1 - валюта обмена(из какой)
//$2 - валюта зачисления(в какую)
//$3 - Сумма обмена(в валюте обмена)
//$4 - Сумма зачисления(получаемая валюта)
//$5 - обменный курс
//$6 - счет пользователя
//$7 - предоставленый счет
//$8 - ник пользователя
const fillString = (str, userData) => {
    var _a, _b, _c;
    return str.replace(/\$1/g, userData.fromCurrency || '')
        .replace(/\$2/g, userData.toCurrency || '')
        .replace(/\$3/g, ((_a = userData.sumToExchange) === null || _a === void 0 ? void 0 : _a.toString()) || '')
        .replace(/\$4/g, ((_b = userData.sumToReceive) === null || _b === void 0 ? void 0 : _b.toString()) || '')
        .replace(/\$5/g, ((_c = userData.course) === null || _c === void 0 ? void 0 : _c.toString()) || '')
        .replace(/\$6/g, userData.bill)
        .replace(/\$7/g, userData.exchangeBill)
        .replace(/\$8/g, userData.nick || '');
};
exports.fillString = fillString;
