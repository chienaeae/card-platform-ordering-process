export interface IOrderProcessRepo {
    buyOrderConsume(orderId: string, traderId: string, cardIndex: number, orderPrice: number): Promise<boolean>

    sellOrderConsume(orderId: string, traderId: string, cardIndex: number, orderPrice: number): Promise<boolean>
}