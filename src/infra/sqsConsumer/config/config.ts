import * as dotenv from "dotenv";
import {DevSqsConfig, SqsConfig} from "./interfaces/SqsConfig";
dotenv.config();

const sqsConfig: DevSqsConfig = {
    development:{
        queueName: process.env.DEV_QUEUE_NAME,
        queueUrl: process.env.DEV_ORDERING_PROCESS_QUEUE_URL,
        region: process.env.DEV_ORDERING_PROCESS_REGION
    },
    test:{
        queueName: process.env.TEST_QUEUE_NAME,
        queueUrl: process.env.TEST_ORDERING_PROCESS_QUEUE_URL,
        region: process.env.TEST_ORDERING_PROCESS_REGION
    },
    production:{
        queueName: process.env.PROD_QUEUE_NAME,
        queueUrl: process.env.PROD_ORDERING_PROCESS_QUEUE_URL,
        region: process.env.PROD_ORDERING_PROCESS_REGION
    }

}

function checkConfigSetting(config: SqsConfig){
    if(!config.queueUrl || !config.queueName || !config.region){
        const errorMessage =`SQS config not completed!`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}

checkConfigSetting(sqsConfig[process.env.NODE_ENV])

export default sqsConfig