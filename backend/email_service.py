import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

def send_email(to_email: str, subject: str, html_body: str):
    """Send an email via Gmail SMTP."""
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print("Gmail credentials not configured, skipping email.")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"TaskFlow <{GMAIL_USER}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

def task_created_email(assignee_name: str, assignee_email: str, task_title: str,
                        task_description: str, creator_name: str, due_date: str = None):
    subject = f"📋 New Task Assigned: {task_title}"
    due_str = f"<p><strong>Due Date:</strong> {due_date}</p>" if due_date else ""
    html = f"""
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;">
      <div style="background: #111827; padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">TaskFlow</h1>
        <p style="color: #9ca3af; margin: 8px 0 0;">Task Management</p>
      </div>
      <div style="padding: 32px; background: #fff;">
        <h2 style="color: #111827;">Hi {assignee_name},</h2>
        <p style="color: #374151;">A new task has been assigned to you by <strong>{creator_name}</strong>.</p>
        <div style="background: #f3f4f6; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h3 style="margin: 0 0 8px; color: #111827;">{task_title}</h3>
          <p style="color: #6b7280; margin: 0;">{task_description or 'No description provided.'}</p>
          {due_str}
        </div>
        <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Task →
        </a>
      </div>
      <div style="padding: 16px 32px; background: #f9f9f9; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">TaskFlow · You received this because a task was assigned to you.</p>
      </div>
    </div>
    """
    return send_email(assignee_email, subject, html)

def task_completed_email(creator_name: str, creator_email: str, task_title: str,
                          completer_name: str):
    subject = f"✅ Task Completed: {task_title}"
    html = f"""
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;">
      <div style="background: #111827; padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">TaskFlow</h1>
        <p style="color: #9ca3af; margin: 8px 0 0;">Task Management</p>
      </div>
      <div style="padding: 32px; background: #fff;">
        <h2 style="color: #111827;">Hi {creator_name},</h2>
        <p style="color: #374151;">Great news! A task you created has been marked as <strong>completed</strong>.</p>
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h3 style="margin: 0 0 8px; color: #111827;">✅ {task_title}</h3>
          <p style="color: #6b7280; margin: 0;">Completed by <strong>{completer_name}</strong></p>
        </div>
        <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard"
           style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Dashboard →
        </a>
      </div>
      <div style="padding: 16px 32px; background: #f9f9f9; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">TaskFlow · Task completion notification.</p>
      </div>
    </div>
    """
    return send_email(creator_email, subject, html)
