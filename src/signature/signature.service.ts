// src/signature/signature.service.ts

import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class SignatureService {
  async stampSignature(
    pdfBuffer: Buffer,
    options: {
      page: number;
      x: number;
      y: number;
      w?: number;
      h?: number;
      imageBase64: string;
    },
  ): Promise<Buffer> {
    const { page, x, y, w, h, imageBase64 } = options;

    const pdfDoc = await PDFDocument.load(pdfBuffer);

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    let embeddedImage: any;
    if (imageBase64.startsWith('data:image/png')) {
      embeddedImage = await pdfDoc.embedPng(imgBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imgBuffer);
    }

    const pages = pdfDoc.getPages();
    if (page < 0 || page >= pages.length) {
      throw new Error('Invalid page index');
    }

    const currentPage = pages[page];

    const imgDims = embeddedImage.scale(1);
    const drawWidth = w || imgDims.width;
    const drawHeight = h || imgDims.height;

    // Konversi koordinat top-left ke bottom-left (PDF)
    const pdfY = currentPage.getHeight() - y - drawHeight;
    const pdfX = x;

    currentPage.drawImage(embeddedImage, {
      x: pdfX,
      y: pdfY,
      width: drawWidth,
      height: drawHeight,
    });

    const newPdfBytes = await pdfDoc.save();
    return Buffer.from(newPdfBytes);
  }

  SignatureHello(): string {
    return 'Hello Signature!';
  }
}
