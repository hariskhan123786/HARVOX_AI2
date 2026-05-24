import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import { Shield, UserX, UserCheck, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

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
    } catch (err) {
      console.error(err);
    }
  };

  const updateRole = async (id, role) => {
    try {
      await adminAPI.updateRole(id, role);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Shield className="w-8 h-8 mr-3 text-neon-purple" />
          User Management
        </h1>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 focus:border-neon-purple outline-none text-sm"
          />
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-muted uppercase text-xs">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-muted">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user._id, e.target.value)}
                      className="bg-primary border border-white/10 rounded px-2 py-1 outline-none text-xs"
                      disabled={user.role === 'admin'}
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.subscription === 'pro' ? 'bg-neon-purple/20 text-neon-purple' : 'bg-white/10 text-muted'
                    }`}>
                      {user.subscription.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    {user.isBanned ? (
                      <span className="text-red-400 text-xs flex items-center"><UserX className="w-3 h-3 mr-1"/> Banned</span>
                    ) : (
                      <span className="text-green-400 text-xs flex items-center"><UserCheck className="w-3 h-3 mr-1"/> Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => toggleBan(user._id)}
                        className={`text-xs px-3 py-1 rounded border transition-colors ${
                          user.isBanned 
                            ? 'border-green-500/50 text-green-400 hover:bg-green-500/10' 
                            : 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                        }`}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div className="text-center py-12 text-muted">No users found.</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
