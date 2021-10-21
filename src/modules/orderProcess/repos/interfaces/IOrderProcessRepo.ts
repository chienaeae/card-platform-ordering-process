export interface IOrderProcessRepo {
    buyMatchSellOrderId(orderId: string, traderId: string, cardIndex: number, orderPrice: number): Promise<string>

    sellMatchBuyOrderId(orderId: string, traderId: string, cardIndex: number, orderPrice: number): Promise<string>

    processedOrder(orderId: string): Promise<boolean>;

    completedMatchedOrder(buyOrderId: string, sellOrderId: string): Promise<boolean>
}