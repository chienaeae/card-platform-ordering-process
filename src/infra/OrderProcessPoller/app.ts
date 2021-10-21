import {OrderingQueuePoller} from "../../reference/card-platform-library/src/modules/sqs/orderingQueueFIFO/OrderingQueuePoller";
import {OrderingMessageProps} from "../../reference/card-platform-library/src/modules/sqs/orderingQueueFIFO/OrderingMessageProps";
import {Message} from "../../reference/card-platform-library/src/modules/sqs/core/infra/BaseQueuePoller";
import {
    MetaConfig,
    QueueConfig
} from "../../reference/card-platform-library/src/modules/sqs/core/infra/BaseQueueClient";


export class OrderProcessPoller extends OrderingQueuePoller{
    private constructor(config: QueueConfig & MetaConfig) {
        super(config);
    }

    onError(err) {
        console.log(err)
        console.log('Not yet implement error handling');
    }

    onMessageHandled(messageBody: OrderingMessageProps, sqsMessage: Message) {
        console.log('Not yet implement message handling')
    }

    onMessageProcessed(messageBody: OrderingMessageProps, sqsMessage: Message) {
        console.log('Not yet implement message_processed handling');
    }

    onMessageReceived(messageBody: OrderingMessageProps, sqsMessage: Message) {
        console.log('Not yet implement message_received handling');
    }

    start(): void {
        console.log(`Queue ${this.queueConfig.queueName ? this.queueConfig.queueName : 'unknown'} processor started to listening on ...`)
        this.poller.start()
    }


    public static create(config: QueueConfig & MetaConfig): OrderProcessPoller {
        return new OrderProcessPoller(config);
    }
}