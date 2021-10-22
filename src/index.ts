import {OrderProcessPoller} from "./infra/OrderProcessPoller/app";
import sqsConfig from "./infra/OrderProcessPoller/config/config";
import {OrderProcessRepo} from "./modules/orderProcess/repos/OrderProcessRepo";
import {CardPlatformSequel} from "./reference/card-platform-library/src/modules/sequlize";


export class Launcher {
    private application?: OrderProcessPoller;


    public async launchApp() {
        const cardPlatformSequel = CardPlatformSequel.create(
            {
                username: 'administrator',
                password: 'Ac9LVYFnCqhG8qpAmMQC',
                host: 'card-platform-testing-mysql.ch3i84eqailq.ap-northeast-1.rds.amazonaws.com',
                database: 'card_platform',
                port: 3306
            }, {logging: process.env.NODE_ENV === 'development' ? console.log : false})

        const repo = new OrderProcessRepo(cardPlatformSequel)

        this.application = OrderProcessPoller.create(sqsConfig, repo);

        this.application.start()
    }
}


new Launcher().launchApp();
