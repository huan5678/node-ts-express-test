import { Request, Response } from 'express';
import {v4 as uuidv4} from 'uuid';
import { createLinePayClient } from 'line-pay-merchant';
import crypto from 'crypto';
import axios from 'axios';
import { asyncHandler } from '../middlewares';

declare global {
  export interface ProcessEnv {
    LINE_PAY_CHANNEL_ID: string;
    LINE_PAY_CHANNEL_SECRET: string;
    LINE_PAY_ENV: 'development' | 'production';
    NODE_ENV: 'dev' | 'production';
    NEWEBPAY_MERCHANT_ID: string;
    NEWEBPAY_HASH_KEY: string;
    NEWEBPAY_HASH_IV: string;
  }
}

const linePayConfig = {
  channelId: process.env.LINE_PAY_CHANNEL_ID,
  channelSecretKey: process.env.LINE_PAY_CHANNEL_SECRET,
  env: process.env.LINE_PAY_ENV as 'development' | 'production',
};
const linePay = createLinePayClient(linePayConfig);

interface Order {
  amount: number;
  currency: string;
  packages: Array<{
    id: string;
    amount: number;
    products: Array<{
      name: string;
      imageUrl: string;
      quantity: number;
      price: number;
    }>;
  }>;
}

const orders: Record<string, Order> = {};

export const linePayRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const orderId = uuidv4();
  const confirmUrl = `${
    process.env.NODE_ENV === 'dev'
      ? 'https://127.0.0.1:3000'
      : 'https://node-typescript-linepay-test.onrender.com'
  }/line-pay/confirm`;
  const cancelUrl = 'https://127.0.0.1:3000/line-pay/cancel';
  const order = {
    amount: 1000,
    currency: 'TWD',
    orderId,
    packages: [
      {
        id: 'products_1',
        amount: 1000,
        products: [
          {
            name: 'Test product',
            imageUrl: 'https://source.unsplash.com/random/300x300/?food',
            quantity: 1,
            price: 1000,
          },
        ],
      },
    ],
  };
  orders[orderId] = order;
  const response = await linePay.request.send({
    body: {
      ...order,
      redirectUrls: {
        confirmUrl,
        cancelUrl,
      },
    },
  });
  res.send(response);
});

export const linePayConfirm = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {transactionId, orderId} = req.query as {transactionId: string; orderId: string};
    const {amount, currency} = orders[orderId];
    const response = await linePay.confirm.send({
      transactionId,
      body: {
        amount,
        currency,
      },
    });
    console.log(response);
  res.send(response);
});

export const linePayCheckPaymentStatus = asyncHandler(async (req: Request, res: Response): Promise<void> =>
{
  const response = await linePay.checkPaymentStatus.send({
    transactionId: req.body.transactionId,
    params: {},
  });
  res.send(response);
});

export const linePayPaymentDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {transactionId} = req.body;
    const response = await linePay.paymentDetails.send({
      params: {
        transactionId,
      },
    });
  res.send(response);
});


export const newebPayGetHash = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const merchantId = process.env.NEWEBPAY_MERCHANT_ID;
  const hashKey = process.env.NEWEBPAY_HASH_KEY;
  const hashIV = process.env.NEWEBPAY_HASH_IV;

  const data = {
    MerchantID: merchantId, // 商店代號 必填
    MerchantOrderNo: Date.now().toString(), // 訂單編號 必填
    Amt: `${1000}`, // 訂單金額 必填
    ItemDesc: '商品1,商品2', // 商品資訊 必填 以逗號 (,) 分格, 最多 50 字元
    // RespondType: "JSON", // 回傳格式 非必填 'JSON' | 'String'
    TradeLimit: '900', // 交易限制秒數 非必填 60 - 900 秒
    // ExpireDate: "20200729", // 繳費有效期限 非必填 格式：YYYYMMDD
    ReturnURL: '', // 支付完成返回商店網址 非必填
    NotifyURL: '', // 支付通知網址 非必填
    CustomerURL: '', // 商店取號網址 非必填
    ClientBackURL: '', // 返回商店網址 非必填
    Email: 'test@example.com', // 付款人電子信箱 非必填
    EmailModify: '1', // 付款人電子信箱是否開放修改 非必填 1 | 0
    OrderComment: '訂單訊息', // 商店備註 非必填 最多 300 字元
    Version: '2.0', // 程式版本 非必填
    LangType: 'zh-tw', // 語系 非必填 'zh-tw' | 'en' | 'jp'
    LoginType: '0', // 是否登入藍新金流會員 非必填 1 | 0
    CREDIT: '1', // 信用卡一次付清啟用 非必填 1 | 0
    ANDROIDPAY: '0', // Google Pay 啟用 非必填 1 | 0
    SAMSUNGPAY: '0', // Samsung Pay 啟用 非必填 1 | 0
    LINEPAY: '0', // Line Pay 啟用 非必填 1 | 0
    ImageUrl: '', // Line Pay 產品圖檔連結網址 非必填
    InstFlag: '3,6', // 信用卡分期付款啟用 非必填 '3' | '6' | '12' | '18' | '24' | '30'
    CreditRed: '0', // 信用卡紅利啟用 非必填 1 | 0
    UNIONPAY: '0', // 信用卡銀聯卡啟用 非必填 1 | 0
    WEBATM: '0', // WEBATM 啟用 非必填 1 | 0
    VACC: '1', // ATM 轉帳啟用 非必填 1 | 0
    BankType: '', // 金融機構 非必填
    BARCODE: '0', // 超商條碼繳費啟用 非必填 1 | 0
    ESUNWALLET: '0', // 玉山 Wallet 啟用 非必填 1 | 0
    TAIWANPAY: '0', // 台灣 Pay 啟用 非必填 1 | 0
    CVSCOM: '0', // 物流啟用 非必填 1 | 0
    EZPAY: '0', // 簡單付電子錢包啟用 非必填 1 | 0
    EZPWECHAT: '0', // 簡單付微信支付啟用 非必填 1 | 0
    EZPALIPAY: '0',
  };
  const dataString = new URLSearchParams(data).toString();
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(hashKey), Buffer.from(hashIV));
  let encrypted = cipher.update(dataString, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const hashData = `HashKey=${hashKey}&${encrypted}&HashIV=${hashIV}`;
  const hash = crypto.createHash('sha256').update(hashData).digest('hex').toUpperCase();

  res.send({ hash, encrypted });
});

export const newebPayPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {encrypted, hash} = req.body;
    const response = await axios.post('https://ccore.newebpay.com/MPG/mpg_gateway', {
      TradeInfo: encrypted,
      TradeSha: hash,
      Amt: 1000,
    });
  res.send(response.data);
});