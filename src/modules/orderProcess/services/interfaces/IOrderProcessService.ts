export interface IOrderProcessService {
    processedOrder(orderId: string, cardIndex: number): Promise<void>;
}