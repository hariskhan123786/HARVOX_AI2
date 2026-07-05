/**
 * HARVOX Automation Engine — Email Module
 * Skills: Open Gmail, compose email, generate professional email
 */

import { exec } from 'child_process';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';

function openUrl(url) {
  return new Promise((resolve, reject) =>
    exec(`start "" "${url}"`, (err) => (err ? reject(err) : resolve()))
  );
}

// ─── Email Skills ─────────────────────────────────────────────────────────────

async function openGmail(userId) {
  await openUrl('https://mail.google.com');
  await logActivity(userId, 'email_open_gmail', 'Opened Gmail');
  return { success: true, message: 'Gmail opened in browser.' };
}

async function openGmailCompose(userId) {
  await openUrl('https://mail.google.com/mail/?view=cm&fs=1');
  await logActivity(userId, 'email_compose', 'Opened Gmail compose window');
  return { success: true, message: 'Gmail compose window opened.' };
}

async function composeEmail(userId, args) {
  const to = args[0] || '';
  const subject = args[1] || '';
  const body = args[2] || '';

  const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  await new Promise((resolve) => exec(`start "" "${url}"`, () => resolve()));

  await logActivity(userId, 'email_compose', `Composed email to "${to}"`, { to, subject });
  return { success: true, message: `Email composed to "${to}" with subject "${subject}". Review and send.` };
}

async function openGmailInbox(userId) {
  await openUrl('https://mail.google.com/mail/u/0/#inbox');
  await logActivity(userId, 'email_inbox', 'Opened Gmail inbox');
  return { success: true, message: 'Gmail inbox opened.' };
}

async function openOutlook(userId) {
  await openUrl('https://outlook.live.com/mail/0/inbox');
  await logActivity(userId, 'email_outlook', 'Opened Outlook');
  return { success: true, message: 'Outlook opened in browser.' };
}

async function searchGmail(userId, args) {
  const query = args[0] || '';
  const url = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`;
  await openUrl(url);
  await logActivity(userId, 'email_search', `Searched Gmail for "${query}"`, { query });
  return { success: true, message: `Searched Gmail for "${query}".` };
}

// ─── Module Registration ──────────────────────────────────────────────────────

registerModule(
  'email',
  {
    name: 'Email Automation',
    icon: 'Mail',
    description: 'Open Gmail, compose emails, and manage your inbox.',
    color: '#ea4335',
  },
  [
    { action: 'email_open_gmail',    label: 'Open Gmail',               handler: (u) => openGmail(u),            estimatedMs: 2000 },
    { action: 'email_compose',       label: 'Compose Email',            handler: (u, a) => composeEmail(u, a),   estimatedMs: 2000 },
    { action: 'email_gmail_compose', label: 'Open Gmail Compose',       handler: (u) => openGmailCompose(u),     estimatedMs: 2000 },
    { action: 'email_inbox',         label: 'Open Gmail Inbox',         handler: (u) => openGmailInbox(u),       estimatedMs: 2000 },
    { action: 'email_open_outlook',  label: 'Open Outlook',             handler: (u) => openOutlook(u),          estimatedMs: 2000 },
    { action: 'email_search_gmail',  label: 'Search Gmail',             handler: (u, a) => searchGmail(u, a),    estimatedMs: 2000 },
  ]
);
