import { Request, Response } from 'express';
import QRCode from 'qrcode';
import dayjs from 'dayjs';
import {v4 as uuidv4} from 'uuid';
import { asyncHandler } from '../middlewares';

interface QRCodeData {
  id: string;
  seatId: string;
  startedAt: string;
  endedAt: string;
}

const qrCodes: QRCodeData[] = []; //模擬資料庫環境

export const generateQrCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Retrieve data from request body to generate QR code

  // TODO: Implement QR code generation logic here
  const {seatId, startedAt, endedAt} = req.body;
  const seatNumber = seatId;

  // 檢查參數是否合法
  if (
    isNaN(seatNumber) ||
    !dayjs(startedAt as string).isValid() ||
    !dayjs(endedAt as string).isValid() ||
    dayjs(endedAt as string).isBefore(dayjs(startedAt as string))
  ) {
    res.status(400).json({message: 'Invalid parameters'});
    return;
  }

  // 檢查是否已經有 QRCode 了
  const existingQrCode = qrCodes.find(
    (qrCode) =>
      qrCode.seatId === seatNumber &&
      dayjs(qrCode.startedAt).isSame(startedAt as string) &&
      dayjs(qrCode.endedAt).isSame(endedAt as string) &&
      !dayjs(qrCode.endedAt).isBefore(dayjs())
  );
  if (existingQrCode) {
    res.json({
      id: existingQrCode.id,
      dataUrl: `https://www.example.com/qrcodes/${existingQrCode.id}`,
    });
    return;
  }

  const id = uuidv4();
  const qrCodeData = {id, seatId: seatNumber, startedAt, endedAt};

  const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData));
  qrCodes.push(qrCodeData);

  // Send response back to client
  res.status(200).json({message: 'QR code generated successfully', id, dataUrl: qrCodeDataUrl});
});

export const getQrCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const qrCode = qrCodes.find((qrCode) => qrCode.seatId === id);
  if (!qrCode) {
    res.status(404).json({message: 'QR code not found'});
    return;
  }
  const {seatId, startedAt, endedAt} = qrCode;
  const isExpired = dayjs().isAfter(dayjs(endedAt));
  if (isExpired) {
    res.status(400).json({message: 'QR code has expired'});
    return;
  }
  const data = `https://www.example.com/order?tableId=${qrCode.seatId}&startedAt=${qrCode.startedAt}&endedAt=${qrCode.endedAt}`;
  const qrCodeDataUrl = await QRCode.toDataURL(data);
  res.send(`<img src="${qrCodeDataUrl}" />`);
});

