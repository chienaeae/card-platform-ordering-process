export interface IOrderProcessRepo {
    consumeOrder(orderId: string): Promise<any>

    createOrderingTrade(cardIndex: number, tradePrice: number, buyOrderId: string, sellOrderId: string): Promise<boolean>
}