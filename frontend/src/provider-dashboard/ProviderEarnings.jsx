import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faChartLine, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

export default function ProviderEarnings() {
  const [earnings, setEarnings] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch("http://localhost:8080/provider/bookings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        
        if (data.success) {
          const validBookings = data.result.filter(b => b.status === "confirmed" || b.status === "Completed");
          const totalRevenue = validBookings.reduce((sum, b) => sum + b.amount, 0);
          
          const mappedTxns = data.result.map(b => ({
            id: b.bookingId ? b.bookingId.substring(0,8).toUpperCase() : b._id.substring(0,8),
            date: new Date(b.createdAt).toLocaleDateString(),
            description: `Payment for booking at ${b.listing?.name || 'Service'}`,
            amount: b.status === 'cancelled' ? `$0.00` : `+$${b.amount.toFixed(2)}`,
            status: b.status,
            rawAmount: b.amount
          }));
          
          setEarnings(totalRevenue);
          setTransactions(mappedTxns);
        }
      } catch (err) {
        console.error("Failed to fetch earnings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return <div className="text-gray-500 font-medium">Loading earnings...</div>;
  }

  // Roughly simulate next payout logic
  const nextPayout = earnings > 0 ? (earnings * 0.4).toFixed(2) : "0.00"; 

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Earnings</h1>
          <p className="text-gray-500 mt-1">Track your revenue and transaction history.</p>
        </div>
        <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2 transition-all w-full sm:w-auto">
          <FontAwesomeIcon icon={faDownload} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-2 opacity-80">
               <FontAwesomeIcon icon={faWallet} className="text-xl" />
               <h3 className="font-semibold text-lg">Available Balance</h3>
             </div>
             <h2 className="text-5xl font-bold mb-4">₹{earnings.toLocaleString()}</h2>
             <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-2 rounded-xl font-medium transition-colors backdrop-blur-sm">
               Withdraw Funds
             </button>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 right-10 -mb-10 w-32 h-32 rounded-full bg-blue-400/20 blur-xl"></div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
               <FontAwesomeIcon icon={faChartLine} className="text-xl" />
               <h3 className="font-semibold text-lg">Expected Next Payout</h3>
             </div>
             <h2 className="text-4xl font-bold text-gray-800 mb-2">₹{Number(nextPayout).toLocaleString()}</h2>
             <p className="text-sm text-gray-500 font-medium">Scheduled for end of period</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No transactions recorded.</td></tr>
              ) : (
                transactions.map((txn, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600">{txn.date}</td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-800">{txn.description}</td>
                    <td className={`py-4 px-6 text-sm font-bold ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-gray-400'}`}>
                      {txn.amount.replace('$', '₹')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${txn.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
