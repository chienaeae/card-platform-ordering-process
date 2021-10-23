import {OrderingQueuePoller} from "../../reference/card-platform-library/src/modules/sqs/orderingQueueFIFO/OrderingQueuePoller";
import {OrderingMessageProps} from "../../reference/card-platform-library/src/modules/sqs/orderingQueueFIFO/OrderingMessageProps";
import {Message} from "../../reference/card-platform-library/src/modules/sqs/core/infra/BaseQueuePoller";
import {
    MetaConfig,
    QueueConfig
} from "../../reference/card-platform-library/src/modules/sqs/core/infra/BaseQueueClient";
import {IOrderProcessService} from "../../modules/orderProcess/services/interfaces/IOrderProcessService";
import {OrderProcessService} from "../../modules/orderProcess/services/OrderProcessService";
import {IOrderProcessRepo} from "../../modules/orderProcess/repos/interfaces/IOrderProcessRepo";


export class OrderProcessPoller extends OrderingQueuePoller {
    private orderProcessService?: IOrderProcessService;
    public counter = 0

    private constructor(config: QueueConfig & MetaConfig) {
        super(config);
    }

    onError(err) {
        console.log(err)
        console.log('Not yet implement error handling');
    }

    async onMessageHandled(messageBody: OrderingMessageProps, sqsMessage: Message) {
        await this.orderProcessService.processedOrder(messageBody.orderId,1)
    }

    async onMessageProcessed(messageBody: OrderingMessageProps, sqsMessage: Message) {
    }

    async onMessageReceived(messageBody: OrderingMessageProps, sqsMessage: Message) {
    }

    start(): void {
        console.log(`Queue ${this.queueConfig.queueName ? this.queueConfig.queueName : 'unknown'} processor started to listening on ...`)
        this.poller.start()
    }


    public static create(config: QueueConfig & MetaConfig, repo: IOrderProcessRepo): OrderProcessPoller {
        const poller = new OrderProcessPoller(config);
        poller.orderProcessService = new OrderProcessService(repo);
        return poller;
    }
}