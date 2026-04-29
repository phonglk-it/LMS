import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class MomoService {
  private readonly partnerCode = 'MOMOBKUN20180810';
  private readonly accessKey = '729051229ed79634';
  private readonly secretKey = '8sq779w1vz609316s07316s1vz8sq779';
  private readonly endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';

  async createPayment(courseId: number, userId: number, amount: number) {
    try {
      // 1. Setup Data
      const orderId = `EDURIO-${courseId}-${userId}-${Date.now()}`;
      const requestId = orderId;
      const orderInfo = `Pay for Course ${courseId}`;
      const redirectUrl = `http://localhost:3000/student/courses/${courseId}/lessons`;
      const ipnUrl = 'http://your-domain.com/payments/webhook';      
      const requestType = 'captureWallet';
      const extraData = ''; 

      // 2. Build Raw Signature (Thứ tự Alphabet là bắt buộc)
      const rawSignature = [
        `accessKey=${this.accessKey}`,
        `amount=${amount}`,
        `extraData=${extraData}`,
        `ipnUrl=${ipnUrl}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `partnerCode=${this.partnerCode}`,
        `redirectUrl=${redirectUrl}`,
        `requestId=${requestId}`,
        `requestType=${requestType}`
      ].join('&');

      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(rawSignature)
        .digest('hex');

      // 3. Request Body
      const requestBody = {
        partnerCode: this.partnerCode,
        partnerName: "Edurio LMS",
        storeId: "Edurio_Store",
        requestId,
        amount, // Truyền number trực tiếp cho chuẩn V2
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: 'vi',
      };

      console.log('=== MOMO DEBUG ===');
      console.log('RawSignature:', rawSignature);

      const response = await fetch(this.endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json() as any;

      if (result.resultCode !== 0) {
        console.error('MoMo Error Detail:', result);
        throw new Error(result.message);
      }

      return { payUrl: result.payUrl };

    } catch (error) {
      console.error('Momo Service Error:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}