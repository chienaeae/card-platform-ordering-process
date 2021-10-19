import * as dotenv from "dotenv";
import {DevSqsConfig} from "./interfaces/SqsConfig";
dotenv.config();

const sqsConfig: DevSqsConfig = {
    development:{
        queueName: process.env.DEV_QUEUE_NAME,
        queueUrl: process.env.DEV_ORDERING_PROCESS_QUEUE_URL,
        region: process.env.DEV_ORDERING_PROCESS_REGION
    },
    test:{

    },
    production:{

    }

}

export default sqsConfig