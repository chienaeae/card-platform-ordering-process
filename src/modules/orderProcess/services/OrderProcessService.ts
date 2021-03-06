import {IOrderProcessService} from "./interfaces/IOrderProcessService";
import {IOrderProcessRepo} from "../repos/interfaces/IOrderProcessRepo";

export class OrderProcessService implements IOrderProcessService {
    private repo?: IOrderProcessRepo;

    constructor(repo: IOrderProcessRepo) {
        this.repo = repo;
    }

    async processedOrder(orderId: string, cardIndex: number): Promise<void> {
        console.log('in')
        const consumedResult = await this.repo.consumeOrder(orderId);
        if(!!consumedResult == true){
            const createdResult = await this.repo.createOrderingTrade(cardIndex,
                consumedResult.consumedPrice,
                consumedResult.buyOrderId,
                consumedResult.sellOrderId);
        }
        console.log('out')
    }
}