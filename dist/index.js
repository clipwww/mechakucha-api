"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("./application");
const application = new application_1.Application();
application.start();
process.on('unhandledRejection', console.dir);
//# sourceMappingURL=index.js.map