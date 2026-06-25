import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Shield, UserX, UserCheck, Search, Loader2, Users, ChevronDown } from 'lucide-react';
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

const RoleBadge = ({ role }) => {
  const cfg = {
    admin: { color: '#f87171', label: 'ADMIN' },
    pro:   { color: '#F59E0B', label: 'PRO' },
    free:  { color: '#6b7280', label: 'FREE' },
  };
  const c = cfg[role] || cfg.free;
  return (
    <span
      className="text-[7px] font-orbitron font-black px-1.5 py-0.5 rounded-md border tracking-wider"
      style={{ color: c.color, borderColor: `${c.color}40`, background: `${c.color}12` }}
    >
      {c.label}
    </span>
  );
};

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => { fetchUsers(); }, [search]);

  const fetchUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers({ search, limit: 50 });
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (id) => {
    try {
      const { data } = await adminAPI.toggleBan(id);
      setUsers(users.map(u => u._id === id ? { ...u, isBanned: data.user.isBanned } : u));
    } catch (err) { console.error(err); }
  };

  const updateRole = async (id, role) => {
    try {
      await adminAPI.updateRole(id, role);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse shadow-[0_0_8px_rgba(138,43,226,0.8)]" />
          <p className="text-[9px] font-orbitron font-black tracking-[0.3em] text-neon-purple/50 uppercase">Admin Control</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/25 flex items-center justify-center shadow-[0_0_15px_rgba(138,43,226,0.2)]">
              <Shield size={16} className="text-neon-purple" />
            </div>
            <div>
              <h1 className="font-orbitron text-xl font-black tracking-wider text-white">User Management</h1>
              <p className="text-[10px] text-gray-600 font-mono">{users.length} operators indexed</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search operators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/4 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-gray-300 placeholder:text-gray-700 outline-none focus:border-neon-purple/40 focus:shadow-[0_0_10px_rgba(138,43,226,0.15)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminCard glow="#8A2BE2">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 size={16} className="text-neon-purple animate-spin" />
            <span className="text-xs font-mono text-gray-600">Loading operators...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Operator', 'Role', 'Subscription', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[8px] font-orbitron font-black tracking-[0.2em] text-gray-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {users.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/3 transition-colors duration-200 group"
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 border border-white/10 flex items-center justify-center font-black text-[11px] text-white shrink-0">
                          {user.name?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{user.name}</p>
                          <p className="text-[9px] font-mono text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user._id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 pr-6 outline-none text-[10px] font-mono text-gray-300 appearance-none cursor-pointer hover:border-neon-purple/30 transition-colors"
                          disabled={user.role === 'admin'}
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="admin">Admin</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      </div>
                    </td>
                    {/* Subscription */}
                    <td className="px-5 py-3.5">
                      <RoleBadge role={user.subscription} />
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-3.5 text-[10px] font-mono text-gray-600">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {user.isBanned ? (
                        <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-mono">
                          <UserX size={11} />
                          <span>Banned</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active</span>
                        </div>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleBan(user._id)}
                          className="text-[9px] font-orbitron font-black px-3 py-1.5 rounded-lg border tracking-wider transition-all duration-200"
                          style={user.isBanned ? {
                            borderColor: 'rgba(52,211,153,0.3)',
                            color: '#34d399',
                            background: 'rgba(52,211,153,0.06)',
                          } : {
                            borderColor: 'rgba(248,113,113,0.3)',
                            color: '#f87171',
                            background: 'rgba(248,113,113,0.06)',
                          }}
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && !loading && (
              <div className="flex flex-col items-center py-16 gap-3">
                <Users size={32} className="text-gray-700" />
                <p className="text-xs text-gray-600 font-mono">No operators found.</p>
              </div>
            )}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
