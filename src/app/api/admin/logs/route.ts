import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { adminId, adminEmail, action, targetType, targetId, details, status } = await req.json();

    if (!adminId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const auditRef = await addDoc(collection(db, 'audit_logs'), {
      adminId,
      adminEmail: adminEmail || 'unknown@email.com',
      action,
      targetType: targetType || 'unknown',
      targetId: targetId || null,
      details: details || {},
      status: status || 'success',
      timestamp: Timestamp.now(),
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      logId: auditRef.id,
      message: 'Audit log created'
    });
  } catch (err) {
    console.error('[Audit Log] Error:', err);
    return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('adminId');
    const action = searchParams.get('action');
    const targetType = searchParams.get('targetType');
    const days = parseInt(searchParams.get('days') || '30', 10);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let q: any = query(
      collection(db, 'audit_logs'),
      where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
      orderBy('timestamp', 'desc'),
      limit(500)
    );

    const snapshot = await getDocs(q);
    let logs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.().toISOString() || new Date().toISOString()
      };
    });

    // Client-side filtering
    if (adminId) logs = logs.filter(l => l.adminId === adminId);
    if (action) logs = logs.filter(l => l.action === action);
    if (targetType) logs = logs.filter(l => l.targetType === targetType);

    return NextResponse.json({
      success: true,
      total: logs.length,
      logs,
      dateRange: {
        from: cutoffDate.toISOString(),
        to: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[Audit Query] Error:', err);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (req.method === 'HEAD') {
    // For export CSV
    try {
      const { searchParams } = new URL(req.url);
      const days = parseInt(searchParams.get('days') || '30', 10);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const q = query(
        collection(db, 'audit_logs'),
        where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => doc.data());

      // Generate CSV
      const headers = ['Timestamp', 'Admin', 'Action', 'Target Type', 'Target ID', 'Status'];
      const rows = logs.map(log => [
        new Date(log.timestamp?.toDate?.() || 0).toISOString(),
        log.adminEmail,
        log.action,
        log.targetType,
        log.targetId || 'N/A',
        log.status
      ]);

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename=audit-logs.csv'
        }
      });
    } catch (err) {
      console.error('[Audit Export] Error:', err);
      return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
