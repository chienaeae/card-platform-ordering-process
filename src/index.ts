import {OrderProcessPoller} from "./infra/OrderProcessPoller/app";
import sqsConfig from "./infra/OrderProcessPoller/config/config";
import {CardPlatformSequel} from "./reference/card-platform-library/src/modules/sequlize";
import {OrderProcessRepo} from "./modules/orderProcess/repos/OrderProcessRepo";



// autocommit?: boolean;
// isolationLevel?: Transaction.ISOLATION_LEVELS;
// type?: Transaction.TYPES;
// deferrable?: string | Deferrable;
// /**
//  * Parent transaction.
//  */
// transaction?: Transaction | null;


// buy order
// 價錢 取最低
// 訂單時間取最舊
const buyOrderPrice: number = 10
const buyCardIndex: number = 1

new OrderProcessRepo({
    username: 'administrator',
    password: 'Ac9LVYFnCqhG8qpAmMQC',
    host: 'card-platform-testing-mysql.ch3i84eqailq.ap-northeast-1.rds.amazonaws.com',
    database: 'card_platform',
    port: 3306,
}).buyOrderConsume('abc', 'cdv', 15, 10)