import {Consumer, SQSMessage} from "sqs-consumer"
import config from "../sqsConsumer/config/config";
import {SqsConfig} from "../sqsConsumer/config/interfaces/SqsConfig";

export class OrderingProcessApp {
    private readonly sqsConfig?: SqsConfig;
    private sqsConsumerApp?: Consumer;

    private constructor() {
        this.sqsConfig = config[process.env.NODE_ENV];
        this.sqsConsumerApp = Consumer.create({
            ...this.sqsConfig,
            async handleMessage(message: SQSMessage): Promise<void> {
                console.log('Not yet implement message handling')
            }
        });

        this.sqsConsumerApp.on('message_received', (message) => {
            // 實作 接收訊息首先 的機制
            console.log('Not yet implement message_received handling');
        });

        this.sqsConsumerApp.on('message_processed', (err) => {
            // 實作 處理完畢 的機制
            console.log('Not yet implement message_processed handling');
        });

        this.sqsConsumerApp.on('stopped', () => {
            // 實作 關閉監聽管道後 的機制
            console.log('Not yet implement consumer stopped handling');
        });

        this.sqsConsumerApp.on('error', (err) => {
            // 實作 錯誤發生時 的機制
            console.log('Not yet implement error handling');
        });

    }

    public static create(): OrderingProcessApp {
        return new OrderingProcessApp();
    }

    public start() {
        console.log(`Queue ${this.sqsConfig.queueName ? this.sqsConfig.queueName : 'unknown'} processor started to listening on ...`)
        this.sqsConsumerApp.start()
    }
}