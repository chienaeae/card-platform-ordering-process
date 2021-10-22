export interface IOrderProcessRepo {
    consumeOrder(orderId: string): Promise<any>

    createOrderingTrade(cardIndex: number, buyOrderId: string, sellOrderId: string): Promise<boolean>
}