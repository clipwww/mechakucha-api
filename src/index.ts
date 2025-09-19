import { Application } from "./application";


const application = new Application();
application.start();
process.on('unhandledRejection', console.dir);


