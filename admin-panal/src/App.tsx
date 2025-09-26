import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import GiftsPage from "./pages/GiftsPage";
import ContentPage from "./pages/ContentPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // const handleLogout = () => {
  //   setIsLoggedIn(false);
  // };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/products"
          element={
            <DashboardLayout>
              <ProductsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/orders"
          element={
            <DashboardLayout>
              <OrdersPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/gifts"
          element={
            <DashboardLayout>
              <GiftsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/content"
          element={
            <DashboardLayout>
              <ContentPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <DashboardLayout>
              <AnalyticsPage />
            </DashboardLayout>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
