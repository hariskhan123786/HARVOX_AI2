import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  CreditCard, CheckCircle2, XCircle, Loader2, ImageIcon, X,
  Clock, CheckCheck, AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCard = ({ children, className = '', glow = '#8A2BE2' }) => (
  <div
    className={`relative rounded-2xl border border-white/8 bg-[#07060f]/95 backdrop-blur-xl overflow-hidden ${className}`}
    style={{ boxShadow: `0 0 30px ${glow}15` }}
  >
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${glow}50, transparent)` }} />
    {children}
  </div>
);

const StatusPill = ({ status }) => {
  const cfg = {
    approved: { color: '#34d399', label: 'APPROVED', icon: CheckCheck },
    rejected: { color: '#f87171', label: 'REJECTED', icon: XCircle },
    pending:  { color: '#FFBD2E', label: 'PENDING',  icon: Clock },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <div
      className="inline-flex items-center gap-1.5 text-[8px] font-orbitron font-black px-2 py-1 rounded-lg border tracking-widest"
      style={{ color: c.color, borderColor: `${c.color}30`, background: `${c.color}10` }}
    >
      <c.icon size={9} />
      {c.label}
    </div>
  );
};

export default function AdminPayments() {
  const [payments,     setPayments]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedImg,  setSelectedImg]  = useState(null);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await adminAPI.getPayments();
      setPayments(data.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this payment?`)) return;
    try {
      if (action === 'approve') {
        await adminAPI.approvePayment(id);
      } else {
        const reason = prompt('Reason for rejection:');
        if (reason === null) return;
        await adminAPI.rejectPayment(id, reason);
      }
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const pendingCount  = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
          <p className="text-[9px] font-orbitron font-black tracking-[0.3em] text-neon-blue/50 uppercase">Finance Module</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/25 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <CreditCard size={16} className="text-neon-blue" />
            </div>
            <div>
              <h1 className="font-orbitron text-xl font-black tracking-wider text-white">Payment Approvals</h1>
              <p className="text-[10px] text-gray-600 font-mono">
                <span className="text-yellow-400">{pendingCount}</span> pending · <span className="text-emerald-400">{approvedCount}</span> approved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminCard glow="#00F0FF">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 size={16} className="text-neon-blue animate-spin" />
            <span className="text-xs font-mono text-gray-600">Loading payments...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['User', 'Method & ID', 'Amount', 'Date', 'Proof', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[8px] font-orbitron font-black tracking-[0.2em] text-gray-600 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {payments.map((payment, i) => (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/3 transition-colors duration-200"
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 border border-white/10 flex items-center justify-center font-black text-[10px] text-white shrink-0">
                          {payment.userId?.name?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{payment.userId?.name || 'Unknown'}</p>
                          <p className="text-[9px] font-mono text-gray-600">{payment.userId?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    {/* Method & ID */}
                    <td className="px-5 py-3.5">
                      <p className="text-[10px] font-black uppercase text-gray-300">{payment.method}</p>
                      <p className="text-[9px] font-mono text-gray-600">{payment.transactionId}</p>
                    </td>
                    {/* Amount */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-black text-emerald-400 font-orbitron">Rs. {payment.amount}</p>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-3.5 text-[9px] font-mono text-gray-600 whitespace-nowrap">
                      {format(new Date(payment.date), 'MMM d, yyyy HH:mm')}
                    </td>
                    {/* Proof */}
                    <td className="px-5 py-3.5">
                      {payment.screenshotUrl ? (
                        <button
                          onClick={() => setSelectedImg(`http://localhost:5000/uploads/${payment.screenshotUrl}`)}
                          className="flex items-center gap-1.5 text-neon-blue text-[9px] font-mono hover:text-neon-blue/80 transition-colors border border-neon-blue/20 rounded-lg px-2.5 py-1 bg-neon-blue/5 hover:bg-neon-blue/10"
                        >
                          <ImageIcon size={10} /> View
                        </button>
                      ) : (
                        <span className="text-[9px] text-gray-700 font-mono">—</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusPill status={payment.status} />
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      {payment.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(payment._id, 'approve')}
                            className="w-8 h-8 rounded-lg bg-emerald-500/8 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center"
                            title="Approve"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() => handleAction(payment._id, 'reject')}
                            className="w-8 h-8 rounded-lg bg-rose-500/8 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {payments.length === 0 && !loading && (
              <div className="flex flex-col items-center py-16 gap-3">
                <CreditCard size={32} className="text-gray-700" />
                <p className="text-xs text-gray-600 font-mono">No payment requests found.</p>
              </div>
            )}
          </div>
        )}
      </AdminCard>

      {/* Receipt image modal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => setSelectedImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />
              <img src={selectedImg} alt="Receipt" className="max-w-full max-h-[90vh] object-contain" />
              <button
                onClick={() => setSelectedImg(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/70 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
