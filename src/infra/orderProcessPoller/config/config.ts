import * as dotenv from "dotenv";
dotenv.config();

export interface SqsConfig{
    region?: string,
    queueUrl?: string,
    queueName?: string
}

export interface DevSqsConfig{
    development: SqsConfig
    test: SqsConfig
    production: SqsConfig
}

const sqsConfig: DevSqsConfig = {
    development:{
        region: process.env.SQS_REGION,
        queueUrl: process.env.DEV_ORDERING_QUEUE_URL,
        queueName: process.env.DEV_ORDERING_QUEUE_NAME,
    },
    test:{
        region: process.env.SQS_REGION,
        queueUrl: process.env.TEST_ORDERING_QUEUE_URL,
        queueName: process.env.TEST_ORDERING_QUEUE_NAME,
    },
    production:{
        region: process.env.SQS_REGION,
        queueUrl: process.env.PROD_ORDERING_QUEUE_URL,
        queueName: process.env.PROD_ORDERING_QUEUE_NAME,
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

export default sqsConfig[process.env.NODE_ENV]