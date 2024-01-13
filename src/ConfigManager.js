"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const _MenusConnector_1 = require("./Bot/utils/_MenusConnector");
class ConfigManager {
}
exports.ConfigManager = ConfigManager;
ConfigManager.Active = true;
ConfigManager.admins = [];
ConfigManager.chats = [];
ConfigManager.ChacheUserSaveTimeout = 10 * 60;
ConfigManager.helpLink = '';
ConfigManager.connector = new _MenusConnector_1.Connector();
