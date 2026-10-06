// Client-side Activity & Audit Logger for LinkedUsIn Studio
// Sends real-time telemetry events to Notion and maintains a local cache

import { safeGetItem, safeSetItem } from './storage.js';

const LOCAL_AUDIT_KEY = 'brother_local_audit_logs';

export function getLocalAuditLogs() {
  try {
    const raw = safeGetItem(LOCAL_AUDIT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveLocalAuditLog(entry) {
  try {
    const existing = getLocalAuditLogs();
    const updated = [entry, ...existing.filter(item => item.id !== entry.id)].slice(0, 100);
    safeSetItem(LOCAL_AUDIT_KEY, JSON.stringify(updated));
  } catch (e) {}
}

/**
 * Log an activity to Notion and local storage
 * @param {Object} options
 * @param {string} options.event - Short action summary (e.g. "User Logged In", "Searched Industry Trends")
 * @param {string} [options.category="System"] - "Auth" | "Content Generation" | "Visual Studio" | "Review Gate" | "Publishing" | "Settings" | "System"
 * @param {string|Object} [options.details=""] - Contextual details or payload summary
 * @param {string} [options.status="Success"] - "Success" | "Warning" | "Error" | "Pending"
 * @param {Object} [options.user=null] - Optional user override { name, email, role }
 */
export async function logActivity({
  event,
  category = 'System',
  details = '',
  status = 'Success',
  user = null
}) {
  try {
    // 1. Resolve user info
    let activeUser = user;
    if (!activeUser) {
      try {
        const stored = safeGetItem('linkedusin_user');
        if (stored) activeUser = JSON.parse(stored);
      } catch (e) {}
    }

    const userName = activeUser?.name || 'Anonymous User';
    const userEmail = activeUser?.email || '';
    const userRole = activeUser?.role || 'Team Member';
    const timestamp = new Date().toISOString();
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');

    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      event,
      user: userName,
      email: userEmail,
      role: userRole,
      category,
      details: detailsStr,
      status,
      timestamp
    };

    // Store in browser for instant offline availability
    saveLocalAuditLog(logEntry);

    // 2. Dispatch to Notion in background
    const notionKey = safeGetItem('notion_token') || safeGetItem('token_notion') || '';
    
    fetch('/api/notion/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'log_audit',
        apiKey: notionKey || undefined,
        event,
        user: userName,
        email: userEmail,
        role: userRole,
        category,
        details: detailsStr,
        status,
        timestamp
      })
    }).catch((err) => {
      console.warn('Silent audit log sync notice:', err.message);
    });

    return logEntry;
  } catch (err) {
    console.warn('Audit logging exception:', err.message);
    return null;
  }
}

/**
 * Fetch live audit logs from Notion
 */
export async function fetchNotionAuditLogs(apiKey) {
  try {
    const activeKey = apiKey || safeGetItem('notion_token') || safeGetItem('token_notion') || '';
    const res = await fetch('/api/notion/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_audit_logs',
        apiKey: activeKey || undefined
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        // Sync fetched logs with local storage cache
        if (data.logs.length > 0) {
          safeSetItem(LOCAL_AUDIT_KEY, JSON.stringify(data.logs.slice(0, 100)));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch Notion audit logs:', err.message);
  }

  // Fallback to local logs
  const localLogs = getLocalAuditLogs();
  return { success: true, logs: localLogs, total: localLogs.length, isLocalFallback: true };
}
