// Serverless Shared Audit Logger for LinkedUsIn API Endpoints
// Connects to Notion Database "LinkedUsIn: Activity & Audit Log" (ID: 3f201136de48815aa602fdcc23a98b8a)

export const KNOWN_AUDIT_DB_ID = '3f201136de48815aa602fdcc23a98b8a';
export const PARENT_PAGE_ID = '3c701136de48802bba88ede64e4c0cc0'; // LinkedUsIn Hub

/**
 * Log an audit event directly to Notion from any serverless endpoint
 */
export async function logServerAudit({
  apiKey = null,
  event,
  user = 'System',
  email = '',
  role = 'Team Member',
  category = 'System',
  details = '',
  status = 'Success',
  timestamp = null
}) {
  const activeKey = apiKey || process.env.NOTION_API_KEY;
  if (!activeKey) return null;

  try {
    const headers = {
      'Authorization': `Bearer ${activeKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };

    const isoTimestamp = timestamp || new Date().toISOString();
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');

    // Normalize category to allowed Notion select options
    const allowedCategories = ['Auth', 'Content Generation', 'Visual Studio', 'Review Gate', 'Publishing', 'Settings', 'System'];
    const safeCategory = allowedCategories.find(c => c.toLowerCase() === (category || '').toLowerCase()) || 'System';

    // Normalize status to allowed options
    const allowedStatuses = ['Success', 'Warning', 'Error', 'Pending'];
    const safeStatus = allowedStatuses.find(s => s.toLowerCase() === (status || '').toLowerCase()) || 'Success';

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { database_id: KNOWN_AUDIT_DB_ID },
        properties: {
          'Event': {
            title: [{ type: 'text', text: { content: String(event || 'Activity').slice(0, 200) } }]
          },
          'User': {
            rich_text: [{ type: 'text', text: { content: String(user || 'Anonymous').slice(0, 200) } }]
          },
          ...(email ? { 'Email': { email } } : {}),
          'Role': {
            select: { name: role || 'Team Member' }
          },
          'Category': {
            select: { name: safeCategory }
          },
          'Details': {
            rich_text: [{ type: 'text', text: { content: detailsStr.slice(0, 2000) } }]
          },
          'Status': {
            select: { name: safeStatus }
          },
          'Timestamp': {
            date: { start: isoTimestamp }
          }
        }
      })
    });

    if (res.ok) {
      return await res.json();
    } else {
      const err = await res.json();
      console.warn('Audit insert warning:', err.message);
    }
  } catch (err) {
    console.warn('Server audit log notice (silent):', err.message);
  }
  return null;
}
