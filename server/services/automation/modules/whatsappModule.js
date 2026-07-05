/**
 * HARVOX Automation Engine — WhatsApp Module
 * Skills: Always confirmation-first. Never auto-sends without user approval.
 */

import { exec } from 'child_process';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';
import { runPS, openWin } from '../../../utils/powershell.js';


// ─── WhatsApp Skills ──────────────────────────────────────────────────────────

/**
 * Open WhatsApp (desktop app or web fallback)
 */
async function openWhatsApp(userId) {
  await new Promise((resolve) => {
    exec(`start whatsapp:`, (err) => {
      if (err) {
        exec(`start "" "https://web.whatsapp.com"`, () => resolve());
      } else {
        resolve();
      }
    });
  });
  await logActivity(userId, 'whatsapp_open', 'Opened WhatsApp');
  return { success: true, message: 'WhatsApp launched.' };
}

/**
 * Open a chat with a specific contact or phone number.
 * This ONLY opens the chat — it does NOT send any message.
 */
async function openWhatsAppChat(userId, args) {
  const contact = args[0] || '';
  const cleanPhone = contact.replace(/\D/g, '');

  let url = '';
  if (cleanPhone && cleanPhone.length >= 7) {
    url = `whatsapp://send?phone=${cleanPhone}`;
  } else {
    url = `https://web.whatsapp.com/search/${encodeURIComponent(contact)}`;
  }

  await new Promise((resolve) => {
    exec(`start "" "${url}"`, (err) => {
      if (err) {
        exec(`start "" "https://web.whatsapp.com"`, () => resolve());
      } else {
        resolve();
      }
    });
  });

  await logActivity(userId, 'whatsapp_open_chat', `Opened WhatsApp chat with "${contact}"`, { contact });
  return { success: true, message: `Opened WhatsApp chat with "${contact}".` };
}

/**
 * Send a WhatsApp message — ALWAYS a sensitive action requiring explicit confirmation.
 * Confirmation is enforced by the TaskPlanWidget (sensitive: true flag).
 * This function is the final execution step only after user clicked Allow.
 */
async function sendWhatsAppMessage(userId, args) {
  let phoneOrContact = '';
  let message = '';

  if (args.length === 1) {
    message = args[0] || '';
  } else {
    phoneOrContact = args[0] || '';
    message = args[1] || '';
  }

  if (!message) throw new Error('Message content is required for WhatsApp send.');

  const cleanPhone = phoneOrContact.replace(/\D/g, '');
  let url = '';

  if (cleanPhone && cleanPhone.length >= 7) {
    // Direct wa.me link — works with both desktop app and web
    url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  } else {
    // Contact name search — opens WhatsApp Web
    url = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  }

  // Open WhatsApp with the prefilled message
  await new Promise((resolve) => exec(`start "" "${url}"`, () => resolve()));

  // PowerShell: wait for WhatsApp to load, then press Enter to send
  const script = [
    '$wshell = New-Object -ComObject wscript.shell',
    'Start-Sleep -Seconds 8',  // WhatsApp Web can be slow to load
    // Try multiple window title patterns used by WhatsApp desktop & web
    '$titles = @("WhatsApp", "web.whatsapp.com", "WhatsApp Web", "WhatsApp - Google Chrome", "WhatsApp - Microsoft Edge", "WhatsApp - Firefox")',
    '$found = $false',
    'foreach ($t in $titles) {',
    '  if ($wshell.AppActivate($t)) { $found = $true; break }',
    '}',
    // If named title not found, try any browser (WhatsApp Web is open in a tab)
    'if (-not $found) {',
    '  $browsers = @("Chrome", "msedge", "Firefox", "Brave")',
    '  foreach ($b in $browsers) {',
    '    if ($wshell.AppActivate($b)) { break }',
    '  }',
    '}',
    'Start-Sleep -Milliseconds 1000',
    // Click Enter to send (WhatsApp send button = Enter)
    '$wshell.SendKeys("{ENTER}")',
    'Start-Sleep -Milliseconds 500',
  ].join('\r\n');

  await runPS(script, 'wasend');

  await logActivity(userId, 'whatsapp_send', `Sent WhatsApp message to "${phoneOrContact}"`, {
    contact: phoneOrContact,
    messageSummary: message.slice(0, 50),
  });

  return {
    success: true,
    message: `✅ WhatsApp message sent to "${phoneOrContact || 'contact'}". Content: "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`,
  };
}



/**
 * Search for a contact in WhatsApp Web
 */
async function searchWhatsAppContact(userId, args) {
  const contact = args[0] || '';
  await new Promise((resolve) => {
    exec(`start "" "https://web.whatsapp.com"`, () => resolve());
  });
  await runPS(`
$wshell = New-Object -ComObject wscript.shell;
Start-Sleep -Seconds 5;
$wshell.AppActivate("WhatsApp");
Start-Sleep -Milliseconds 500;
$wshell.SendKeys("^f");
Start-Sleep -Milliseconds 500;
$text = "${contact.replace(/"/g, '`"')}";
foreach ($c in $text.ToCharArray()) {
  $wshell.SendKeys($c.ToString());
  Start-Sleep -Milliseconds 80;
}
  `);
  await logActivity(userId, 'whatsapp_search', `Searched WhatsApp for contact: "${contact}"`, { contact });
  return { success: true, message: `Searched WhatsApp for "${contact}".` };
}

/**
 * Open unread chats in WhatsApp Web
 */
async function openUnreadChats(userId) {
  await new Promise((resolve) => exec(`start "" "https://web.whatsapp.com"`, () => resolve()));
  await logActivity(userId, 'whatsapp_unread', 'Opened WhatsApp to check unread chats');
  return { success: true, message: 'Opened WhatsApp Web — scroll to see unread chats.' };
}

// ─── Module Registration ──────────────────────────────────────────────────────

registerModule(
  'whatsapp',
  {
    name: 'WhatsApp Automation',
    icon: 'MessageCircle',
    description: 'Open WhatsApp, search contacts, and send messages (always requires confirmation).',
    color: '#25D366',
  },
  [
    { action: 'whatsapp_open',           label: 'Open WhatsApp',             handler: (u) => openWhatsApp(u),                 estimatedMs: 3000, sensitive: false },
    { action: 'whatsapp_open_chat',      label: 'Open Chat with Contact',    handler: (u, a) => openWhatsAppChat(u, a),       estimatedMs: 3000, sensitive: false },
    { action: 'whatsapp_send_message',   label: 'Send WhatsApp Message',     handler: (u, a) => sendWhatsAppMessage(u, a),    estimatedMs: 8000, sensitive: true  },
    { action: 'whatsapp_search_contact', label: 'Search WhatsApp Contact',   handler: (u, a) => searchWhatsAppContact(u, a),  estimatedMs: 6000, sensitive: false },
    { action: 'whatsapp_unread',         label: 'Open Unread Chats',         handler: (u) => openUnreadChats(u),              estimatedMs: 3000, sensitive: false },
  ]
);
