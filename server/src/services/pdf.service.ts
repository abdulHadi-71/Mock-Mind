import PDFDocument from 'pdfkit';
import { FeedbackReport, Score, Interview, Question, Answer } from '../models';

export class PdfService {
  async generateInterviewReport(interviewId: string): Promise<Buffer> {
    const interview = await Interview.findById(interviewId);
    if (!interview) throw new Error('Interview not found');

    const [feedback, score, questions, answers] = await Promise.all([
      FeedbackReport.findOne({ interviewId }),
      Score.findOne({ interviewId }),
      Question.find({ interviewId }).sort({ order: 1 }),
      Answer.find({ interviewId }),
    ]);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(22).text('AIMI — Interview Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(interview.title);
      doc.fontSize(10).text(`Role: ${interview.role} | Difficulty: ${interview.difficulty} | Type: ${interview.type}`);
      doc.text(`Date: ${interview.completedAt?.toLocaleDateString() ?? 'N/A'}`);
      doc.moveDown();

      if (score) {
        doc.fontSize(16).text(`Overall Score: ${score.overallScore}/${score.maxOverallScore}`);
        doc.moveDown();
      }

      if (feedback) {
        doc.fontSize(14).text('Summary');
        doc.fontSize(10).text(feedback.summary, { align: 'justify' });
        doc.moveDown();

        if (feedback.strengths.length) {
          doc.fontSize(12).text('Strengths');
          feedback.strengths.forEach((s) => doc.fontSize(10).text(`• ${s}`));
          doc.moveDown();
        }

        if (feedback.improvements.length) {
          doc.fontSize(12).text('Areas to Improve');
          feedback.improvements.forEach((i) => doc.fontSize(10).text(`• ${i}`));
          doc.moveDown();
        }
      }

      doc.fontSize(14).text('Q&A Breakdown');
      doc.moveDown(0.5);
      questions.forEach((q, i) => {
        const ans = answers.find((a) => a.questionId.equals(q._id));
        doc.fontSize(11).text(`Q${i + 1}: ${q.text}`);
        doc.fontSize(10).text(`Answer: ${ans?.content ?? '(no answer)'}`);
        if (ans?.score != null) doc.text(`Score: ${ans.score}/100`);
        doc.moveDown(0.5);
      });

      doc.end();
    });
  }
}

export const pdfService = new PdfService();
