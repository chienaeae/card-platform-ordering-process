import {IOrderProcessService} from "./interfaces/IOrderProcessService";
import {OrderProcessRepo} from "../repos/OrderProcessRepo";
import {FlyingOrder} from "./interfaces/FlyingOrder";

export class OrderProcessService implements IOrderProcessService {

    private repo: OrderProcessRepo;

    async matchedOrder(order: FlyingOrder): Promise<string> {
        let matchedOrderId: string;
        const orderId = order.orderId;
        const traderId = order.traderId;
        const cardIndex = order.cardIndex;
        const orderPrice = order.orderPrice;
        if (order.isSellType) {
            matchedOrderId = await this.repo.sellMatchBuyOrderId(
                orderId,
                traderId,
                cardIndex,
                orderPrice);
        }else{
            matchedOrderId = await this.repo.buyMatchSellOrderId(
                orderId,
                traderId,
                cardIndex,
                orderPrice);
        }
        return matchedOrderId;
    }

    async completedOrders(order: FlyingOrder, matchedOrderId: string): Promise<boolean> {
        if (order.isSellType){
            return await this.repo.completedMatchedOrder(matchedOrderId, order.orderId)
        }else{
            return await this.repo.completedMatchedOrder(order.orderId, matchedOrderId)
        }
    }

    async processedOrder(order: FlyingOrder): Promise<boolean> {
        return await this.repo.processedOrder(order.orderId)
    }

    createOrderTrade(order: FlyingOrder, matchedOrderId: string): Promise<boolean> {
        return Promise.resolve(undefined);
    }
}