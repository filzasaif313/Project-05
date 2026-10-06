import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import LandingPage from './components/LandingPage';
import SignInModal from './components/SignInModal';
import Header from './components/Header';
import StorePulseOverview from './components/StorePulseOverview';
import CatalogView from './components/CatalogView';
import ManualFormsView from './components/ManualFormsView';
import HistoryView from './components/HistoryView';
import ManagerAnalyticsView from './components/ManagerAnalyticsView';
import AiAssistantDrawer from './components/AiAssistantDrawer';
import { 
  Activity,
  Boxes, 
  ArrowLeftRight, 
  History, 
  LineChart, 
  ShieldCheck,
  RefreshCw,
  Warehouse
} from 'lucide-react';

function AppContent() {
  const { isAuthenticated, loading: authLoading, isManager, isStaff, user } = useAuth();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [selectedSection, setSelectedSection] = useState('All');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiSeedPrompt, setAiSeedPrompt] = useState(null);
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // If staff user is on the Financials tab, redirect to DASHBOARD
  useEffect(() => {
    if (isStaff && activeTab === 'FINANCIALS') {
      setActiveTab('DASHBOARD');
    }
  }, [isStaff, activeTab]);

  // Load items, movements and manager analytics
  const fetchStoreData = async () => {
    if (!isAuthenticated) return;
    setLoadingItems(true);
    try {
      const itemsPromise = api.getItems('', selectedSection);
      const movementsPromise = api.getMovements();
      const analyticsPromise = isManager ? api.getAnalytics().catch(() => null) : Promise.resolve(null);

      const [itemsData, movementsData, analyticsData] = await Promise.all([
        itemsPromise,
        movementsPromise,
        analyticsPromise
      ]);

      setItems(itemsData.items || []);
      setMovements(movementsData.movements || []);
      if (analyticsData) {
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [selectedSection, refreshCounter, user, isManager, isAuthenticated]);

  const triggerRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  const handleTriggerAiPrompt = (promptText) => {
    setAiSeedPrompt(promptText);
    setIsAiDrawerOpen(true);
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D0C] flex flex-col items-center justify-center text-[#A8A295] space-y-3 font-mono">
        <div className="w-8 h-8 border-2 border-[#8FAF87] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Initializing StockSense Terminal...</p>
      </div>
    );
  }

  // 1. Unauthenticated Product Entry Flow: Landing Page -> Sign In Modal
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onOpenSignIn={() => setIsSignInOpen(true)} />
        <SignInModal 
          isOpen={isSignInOpen} 
          onClose={() => setIsSignInOpen(false)} 
        />
      </>
    );
  }

  // 2. Authenticated Store Terminal Experience
  return (
    <div className="min-h-screen bg-[#0B0D0C] text-[#F1EDE3] flex flex-col relative selection:bg-[#8FAF87] selection:text-[#0B0D0C]">
      
      {/* Header with Store Pulse identity and Authenticated User */}
      <Header
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        onToggleAiDrawer={() => {
          setAiSeedPrompt(null);
          setIsAiDrawerOpen(!isAiDrawerOpen);
        }}
        isAiDrawerOpen={isAiDrawerOpen}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 relative z-10 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 gap-2 overflow-x-auto no-scrollbar">
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Tab 0: Store Pulse Dashboard */}
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-[#8FAF87] text-[#0B0D0C] shadow-md shadow-[#8FAF87]/20'
                  : 'text-[#A8A295] hover:text-[#F1EDE3] hover:bg-[#171A18]'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Store Pulse</span>
            </button>

            {/* Tab 1: Catalog */}
            <button
              onClick={() => setActiveTab('CATALOG')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'CATALOG'
                  ? 'bg-[#171A18] text-[#F1EDE3] border border-white/20 shadow-md'
                  : 'text-[#A8A295] hover:text-[#F1EDE3] hover:bg-[#171A18]'
              }`}
            >
              <Boxes className="w-4 h-4 text-[#8FAF87]" />
              <span>Inventory Catalog</span>
            </button>

            {/* Tab 2: Manual Operations */}
            <button
              onClick={() => setActiveTab('MANUAL_FORMS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'MANUAL_FORMS'
                  ? 'bg-[#171A18] text-[#F1EDE3] border border-white/20 shadow-md'
                  : 'text-[#A8A295] hover:text-[#F1EDE3] hover:bg-[#171A18]'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-[#B8794A]" />
              <span>Stock Operations</span>
            </button>

            {/* Tab 3: History */}
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'HISTORY'
                  ? 'bg-[#171A18] text-[#F1EDE3] border border-white/20 shadow-md'
                  : 'text-[#A8A295] hover:text-[#F1EDE3] hover:bg-[#171A18]'
              }`}
            >
              <History className="w-4 h-4 text-[#A8A295]" />
              <span>Audit History</span>
            </button>

            {/* Tab 4: Manager Financials (STRICTLY HIDDEN for Staff!) */}
            {isManager && (
              <button
                onClick={() => setActiveTab('FINANCIALS')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeTab === 'FINANCIALS'
                    ? 'bg-[#171A18] text-[#8FAF87] border border-[#8FAF87]/40 shadow-md shadow-[#8FAF87]/10'
                    : 'text-[#A8A295] hover:text-[#8FAF87] hover:bg-[#171A18]'
                }`}
              >
                <LineChart className="w-4 h-4 text-[#8FAF87]" />
                <span>Financial Reports</span>
                <span className="px-1.5 py-0.2 text-[9px] rounded bg-[#8FAF87]/15 text-[#8FAF87] border border-[#8FAF87]/30 uppercase">
                  Mgr
                </span>
              </button>
            )}

          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={triggerRefresh}
            className="p-2 rounded-xl bg-[#171A18] hover:bg-[#1E221F] border border-white/[0.08] text-[#A8A295] hover:text-[#F1EDE3] transition"
            title="Refresh Live Store Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingItems ? 'animate-spin text-[#8FAF87]' : ''}`} />
          </button>

        </div>

        {/* Active View Container */}
        <div className="transition-all duration-300">
          
          {activeTab === 'DASHBOARD' && (
            <StorePulseOverview
              items={items}
              movements={movements}
              analytics={analytics}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onTriggerAiPrompt={handleTriggerAiPrompt}
            />
          )}

          {activeTab === 'CATALOG' && (
            <CatalogView 
              items={items} 
              loading={loadingItems} 
              onRefresh={triggerRefresh} 
            />
          )}

          {activeTab === 'MANUAL_FORMS' && (
            <ManualFormsView 
              items={items} 
              onStockUpdated={triggerRefresh} 
            />
          )}

          {activeTab === 'HISTORY' && (
            <HistoryView 
              refreshTrigger={refreshCounter} 
            />
          )}

          {activeTab === 'FINANCIALS' && isManager && (
            <ManagerAnalyticsView />
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto py-5 border-t border-white/[0.06] text-center text-[11px] font-mono text-[#7C776C] z-10">
        <p>StockSense • After-Hours Terminal • Nowshera Shopping Mall Intelligence</p>
      </footer>

      {/* Store Brain AI Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => {
          setIsAiDrawerOpen(false);
          setAiSeedPrompt(null);
        }}
        onStockUpdated={triggerRefresh}
        onOpenManualForms={() => setActiveTab('MANUAL_FORMS')}
        seedPrompt={aiSeedPrompt}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
