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
  RefreshCw
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
      <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center text-[#A8A29E] space-y-3 font-mono">
        <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-[#0C0A09] text-[#FAFAF9] flex flex-col relative selection:bg-[#F59E0B] selection:text-[#0C0A09]">
      
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-5 relative z-10 space-y-5">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-[#38332E] pb-3 gap-2 overflow-x-auto no-scrollbar">
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Tab 0: Store Pulse Dashboard */}
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-[#292524] text-[#FAFAF9] border border-[#F59E0B]/50 shadow-sm'
                  : 'text-[#A8A29E] hover:text-[#FAFAF9] hover:bg-[#1C1917]'
              }`}
            >
              <Activity className={`w-4 h-4 ${activeTab === 'DASHBOARD' ? 'text-[#F59E0B]' : 'text-[#78716C]'}`} />
              <span>Store Pulse</span>
            </button>

            {/* Tab 1: Catalog */}
            <button
              onClick={() => setActiveTab('CATALOG')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'CATALOG'
                  ? 'bg-[#292524] text-[#FAFAF9] border border-[#F59E0B]/50 shadow-sm'
                  : 'text-[#A8A29E] hover:text-[#FAFAF9] hover:bg-[#1C1917]'
              }`}
            >
              <Boxes className={`w-4 h-4 ${activeTab === 'CATALOG' ? 'text-[#F59E0B]' : 'text-[#78716C]'}`} />
              <span>Inventory Catalog</span>
            </button>

            {/* Tab 2: Manual Operations */}
            <button
              onClick={() => setActiveTab('MANUAL_FORMS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'MANUAL_FORMS'
                  ? 'bg-[#292524] text-[#FAFAF9] border border-[#F59E0B]/50 shadow-sm'
                  : 'text-[#A8A29E] hover:text-[#FAFAF9] hover:bg-[#1C1917]'
              }`}
            >
              <ArrowLeftRight className={`w-4 h-4 ${activeTab === 'MANUAL_FORMS' ? 'text-[#F59E0B]' : 'text-[#78716C]'}`} />
              <span>Stock Operations</span>
            </button>

            {/* Tab 3: History */}
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'HISTORY'
                  ? 'bg-[#292524] text-[#FAFAF9] border border-[#F59E0B]/50 shadow-sm'
                  : 'text-[#A8A29E] hover:text-[#FAFAF9] hover:bg-[#1C1917]'
              }`}
            >
              <History className={`w-4 h-4 ${activeTab === 'HISTORY' ? 'text-[#F59E0B]' : 'text-[#78716C]'}`} />
              <span>Audit History</span>
            </button>

            {/* Tab 4: Manager Financials (STRICTLY HIDDEN for Staff!) */}
            {isManager && (
              <button
                onClick={() => setActiveTab('FINANCIALS')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeTab === 'FINANCIALS'
                    ? 'bg-[#292524] text-[#FBBF24] border border-[#FBBF24]/40 shadow-sm'
                    : 'text-[#A8A29E] hover:text-[#FBBF24] hover:bg-[#1C1917]'
                }`}
              >
                <LineChart className="w-4 h-4 text-[#FBBF24]" />
                <span>Financial Reports</span>
                <span className="px-1.5 py-0.2 text-[9px] rounded bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30 uppercase font-mono">
                  MGR
                </span>
              </button>
            )}

          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={triggerRefresh}
            className="p-2 rounded-xl bg-[#1C1917] hover:bg-[#292524] border border-[#38332E] text-[#A8A29E] hover:text-[#FAFAF9] transition shadow-sm"
            title="Refresh Live Store Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingItems ? 'animate-spin text-[#F59E0B]' : ''}`} />
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
      <footer className="mt-auto py-5 border-t border-[#38332E] text-center text-[11px] font-mono text-[#78716C] z-10">
        <p>StockSense • Retail Command Terminal • Nowshera Shopping Mall Intelligence</p>
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
