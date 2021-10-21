import {IOrderProcessRepo} from "./interfaces/IOrderProcessRepo";
import {CardPlatformSequel} from "../../../reference/card-platform-library/src/modules/sequlize";
import {Op, Transaction} from 'sequelize';

export class OrderProcessRepo implements IOrderProcessRepo {
    private readonly cardPlatformSequel?: CardPlatformSequel;

    constructor(config) {
        this.cardPlatformSequel = CardPlatformSequel.create(config, {logging: console.log});
    }

    /**
     * 配對 買方訂單
     * @param {string} orderId 訂單 ID
     * @param {string} traderId 交易人ID
     * @param {number} cardIndex 訂單購買卡牌 Index
     * @param {number} orderPrice 購買價
     * @returns {Promise<boolean>} 成功與否
     */
    async buyMatchSellOrderId(orderId: string, traderId: string, cardIndex: number, orderPrice: number): Promise<string> {
        const found = await this.cardPlatformSequel.models.cardOrderModel.findOne({
            where: {
                order_trader_id: {
                    [Op.not]: traderId
                },
                order_price: {
                    [Op.lte]: orderPrice
                },
                order_type: "sell",
                order_status: "processed",
                order_card_index: cardIndex,
            },
            order: [
                ['order_price', 'ASC'],
                ['ordered_time', 'ASC']
            ],
            limit: 1,
            attributes: ['order_id']
        })
        if (!!found == false) return null
        return found.order_id
    }

    /**
     * 配對 賣方訂單
     * @param {string} orderId 訂單 ID
     * @param {string} traderId 交易人ID
     * @param {number} cardIndex 訂單販售卡牌 Index
     * @param {number} orderPrice 售價
     * @returns {Promise<boolean>} 成功與否
     */
    async sellMatchBuyOrderId(orderId: string, traderId: string, cardIndex: number, orderPrice: number): Promise<string> {
        const found = await this.cardPlatformSequel.models.cardOrderModel.findOne({
            where: {
                order_trader_id: {
                    [Op.not]: traderId
                },
                order_price: {
                    [Op.gte]: orderPrice
                },
                order_type: "buy",
                order_status: "processed",
                order_card_index: cardIndex,
            },
            order: [
                ['order_price', 'DESC'],
                ['ordered_time', 'ASC']
            ],
            limit: 1
        })
        if (!!found == false) return null
        return found.order_id
    }


    /**
     * 處理訂單，將 訂單 Id 改為已處理狀態 (改變訂單狀態，從 idle 改為 processed)
     * @param {string} orderId 欲處理的訂單 Id
     * @returns {Promise<boolean>} 結果是否成功
     */
    async processedOrder(orderId: string) : Promise<boolean>{
        const trans = await this.cardPlatformSequel.sequelInstance.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        })
        const result = await this.cardPlatformSequel.models.cardOrderModel.update(
            {order_status: 'processed'},
            {
                where: {
                    order_id: orderId,
                    order_status: 'idle'
                },
                transaction: trans
            })
        if (result.pop() !== 1) {
            console.log(`processed failed!`)
            await trans.rollback();
            return false;
        } else {
            await trans.commit();
            return true;
        }
    }

    /**
     * 處理訂單，將 買入 與 賣出訂單 進行配對，將訂單改為已解決 (改變訂單狀態，從 idle、processed 改為 completed)
     * @param {string} buyOrderId 買入訂單 Id
     * @param {string} sellOrderId 賣出訂單 Id
     * @returns {Promise<boolean>} 結果是否成功
     */
    async completedMatchedOrder(buyOrderId: string, sellOrderId: string): Promise<boolean> {
        const trans = await this.cardPlatformSequel.sequelInstance.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        });
        const result = await this.cardPlatformSequel.models.cardOrderModel.update(
            {order_status: 'completed'},
            {
                where: {
                    order_status: {
                        [Op.in]: ['idle', 'processed']
                    },
                    [Op.or]:
                        [
                            {
                                order_id: sellOrderId,
                                order_type: 'sell'
                            },
                            {
                                order_id: buyOrderId,
                                order_type: 'buy'
                            }
                        ]
                },
                transaction: trans
            });
        console.log(result)
        if (result.pop() !== 2) {
            console.log(`matched failed!`)
            await trans.rollback();
            return false;
        } else {
            await trans.commit();
            return true;
        }
    }
}