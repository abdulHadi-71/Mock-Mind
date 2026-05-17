import nodemailer from 'nodemailer';
import { config } from '../config';
import { User, Interview, FeedbackReport, Score } from '../models';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter() {
    if (!config.SMTP_HOST) return null;
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        auth: config.SMTP_USER
          ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
          : undefined,
      });
    }
    return this.transporter;
  }

  async sendInterviewReport(userId: string, interviewId: string): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) {
      console.warn('Email not configured — skipping report email');
      return false;
    }

    const [user, interview, feedback, score] = await Promise.all([
      User.findById(userId),
      Interview.findById(interviewId),
      FeedbackReport.findOne({ interviewId }),
      Score.findOne({ interviewId }),
    ]);

    if (!user || !interview || !feedback) return false;

    await transporter.sendMail({
      from: config.SMTP_FROM,
      to: user.email,
      subject: `Your AIMI Interview Results — ${interview.title}`,
      html: `
        <h2>Interview Complete</h2>
        <p><strong>${interview.title}</strong></p>
        <p>Score: <strong>${score?.overallScore ?? interview.finalScore ?? 'N/A'}/100</strong></p>
        <p>${feedback.summary}</p>
        <h3>Strengths</h3>
        <ul>${feedback.strengths.map((s) => `<li>${s}</li>`).join('')}</ul>
        <h3>Improvements</h3>
        <ul>${feedback.improvements.map((i) => `<li>${i}</li>`).join('')}</ul>
        <p><a href="${config.CLIENT_URL}/results/${interviewId}">View full report</a></p>
      `,
    });
    return true;
  }
}

export const emailService = new EmailService();
