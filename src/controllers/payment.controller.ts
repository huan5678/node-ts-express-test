import {asyncHandler} from './../middlewares/index';
import {Request, Response} from 'express';

import {createLinePayClient} from 'line-pay-merchant';
import {ALLPayment, Merchant} from 'node-ecpay-aio';
import {ALLPaymentParams, BasePaymentParams} from 'node-ecpay-aio/dist/types';

import crypto from 'crypto';
import axios from 'axios';

const frontEndHost = process.env.HOST || 'http://localhost:3000';
// const host = 'http://localhost:3000';

const orders = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    status: 'PENDING',
    type: 'DineIn',
    createdAt: '2023-06-05T08:15:30Z',
    updatedAt: '2023-06-05T08:15:30Z',
    parentOrderId: null,
    reservationLogId: null,
    orderMeals: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        mealTitle: '超級漢堡',
        price: 400,
        mealDetails: {
          id: '550e8400-e29b-41d4-a716-446655440010',
          title: '超級漢堡',
          coverUrl: 'https://source.unsplash.com/random/300x300/?food',
          description: '超級美味的漢堡',
          price: 200,
          position: 1,
          isPopular: true,
          publishedAt: '2023-01-01T08:15:30Z',
          createdAt: '2023-01-01T08:15:30Z',
          updatedAt: '2023-06-05T08:15:30Z',
        },
        amount: 2,
        servedAmount: 0,
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        mealId: '550e8400-e29b-41d4-a716-446655440010',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        mealTitle: '炸雞',
        price: 150,
        mealDetails: {
          id: '550e8400-e29b-41d4-a716-446655440010',
          title: '炸雞',
          coverUrl: 'https://source.unsplash.com/random/300x300/?food',
          description: '超級美味的炸雞',
          price: 150,
          position: 1,
          isPopular: true,
          publishedAt: '2023-01-01T08:30:30Z',
          createdAt: '2023-01-01T08:30:30Z',
          updatedAt: '2023-06-05T12:15:30Z',
        },
        amount: 1,
        servedAmount: 0,
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        mealId: '550e8400-e29b-41d4-a716-446655440011',
      },
    ],
    paymentLogs: [
      {
        paymentNo: '123456',
        price: 550,
        gateway: '信用卡',
        status: '已付款',
        createdAt: '2023-06-05T08:20:30Z',
        updatedAt: '2023-06-05T08:20:30Z',
        orderId: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
  },
];

declare global {
  export interface ProcessEnv {
    LINE_PAY_CHANNEL_ID: string;
    LINE_PAY_CHANNEL_SECRET: string;

    NEWEBPAY_MERCHANT_ID: string;
    NEWEBPAY_HASH_KEY: string;
    NEWEBPAY_HASH_IV: string;
  }
}

const linePayConfig = {
  channelId: process.env.LINE_PAY_CHANNEL_ID || '',
  channelSecretKey: process.env.LINE_PAY_CHANNEL_SECRET || '',
  env: process.env.LINE_PAY_ENV as 'development' | 'production',
};
const linePay = createLinePayClient(linePayConfig);

const EcPayConfig = {
  MerchantID: process.env.ECPAY_MERCHANT_ID || '',
  HashKey: process.env.ECPAY_HASH_KEY || '',
  HashIV: process.env.ECPAY_HASH_IV || '',
  ReturnURL: `${frontEndHost}/payments/ec-pay/return`,
  // CallbackURL: `${host}/payments/ec-pay/callback`,
  // OrderResultURL: `${host}/payments/ec-pay/result`,
  ClientBackURL: `http://172.20.48.1:5173/`,
};

const EcPayMerchant = new Merchant('Test', EcPayConfig);

export const linePayRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const confirmUrl = `${
    process.env.NODE_ENV === 'dev' ? 'https://127.0.0.1:3000' : frontEndHost
  }/payments/line-pay/confirm`;
  const cancelUrl = `${frontEndHost}/payments/line-pay/cancel`;

  const {id} = req.params;

  const order = orders.find((order) => order.id === id);
  if (!order) {
    res.status(404);
    res.json({error: 'Order not found'});
    return;
  }
  const amount = order?.orderMeals.reduce((acc, meal) => acc + meal.price, 0) || 0;

  const linePayOrder = {
    amount,
    currency: 'TWD',
    orderId: id,
    packages: order?.orderMeals.map((meal) => ({
      id: meal.mealId,
      amount: meal.price,
      products: [
        {
          name: meal.mealDetails.title,
          imageUrl: meal.mealDetails.coverUrl,
          quantity: meal.amount,
          price: meal.mealDetails.price,
        },
      ],
    })),
  };

  const body = {
    ...linePayOrder,
    redirectUrls: {
      confirmUrl,
      cancelUrl,
    },
  };

  const response = await linePay.request.send({body});
  console.log('linePayRequestResponse:', response);
  res.send(response);
});

export const linePayConfirm = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  console.log('in linePayConfirm');
  const {transactionId, orderId} = req.params;
  const order = orders.find((order) => order.id === orderId);
  const amount = order?.orderMeals.reduce((acc, meal) => acc + meal.price, 0) || 0;
  const response = await linePay.confirm.send({
    transactionId,
    body: {
      amount,
      currency: 'TWD',
    },
  });
  console.log(response);
  res.send(response);
});

export const linePayCheckPaymentStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {transactionId} = req.query;
    const response = await linePay.checkPaymentStatus.send({
      transactionId,
      params: {},
    });
    res.send(response);
  }
);

export const linePayPaymentDetails = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {transactionId} = req.query;

    const response = await linePay.paymentDetails.send({
      params: {
        transactionId,
      },
    });
    res.send(response);
  }
);

export const newebPayGetHash = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const merchantId = process.env.NEWEBPAY_MERCHANT_ID || '';
  const hashKey = process.env.NEWEBPAY_HASH_KEY || '';
  const hashIV = process.env.NEWEBPAY_HASH_IV || '';

  const data = {
    MerchantID: merchantId, // 商店代號 必填
    MerchantOrderNo: Date.now().toString(), // 訂單編號 必填
    Amt: `${1000}`, // 訂單金額 必填
    ItemDesc: '商品1,商品2', // 商品資訊 必填 以逗號 (,) 分格, 最多 50 字元
    // RespondType: "JSON", // 回傳格式 非必填 'JSON' | 'String'
    TradeLimit: '900', // 交易限制秒數 非必填 60 - 900 秒
    // ExpireDate: "20200729", // 繳費有效期限 非必填 格式：YYYYMMDD
    ReturnURL: `${host}/return`, // 支付完成返回商店網址 非必填
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

  res.send({hash, encrypted});
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

export const EcPayPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const formattedDate = now.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const {id} = req.params;

  const order = orders.find((order) => order.id === id);

  const TradeDesc = order?.orderMeals.map((meal) => meal.mealDetails.description).join(',') || '';
  const ItemName = order?.orderMeals.map((meal) => meal.mealDetails.title).join('#') || '';
  const TotalAmount = order?.orderMeals.reduce((acc, meal) => acc + meal.price, 0) || 0;

  const baseParams: BasePaymentParams = {
    MerchantTradeNo: Date.now().toString(),
    MerchantTradeDate: formattedDate,
    TotalAmount,
    TradeDesc,
    ItemName,
    // ReturnURL: undefined,      // 若在 merchant 設定過, 此處不需再設定, 除非你針對此單要用個別的 hook
    // ClientBackURL: undefined,  // 若在 merchant 設定過, 此處不需再設定, 除非你針對此單要用個別的轉導網址
    // OrderResultURL: undefined, // 若在 merchant 設定過, 此處不需再設定, 除非你針對此單要用個別的轉導網址
  };

  const params = {
    // 皆為選填
    // BindingCard: 1, // 記憶信用卡: 1 (記) | 0 (不記)
    // MerchantMemberID: '2000132u001', // 記憶卡片需加註識別碼: MerchantId+廠商會員編號
    // IgnorePayment: ['CVS', 'BARCODE'], // 付款方式: undefined(不忽略) | 'CVS' | 'BARCODE' | ['CVS', 'BARCODE'
    Language: '', // 語系: undefined(繁中) | 'ENG' | 'KOR' | 'JPN' | 'CHI'
    Redeem: 'Y', // 紅利折抵: undefined(不用) | 'Y' (使用)
    UnionPay: 2, // [需申請] 銀聯卡: 0 (可用, default) | 1 (導至銀聯網) | 2 (不可用)
  };

  const payment = EcPayMerchant.createPayment(ALLPayment, baseParams, params as ALLPaymentParams);
  const htmlRedirectPostForm = await payment.checkout(/* 可選填發票 */);

  console.log(payment);

  res.render('checkout', {title: 'checkout', html: htmlRedirectPostForm});
});

export const EcPayPaymentReturn = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    console.log('return req.body:', req.body);
    const {CheckMacValue, TradeNo, MerchantTradeNo, RtnCode, RtnMsg} = req.body;
    res.send('1|OK');
  }
);

export const EcPayPaymentCallback = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    console.log('callback req.body:', req.body);
    res.render('callback', {title: '綠界付款完成', result: JSON.stringify(req.body, null, 2)});
  }
);

export const EcPayPaymentOrderResult = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    console.log('order result req.body:', req.body);
  }
);
