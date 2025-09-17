// src/signature/signature.controller.ts

import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    Res,
    Get,
    Render,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SignatureService } from './signature.service';
import type { Express } from 'express';
import type { Response } from 'express';

@Controller('pdf')
export class SignatureController {
    constructor(private readonly signatureService: SignatureService) { }

    @Post('stamp-sign')
    @UseInterceptors(FileInterceptor('pdf'))
    async stampSignature(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Res() res: Response,
    ) {
        try {
            const { page, x, y, w, h, imageBase64 } = body;

            const stampedPdf = await this.signatureService.stampSignature(file.buffer, {
                page: Number(page),
                x: Number(x),
                y: Number(y),
                w: w ? Number(w) : undefined,
                h: h ? Number(h) : undefined,
                imageBase64,
            });

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=signed.pdf',
            });
            res.send(stampedPdf);
        } catch (err) {
            res.status(500).json({ error: err.message || 'Internal server error' });
        }
    }

    @Get('methodpdf')
    getHelloSigniature(): string {
        return this.signatureService.SignatureHello();
    }

    @Get('view')
    @Render('pdf/view')
    getView() {
      // default signature image (base64)
      const signatureBase64 = 'data:image/png;base64,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';
      return { signatureBase64 };
    }
}
