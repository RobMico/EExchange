"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMenuStage = exports.AdminStorage = void 0;
var AdminMenuStage;
(function (AdminMenuStage) {
    AdminMenuStage[AdminMenuStage["Nothing"] = 0] = "Nothing";
    AdminMenuStage[AdminMenuStage["Menu"] = 1] = "Menu";
    AdminMenuStage[AdminMenuStage["EditHelpLink"] = 2] = "EditHelpLink";
    AdminMenuStage[AdminMenuStage["EditBills"] = 3] = "EditBills";
    AdminMenuStage[AdminMenuStage["EditBillSelectType"] = 4] = "EditBillSelectType";
    AdminMenuStage[AdminMenuStage["EditBillTypeBill"] = 5] = "EditBillTypeBill";
})(AdminMenuStage || (exports.AdminMenuStage = AdminMenuStage = {}));
class InputBillData {
}
class AdminStorage {
    constructor() {
        this.stage = AdminMenuStage.Nothing;
        this.awaitingInput = false;
    }
}
exports.AdminStorage = AdminStorage;
