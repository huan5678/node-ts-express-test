import { Router } from "express";


import { chatWithAi } from "../controllers";
import { generateQrCode, getQrCode } from "../controllers";
import {
  linePayRequest,
  linePayConfirm,
  linePayCheckPaymentStatus,
  linePayPaymentDetails,
} from "../controllers";

import {
  newebPayGetHash,
  newebPayPayment,
  EcPayPayment,
  EcPayPaymentReturn,
  EcPayPaymentCallback,
} from '../controllers';

const ApiRouter = Router();

ApiRouter.get('/', (req, res) => {
  const data = '';

  res.render('index', {data});
});
// Payments Routes
ApiRouter.post('/payments/line-pay/request', linePayRequest);
ApiRouter.get('/payments/line-pay/confirm', linePayConfirm);
ApiRouter.post('/payments/line-pay/check-payment', linePayCheckPaymentStatus);
ApiRouter.post('/payments/line-pay/payment-details', linePayPaymentDetails);
ApiRouter.post('/payments/neweb-pay/get-hash', newebPayGetHash);
ApiRouter.post('/payments/neweb-pay/payment', newebPayPayment);
ApiRouter.route('/payments/ec-pay/payment').post(EcPayPayment).get(EcPayPayment);

ApiRouter.post('/payments/ec-pay/return', EcPayPaymentReturn);
ApiRouter.post('/payments/ec-pay/callback', EcPayPaymentCallback);

ApiRouter.post("/payments/checkout", (req, res) => {
  console.log(req.body);
  const html = "";
  res.render("checkout", { html });
});


// QR Code Routes
ApiRouter.post("/qr-codes", generateQrCode);

ApiRouter.get("/qr-codes/:id", getQrCode);



// AI Chatbot Routes
ApiRouter.post("/chatbot", chatWithAi);

export default ApiRouter;


