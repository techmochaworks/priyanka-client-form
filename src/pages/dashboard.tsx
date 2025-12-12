import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/authcontext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  Loader2, LogOut, CreditCard, Home, FileText, User, 
  Plus, ChevronRight, CheckCircle, 
  ArrowUpRight, ArrowDownLeft, AlertCircle
} from 'lucide-react';

// --- Interfaces ---
interface CreditCard {
  bankName: string;
  cardHolderName: string;
  cardHolderMobile: string;
  cardNumber: string;
  cardLimit: number;
  expiryDate: string;
  billGenerationDate: string;
  cardDueDate: string;
  cardType?: string;
  cvv?: string;
}

interface Client {
  id: string;
  clientId: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  creditCards: CreditCard[];
  distributorId: string;
}

interface Bill {
  id: string;
  clientId: string;
  clientName: string;
  selectedCard: CreditCard;
  totalBillPayment: number;
  totalWithdrawal: number;
  billPayments: number[];
  withdrawals: number[];
  status: string;
  createdAt: any;
  finalAmountForClient: number;
  interestAmount: number;
  clientRate: number;
  gatewayRate: number;
  profitMargin: number;
}

// --- Helper Components ---

const CardVisual = ({ card, colorClass, maskFunc }: { card: CreditCard, colorClass: string, maskFunc: (s: string) => string }) => (
  <div className={`bg-gradient-to-br ${colorClass} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden h-48 flex flex-col justify-between`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
    <div className="flex justify-between items-start z-10">
      <div>
        <p className="text-[10px] opacity-80 tracking-widest uppercase">Bank Name</p>
        <p className="font-bold text-lg tracking-wide">{card.bankName}</p>
      </div>
      <CreditCard className="w-6 h-6 opacity-80" />
    </div>
    <div className="z-10">
      <p className="text-2xl font-mono tracking-wider mb-4">{maskFunc(card.cardNumber)}</p>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] opacity-80 uppercase">Card Holder</p>
          <p className="font-medium text-sm truncate max-w-[150px]">{card.cardHolderName}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] opacity-80 uppercase">Exp</p>
          <p className="font-medium text-sm">{card.expiryDate}</p>
        </div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState<'home' | 'cards' | 'bills' | 'profile'>('home');
  const [clients, setClients] = useState<Client[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  // Sub-view states
  const [selectedCardForBills, setSelectedCardForBills] = useState<string | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      // 1. Get User Details
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) setUserName(userDoc.data().name);

      // 2. Get Clients
      const clientsQuery = query(collection(db, 'clients'), where('userId', '==', user.uid));
      const clientsSnapshot = await getDocs(clientsQuery);
      const clientsData = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
      setClients(clientsData);

      // 3. Get Bills
      const billsQuery = query(collection(db, 'bills')); 
      const billsSnapshot = await getDocs(billsQuery);
      const billsData = billsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Bill[];
      
      const clientIds = clientsData.map(c => c.clientId);
      const userBills = billsData.filter(bill => clientIds.includes(bill.clientId));
      setBills(userBills);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // --- Calculations & Logic ---

  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return cardNumber;
    return '**** **** **** ' + cleaned.slice(-4);
  };

  const getCardColor = (bankName: string) => {
    const name = bankName?.toUpperCase() || '';
    if (name.includes('HDFC')) return 'from-blue-700 to-blue-900';
    if (name.includes('SBI')) return 'from-sky-500 to-blue-600';
    if (name.includes('ICICI')) return 'from-orange-600 to-red-700';
    if (name.includes('AXIS')) return 'from-pink-700 to-purple-800';
    if (name.includes('KOTAK')) return 'from-red-600 to-red-800';
    return 'from-slate-700 to-slate-900';
  };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthBills = bills.filter(b => {
      if (!b.createdAt) return false;
      const d = b.createdAt.toDate();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const unpaidBills = bills.filter(b => b.status !== 'paid');
    const totalPendingAmount = unpaidBills.reduce((acc, b) => acc + (b.finalAmountForClient || 0), 0);
    const totalInterest = currentMonthBills.reduce((acc, b) => acc + (b.interestAmount || 0), 0);
    
    // Calculate total cards across all clients
    const totalCardsCount = clients.reduce((acc, client) => acc + (client.creditCards?.length || 0), 0);

    return {
      totalPendingAmount,
      totalInterest,
      paidCount: currentMonthBills.filter(b => b.status === 'paid').length,
      totalCardsCount,
      unpaidCount: unpaidBills.length
    };
  }, [bills, clients]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  // --- Views ---

  const renderHome = () => (
    <div className="space-y-6 pb-24">
      {/* Header Card */}
      <div className="bg-blue-600 text-white p-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-blue-100 text-sm">Welcome back,</p>
              <h2 className="text-2xl font-bold">{userName}</h2>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-blue-200 text-sm font-medium">Total Payable (Due + Interest)</p>
            <h1 className="text-4xl font-bold">₹ {stats.totalPendingAmount.toLocaleString()}</h1>
          </div>

          <div className="mt-6 flex gap-3">
             <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex-1">
                <p className="text-xs text-blue-100 mb-1">Unpaid Bills</p>
                <p className="font-bold text-xl">{stats.unpaidCount}</p>
             </div>
             <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex-1">
                <p className="text-xs text-blue-100 mb-1">Total Paid</p>
                <p className="font-bold text-xl">₹{stats.totalInterest.toLocaleString()}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="px-4 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-2">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{stats.totalCardsCount}</span>
          <span className="text-xs text-gray-500">Total Cards</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-2">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{stats.paidCount}</span>
          <span className="text-xs text-gray-500">Paid This Month</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4">
        <h3 className="font-bold text-gray-800 mb-3 text-lg">Recent Activity</h3>
        <div className="space-y-3">
          {bills.slice(0, 3).map(bill => (
            <div key={bill.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className={`p-2 rounded-lg ${bill.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  {bill.status === 'paid' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{bill.selectedCard?.bankName}</p>
                  <p className="text-xs text-gray-500">{bill.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${bill.status === 'paid' ? 'text-green-600' : 'text-gray-800'}`}>
                  ₹{bill.finalAmountForClient.toLocaleString()}
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{bill.status}</p>
              </div>
            </div>
          ))}
          {bills.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No recent activity</p>}
        </div>
      </div>
    </div>
  );

  const renderCards = () => {
    // 1. Flatten all cards from all clients
    const allCards = clients.flatMap(client => 
      (client.creditCards || []).map(card => ({ ...card, ownerName: client.name, clientId: client.id }))
    );

    // 2. Logic to categorize cards
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    // Find card numbers that have a 'paid' bill created in the current month
    const paidCardNumbersInCurrentMonth = new Set(
      bills
        .filter(bill => {
          // Safety check for date existance
          if (!bill.createdAt || bill.status !== 'paid') return false;
          const billDate = bill.createdAt.toDate();
          return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
        })
        .map(bill => bill.selectedCard?.cardNumber)
    );

    // Split the cards
    const paidCards = allCards.filter(card => paidCardNumbersInCurrentMonth.has(card.cardNumber));
    const unpaidCards = allCards.filter(card => !paidCardNumbersInCurrentMonth.has(card.cardNumber));

    return (
      <div className="px-4 py-6 pb-24 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">My Cards</h2>
          <button 
            onClick={() => navigate(`/form/${clients[0]?.distributorId || 'new'}`)} 
            className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* --- Section 1: Unpaid (Pending) Cards --- */}
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-orange-500"></div>
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Payment ({unpaidCards.length})</h3>
          </div>
          
          <div className="space-y-6">
            {unpaidCards.map((card, idx) => (
              <div key={`unpaid-${idx}`} className="bg-white rounded-2xl p-2 shadow-sm border border-orange-100 relative">
                 {/* Visual Component */}
                 <CardVisual card={card} colorClass={getCardColor(card.bankName)} maskFunc={maskCardNumber} />
                 
                 {/* Metadata */}
                 <div className="px-3 py-3 flex justify-between items-center">
                   <div>
                     <p className="text-xs text-gray-500">Card Limit</p>
                     <p className="font-semibold">₹{card.cardLimit?.toLocaleString()}</p>
                   </div>
                   <div className="h-8 w-[1px] bg-gray-200"></div>
                   <div>
                      <p className="text-xs text-gray-500">Owner</p>
                      <p className="font-semibold text-sm">{card.ownerName}</p>
                   </div>
                   <div className="h-8 w-[1px] bg-gray-200"></div>
                   <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="font-semibold text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {card.cardDueDate}th
                      </p>
                   </div>
                 </div>
              </div>
            ))}
            
            {unpaidCards.length === 0 && allCards.length > 0 && (
              <div className="text-center py-6 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium">All caught up! No pending bills.</p>
              </div>
            )}
            
            {allCards.length === 0 && (
               <div className="text-center py-10">
                 <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-500">No cards added yet</p>
               </div>
            )}
          </div>
        </div>

        {/* --- Section 2: Paid Cards --- */}
        {paidCards.length > 0 && (
          <div className="opacity-80">
            <div className="flex items-center gap-2 mb-4 mt-8">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Settled This Month ({paidCards.length})</h3>
            </div>

            <div className="space-y-6">
              {paidCards.map((card, idx) => (
                <div key={`paid-${idx}`} className="bg-gray-50 rounded-2xl p-2 border border-gray-200 grayscale-[0.3] hover:grayscale-0 transition duration-300 relative">
                   {/* Overlay to indicate Paid status */}
                   <div className="absolute z-20 top-6 right-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> PAID
                   </div>

                   <CardVisual card={card} colorClass={getCardColor(card.bankName)} maskFunc={maskCardNumber} />
                   
                   <div className="px-3 py-3 flex justify-between items-center opacity-60">
                     <div>
                       <p className="text-xs text-gray-500">Card Limit</p>
                       <p className="font-semibold">₹{card.cardLimit?.toLocaleString()}</p>
                     </div>
                     <div className="h-8 w-[1px] bg-gray-200"></div>
                     <div>
                       <p className="text-xs text-gray-500">Owner</p>
                       <p className="font-semibold text-sm">{card.ownerName}</p>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBills = () => {
    // If a bill is selected, show details
    if (selectedBillId) {
        const bill = bills.find(b => b.id === selectedBillId);
        if (!bill) return null;
        return (
            <div className="bg-gray-50 min-h-screen pb-24">
                <div className="bg-white p-4 shadow-sm flex items-center gap-2 sticky top-0 z-20">
                    <button onClick={() => setSelectedBillId(null)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <h2 className="font-bold text-lg">Bill Details</h2>
                </div>
                <div className="p-4 space-y-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                        <p className="text-gray-500 text-sm mb-1">Final Amount</p>
                        <h1 className="text-3xl font-bold text-blue-600">₹{bill.finalAmountForClient.toLocaleString()}</h1>
                        <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {bill.status}
                        </span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Breakdown</h3>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Bill Payment</span>
                                <span className="font-medium">₹{bill.totalBillPayment.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Withdrawal</span>
                                <span className="font-medium">₹{bill.totalWithdrawal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-orange-600">
                                <span>Paid</span>
                                <span className="font-bold">+ ₹{bill.interestAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Card Used</h3>
                        </div>
                        <div className="p-4">
                            <p className="font-bold">{bill.selectedCard?.bankName}</p>
                            <p className="text-gray-500 font-mono text-sm">{maskCardNumber(bill.selectedCard?.cardNumber)}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // If a card is selected, show list of bills for that card
    if (selectedCardForBills) {
        const cardBills = bills.filter(b => b.selectedCard?.cardNumber === selectedCardForBills);
        return (
            <div className="pb-24">
                 <div className="bg-white p-4 shadow-sm flex items-center gap-2 sticky top-0 z-20">
                    <button onClick={() => setSelectedCardForBills(null)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <h2 className="font-bold text-lg">Bill History</h2>
                </div>
                <div className="p-4 space-y-3">
                    {cardBills.map(bill => (
                         <div onClick={() => setSelectedBillId(bill.id)} key={bill.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-xs text-gray-500">{bill.createdAt?.toDate().toLocaleDateString()}</span>
                                 <span className={`text-xs px-2 py-0.5 rounded ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{bill.status}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="font-bold text-gray-800">₹{bill.finalAmountForClient.toLocaleString()}</p>
                                     <p className="text-xs text-gray-500 mt-1">Int: ₹{bill.interestAmount}</p>
                                 </div>
                                 <ChevronRight className="w-5 h-5 text-gray-300" />
                             </div>
                          </div>
                    ))}
                    {cardBills.length === 0 && <p className="text-center text-gray-500 mt-10">No bills found for this card.</p>}
                </div>
            </div>
        )
    }

    // Top Level: List of Cards to select
    const uniqueCards = clients.flatMap(c => c.creditCards || []).filter((v,i,a)=>a.findIndex(t=>(t.cardNumber === v.cardNumber))===i);

    return (
      <div className="px-4 py-6 pb-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bills</h2>
        <p className="text-sm text-gray-500 mb-4">Select a card to view bill history</p>
        <div className="space-y-4">
            {uniqueCards.map((card, idx) => (
                <div 
                    key={idx} 
                    onClick={() => setSelectedCardForBills(card.cardNumber)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 active:bg-gray-50 transition"
                >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getCardColor(card.bankName)} flex items-center justify-center text-white`}>
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{card.bankName}</h3>
                        <p className="text-sm text-gray-500 font-mono">{maskCardNumber(card.cardNumber)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
            ))}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="px-4 py-6 pb-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                {userName.charAt(0)}
            </div>
            <div>
                <h3 className="text-lg font-bold">{userName}</h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             {clients.map((client) => (
                <div key={client.id} className="border-b border-gray-100 last:border-0 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{client.name}</h4>
                        <button 
                            onClick={() => navigate(`/form/${client.distributorId}?edit=${client.id}`)}
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium"
                        >
                            Edit
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <CreditCard className="w-3 h-3" />
                        {client.creditCards?.length || 0} Cards Linked
                    </p>
                </div>
             ))}
             {clients.length === 0 && <div className="p-4 text-center text-gray-500">No clients/profiles added.</div>}
             <button 
                onClick={() => navigate(`/form/${clients[0]?.distributorId || 'new'}`)} 
                className="w-full p-4 text-blue-600 font-medium text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
             >
                <Plus className="w-4 h-4" /> Add New Profile
             </button>
        </div>

        <button 
            onClick={handleLogout}
            className="mt-8 w-full bg-red-50 text-red-600 font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
        >
            <LogOut className="w-5 h-5" /> Logout
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Main Content Area */}
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-2xl overflow-hidden relative">
        
        {activeTab === 'home' && renderHome()}
        {activeTab === 'cards' && renderCards()}
        {activeTab === 'bills' && renderBills()}
        {activeTab === 'profile' && renderProfile()}

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-md mx-auto flex justify-around items-center py-3">
                <button 
                    onClick={() => setActiveTab('home')}
                    className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-blue-100' : ''}`} />
                    <span className="text-[10px] font-medium">Home</span>
                </button>
                <button 
                    onClick={() => setActiveTab('cards')}
                    className={`flex flex-col items-center gap-1 transition ${activeTab === 'cards' ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <CreditCard className={`w-6 h-6 ${activeTab === 'cards' ? 'fill-blue-100' : ''}`} />
                    <span className="text-[10px] font-medium">Cards</span>
                </button>
                <button 
                    onClick={() => setActiveTab('bills')}
                    className={`flex flex-col items-center gap-1 transition ${activeTab === 'bills' ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <FileText className={`w-6 h-6 ${activeTab === 'bills' ? 'fill-blue-100' : ''}`} />
                    <span className="text-[10px] font-medium">Bills</span>
                </button>
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center gap-1 transition ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <User className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-blue-100' : ''}`} />
                    <span className="text-[10px] font-medium">Profile</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}