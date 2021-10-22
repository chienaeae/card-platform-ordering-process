import {OrderingMessageProps} from "../../../../reference/card-platform-library/src/modules/sqs/orderingQueueFIFO/OrderingMessageProps";
import {FlyingOrder} from "./FlyingOrder";


export interface IOrderProcessService {
    processedOrder(orderId: string, cardIndex: number): Promise<void>;
}