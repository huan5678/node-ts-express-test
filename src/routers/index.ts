import express from 'express';
import { chatWithAi } from '../controllers';
import { generateQrCode, getQrCode } from '../controllers';
import { linePayRequest, linePayConfirm, linePayCheckPaymentStatus, linePayPaymentDetails } from '../controllers';
import { newebPayGetHash, newebPayPayment } from '../controllers';
const router = express.Router();

// index route
router.get('/', (req, res) => {
  const data = '';

  res.render('index', {data});
});

// Payments Routes
router.route('/payments/line-pay/request').post(linePayRequest);
router.route('/payments/line-pay/confirm').get(linePayConfirm);
router.route('/payments/line-pay/check-payment').post(linePayCheckPaymentStatus);
router.route('/payments/line-pay/payment-details').post(linePayPaymentDetails);
router.route('/payments/neweb-pay/get-hash').post(newebPayGetHash);
router.route('/payments/neweb-pay/payment').post(newebPayPayment);

// QR Code Routes
router.route('/qr-codes')
  .post(generateQrCode);

router.route('/qr-codes/:id')
  .get(getQrCode);

// AI Chatbot Routes
router.route('/chatbot').post(chatWithAi);

export default router;
