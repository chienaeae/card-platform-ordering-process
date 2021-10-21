import {IOrderProcessRepo} from "./interfaces/IOrderProcessRepo";
import {CardPlatformSequel} from "../../../reference/card-platform-library/src/modules/sequlize";
import {Op} from 'sequelize';

export class OrderProcessRepo implements IOrderProcessRepo {
    private readonly cardPlatformSequel?: CardPlatformSequel;

    constructor(config) {
        this.cardPlatformSequel = CardPlatformSequel.create(config);
    }


    /**
     * @param {string} orderId 訂單 ID
     * @param {string} traderId
     * @param {number} cardIndex 訂單購買卡牌 Index
     * @param {number} orderPrice 購買價
     * @returns {Promise<boolean>} 成功與否
     */
    async buyOrderConsume(orderId: string, traderId: string, cardIndex: number, orderPrice: number): Promise<boolean> {
        const found = await this.cardPlatformSequel.models.cardOrderModel.findOne({
            where: {
                order_trader_id: {
                    [Op.not]: traderId
                },
                order_price: {
                    [Op.lte]: orderPrice
                },
                order_type: "sell",
                order_status: 1,
                order_card_index: cardIndex,
            },
            order: [
                ['order_price', 'ASC'],
                ['ordered_time', 'ASC']
            ],
            limit: 1
        })
        return !!found == true
    }

    /**
     *
     * @param {string} orderId 訂單 ID
     * @param {string} traderId
     * @param {number} cardIndex 訂單販售卡牌 Index
     * @param {number} orderPrice 售價
     * @returns {Promise<boolean>} 成功與否
     */
    async sellOrderConsume(orderId: string, traderId: string, cardIndex: number, orderPrice: number): Promise<boolean> {
        const found = await this.cardPlatformSequel.models.cardOrderModel.findOne({
            where: {
                order_trader_id: {
                    [Op.not]: traderId
                },
                order_price: {
                    [Op.gte]: orderPrice
                },
                order_type: "buy",
                order_status: 1,
                order_card_index: cardIndex,
            },
            order: [
                ['order_price', 'DESC'],
                ['ordered_time', 'ASC']
            ],
            limit: 1
        })

        return !!found == true
    }

}