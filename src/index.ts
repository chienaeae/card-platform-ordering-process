import {OrderProcessPoller} from "./infra/orderProcessPoller/app";
import sqsConfig from "./infra/orderProcessPoller/config/config";
import {OrderProcessRepo} from "./modules/orderProcess/repos/OrderProcessRepo";
import {CardPlatformSequel} from "./reference/card-platform-library/src/modules/sequlize";
import {config} from "./infra/sequelize/config/config";
import {OrderingQueuePoller} from "./reference/card-platform-library/src/modules/sqs/orderingQueueFIFO/OrderingQueuePoller";


export class Launcher {
    public async launchApp() {
        const cardPlatformSequel = CardPlatformSequel.create(
            config, {logging: process.env.NODE_ENV === 'development' ? console.log : false})
        const application = OrderProcessPoller.create(
            sqsConfig,
            new OrderProcessRepo(cardPlatformSequel))

        const sequelizeChecked = await cardPlatformSequel.authConnection()
        const queueCheckedResult = await application.authQueuesStatus()

        if (!queueCheckedResult || !sequelizeChecked) {
            console.log(`application initialized failed`)
            process.exit(1);
        }

        application.start();
    }
}


new Launcher().launchApp();
