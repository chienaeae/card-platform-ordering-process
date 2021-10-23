import {IOrderProcessRepo} from "./interfaces/IOrderProcessRepo";
import {CardPlatformSequel} from "../../../reference/card-platform-library/src/modules/sequlize";
import {Op, Transaction} from 'sequelize';
import {v4 as uuid} from 'uuid';
import {CardOrder} from "../../../reference/card-platform-library/src/modules/sequlize/models/cardOrdering/CardOrder.model";

export interface ConsumeResult {
    consumedPrice: number,
    buyOrderId: string,
    sellOrderId: string
}

export class OrderProcessRepo implements IOrderProcessRepo {
    private readonly cardPlatformSequel?: CardPlatformSequel;

    constructor(cardPlatformSequel: CardPlatformSequel) {
        this.cardPlatformSequel = cardPlatformSequel
    }

    /**
     * 訂單處理
     * (Step1.)
     *  取得訂單
     * (Step2.)
     *  媒合對應訂單
     * (Step3.)
     *  若有媒合到訂單，則兩兩設定為已完成訂單；
     *  若沒有媒合到訂單，則設定為已處理訂單。
     * @param {string} orderId
     * @returns {Promise<boolean>}
     */
    async consumeOrder(orderId: string): Promise<ConsumeResult | null> {
        const orderInstance = await this.getIdleOrderPhase(orderId);
        if (!!orderInstance == false) {
            // trans.commit();
            return null
        }
        const traderId = orderInstance.order_trader_id;
        const cardIndex = orderInstance.order_card_index;
        const orderPrice = orderInstance.order_price;
        const trans = await this.cardPlatformSequel.sequelInstance.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        });
        if (orderInstance.order_type == 'sell') {
            return await this.consumeSellOrder(orderId, traderId, cardIndex, orderPrice, trans);
        } else {
            return await this.consumeBuyOrder(orderId, traderId, cardIndex, orderPrice, trans);
        }
    }

    /**
     * 處理 買方訂單
     * @param {string} orderId 訂單 ID
     * @param {string} traderId 交易人ID
     * @param {number} cardIndex 訂單購買卡牌 Index
     * @param {number} orderPrice 購買價
     * @param trans
     * @returns {Promise<boolean>} 成功與否
     */
    private async consumeBuyOrder(orderId: string, traderId: string, cardIndex: number, orderPrice: number, trans: Transaction): Promise<ConsumeResult | null> {
        /**
         * 從買方訂單中 取得配對的賣方訂單
         * @type {any}
         */
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
            attributes: ['order_id', 'order_price'],
            transaction: trans
        })
        /**
         * 若 並未取得賣方訂單，則將買方訂單改為已處理
         * (改變訂單狀態，從 idle 改為 processed)
         * @type {any}
         */
        if (!!found == false) {
            const processedResult = await this.processedOrderPhase(orderId, trans);
            return null;
        }
        /**
         *  若 取得賣方訂單，將 買入 與 賣出訂單 進行配對，將兩者訂單改為已解決
         *  (改變訂單狀態，從 idle、processed 改為 completed)
         */
        else {
            const matchedResult = await this.completedMatchedOrderPhase(orderId, found.order_id, trans);
            if (!!matchedResult == false) return null;
            return {
                consumedPrice: found.order_price,
                buyOrderId: orderId,
                sellOrderId: found.order_id
            }
        }
    }

    /**
     * 處理 賣方訂單
     * @param {string} orderId 訂單 ID
     * @param {string} traderId 交易人ID
     * @param {number} cardIndex 訂單販售卡牌 Index
     * @param {number} orderPrice 售價
     * @param trans
     * @returns {Promise<boolean>} 成功與否
     */
    private async consumeSellOrder(orderId: string, traderId: string, cardIndex: number, orderPrice: number, trans: Transaction): Promise<ConsumeResult | null> {
        /**
         * 從賣方訂單中 取得配對的買方訂單
         * @type {any}
         */
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
            limit: 1,
            attributes: ['order_id', 'order_price'],
            transaction: trans
        })
        /**
         * 若 並未取得賣方訂單，則將買方訂單改為已處理
         * (改變訂單狀態，從 idle 改為 processed)
         * @type {any}
         */
        if (!!found == false) {
            const processedResult = await this.processedOrderPhase(orderId, trans);
            return null;
        }
        /**
         *  若 取得賣方訂單，將 買入 與 賣出訂單 進行配對，將兩者訂單改為已解決
         *  (改變訂單狀態，從 idle、processed 改為 completed)
         */
        else {
            const matchedResult = await this.completedMatchedOrderPhase(found.order_id, orderId, trans);
            if (!!matchedResult == false) return null;
            return {
                consumedPrice: found.order_price,
                buyOrderId: found.order_id,
                sellOrderId: orderId
            }
        }
    }

    /**
     * 取得 待處理訂單
     * @param {string} orderId 欲處理的訂單 Id
     * @returns {Promise<any>}
     * @private
     */
    private async getIdleOrderPhase(orderId: string): Promise<CardOrder> {
        const orderInstance = await this.cardPlatformSequel.models.cardOrderModel.findOne({
            where: {
                order_id: orderId,
                order_status: 'idle'
            }
        });
        if (!!orderInstance == false) {
            return null
        }
        return orderInstance
    }

    /**
     * 處理訂單，將 訂單 Id 改為已處理狀態 (改變訂單狀態，從 idle 改為 processed)
     * @param {string} orderId 欲處理的訂單 Id
     * @param trans parent Transaction
     * @returns {Promise<boolean>} 結果是否成功
     */
    private async processedOrderPhase(orderId: string, trans: Transaction): Promise<boolean> {
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
        }
        await trans.commit();
        return true;
    }

    /**
     * 處理訂單，將 買入 與 賣出訂單 進行配對，將訂單改為已解決 (改變訂單狀態，從 idle、processed 改為 completed)
     * @param {string} buyOrderId 買入訂單 Id
     * @param {string} sellOrderId 賣出訂單 Id
     * @param trans  parent Transaction
     * @returns {Promise<boolean>} 結果是否成功
     */
    private async completedMatchedOrderPhase(buyOrderId: string, sellOrderId: string, trans: Transaction): Promise<boolean> {
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
        if (result.pop() !== 2) {
            console.log(`matched failed!`)
            await trans.rollback();
            return false;
        }
        await trans.commit();
        return true;
    }

    /**
     * 產生 完成交易結果
     *  (Step1.)
     *      確認 buyOrder 和 sellOrder 正確無誤
     *  (Step2.)
     *      產生交易結果
     * @param cardIndex 買賣卡片 index
     * @param tradePrice 成交價
     * @param {string} buyOrderId 買方訂單 ID
     * @param {string} sellOrderId 賣方訂單 ID
     * @returns {Promise<boolean>}
     */
    async createOrderingTrade(cardIndex, tradePrice: number, buyOrderId: string, sellOrderId: string): Promise<boolean> {
        const foundCount = await this.cardPlatformSequel.models.cardOrderModel.count({
            where: {
                [Op.or]:
                    [
                        {
                            order_id: sellOrderId,
                            order_type: 'sell',
                            order_status: 'completed'
                        },
                        {
                            order_id: buyOrderId,
                            order_type: 'buy',
                            order_status: 'completed'
                        }
                    ]
            }
        })
        if (foundCount == 2) {
            const newOrderingTrade = await this.cardPlatformSequel.models.cardTradeModel.create({
                trade_id: uuid(),
                trade_price: tradePrice,
                trade_card_index: cardIndex,
                buy_order_id: buyOrderId,
                sell_order_id: sellOrderId
            })
            return !!newOrderingTrade
        }
        return false
    }

}