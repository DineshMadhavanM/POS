import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { EmployeeLoginPage } from './pages/EmployeeLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { MenuPage } from './pages/MenuPage';
import { CurrentOrdersPage } from './pages/CurrentOrdersPage';
import { POSPage } from './pages/POSPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { InventoryPage } from './pages/InventoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { RestaurantPage } from './pages/RestaurantPage';
import { BakeryPage } from './pages/BakeryPage';
import { RetailPage } from './pages/RetailPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SuperAdminLoginPage } from './pages/SuperAdminLoginPage';
import { SuperAdminPanelPage } from './pages/SuperAdminPanelPage';

const queryClient = new QueryClient();

// Protected Workspace Layout Guard with Flutter-Style Mobile Integration
const WorkspaceLayout: React.FC = () => {
  const { isAuthenticated, fetchProfile } = useAuthStore();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 w-full max-w-full overflow-x-hidden">
      {/* Sidebar / Mobile Drawer */}
      <Sidebar
        onOpenAI={() => setIsAIOpen(true)}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        <Header
          onOpenAI={() => setIsAIOpen(true)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-5 overflow-y-auto overflow-x-hidden pb-24 lg:pb-6 w-full max-w-full">
          <Outlet />
        </main>

        {/* Flutter-style Bottom Navigation for Mobile Devices */}
        <MobileBottomNav onOpenDrawer={() => setIsDrawerOpen(true)} />
      </div>

      {/* AI Assistant Modal / Sheet */}
      <AIAssistantDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<SuperAdminLoginPage />} />
          <Route path="/super-admin" element={<SuperAdminPanelPage />} />
          <Route path="/employee-login" element={<EmployeeLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected Multi-Tenant SaaS Workspace Routes */}
          <Route element={<WorkspaceLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/current-orders" element={<CurrentOrdersPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/restaurant" element={<RestaurantPage />} />
            <Route path="/bakery" element={<BakeryPage />} />
            <Route path="/retail" element={<RetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};
