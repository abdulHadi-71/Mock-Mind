import { Request, Response } from 'express';
import { pdfService } from '../services/pdf.service';
import { emailService } from '../services/email.service';
import { interviewEngineService } from '../services/interview-engine.service';
import { asyncHandler } from '../utils/asyncHandler';
import { getParam } from '../utils/params';

export const downloadPdf = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req, 'id');
  await interviewEngineService.getResult(req.user!.sub, id);
  const buffer = await pdfService.generateInterviewReport(id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="aimi-report-${id}.pdf"`);
  res.send(buffer);
});

export const emailReport = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req, 'id');
  await interviewEngineService.getResult(req.user!.sub, id);
  const sent = await emailService.sendInterviewReport(req.user!.sub, id);
  res.json({ success: true, data: { sent } });
});
