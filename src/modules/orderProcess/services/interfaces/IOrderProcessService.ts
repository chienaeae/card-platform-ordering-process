import {OrderingMessageProps} from "../../../../reference/card-platform-library/src/modules/sqs/orderingQueueFIFO/OrderingMessageProps";
import {FlyingOrder} from "./FlyingOrder";


export interface IOrderProcessService {
    matchedOrder(order: FlyingOrder): Promise<string>;

    processedOrder(order: FlyingOrder): Promise<boolean>

    completedOrders(order: FlyingOrder, matchedOrderId: string): Promise<boolean>;

    createOrderTrade(order: FlyingOrder, matchedOrderId: string): Promise<boolean>;
}