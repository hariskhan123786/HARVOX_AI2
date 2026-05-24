import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <CreditCard className="w-8 h-8 mr-3 text-neon-blue" />
        <h1 className="text-3xl font-bold">Payment Approvals</h1>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-muted uppercase text-xs">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Method & ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Proof</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{payment.userId?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted">{payment.userId?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium uppercase">{payment.method}</div>
                    <div className="text-xs text-muted font-mono">{payment.transactionId}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">Rs. {payment.amount}</td>
                  <td className="px-6 py-4 text-muted">
                    {format(new Date(payment.date), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    {payment.screenshotUrl ? (
                      <button 
                        onClick={() => setSelectedImg(`http://localhost:5000/uploads/${payment.screenshotUrl}`)}
                        className="text-neon-blue text-xs hover:underline"
                      >
                        View Receipt
                      </button>
                    ) : 'No Image'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      payment.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      payment.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {payment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button onClick={() => handleAction(payment._id, 'approve')} className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction(payment._id, 'reject')} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && !loading && (
            <div className="text-center py-12 text-muted">No payment requests found.</div>
          )}
        </div>
      </GlassCard>

      {/* Image Modal */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-xl border border-white/10" onClick={e => e.stopPropagation()}>
            <img src={selectedImg} alt="Receipt" className="max-w-full max-h-[90vh] object-contain" />
            <button onClick={() => setSelectedImg(null)} className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white hover:bg-black/80">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
