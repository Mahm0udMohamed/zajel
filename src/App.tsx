import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { imageCache } from "./features/images";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import BottomNavigation from "./components/layout/BottomNavigation";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import GradualBlur from "./components/ui/GradualBlur";

const HomePage = lazy(() => import("./pages/HomePage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const DeliveryPage = lazy(() => import("./pages/DeliveryPage"));
const OccasionsPage = lazy(() => import("./pages/OccasionsPage"));
const BrandsPage = lazy(() => import("./pages/BrandsPage"));
const SpecialGiftsPage = lazy(() => import("./pages/SpecialGiftsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const PackagesPage = lazy(() => import("./pages/PackagesPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const GiftAssistantPage = lazy(() => import("./pages/GiftAssistantPage"));

// Auth pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const EmailVerificationPage = lazy(
  () => import("./pages/auth/EmailVerificationPage")
);
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const PhoneVerificationPage = lazy(
  () => import("./pages/auth/PhoneVerificationPage")
);
const PhoneLoginVerificationPage = lazy(
  () => import("./pages/auth/PhoneLoginVerificationPage")
);
const PhoneSetupPage = lazy(() => import("./pages/auth/PhoneSetupPage"));
const GoogleCallbackPage = lazy(
  () => import("./pages/auth/GoogleCallbackPage")
);

// User pages
const ProfilePage = lazy(() => import("./pages/user/ProfilePage"));
const OrdersPage = lazy(() => import("./pages/user/OrdersPage"));

function App() {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Cleanup image cache on unmount
  useEffect(() => {
    return () => {
      imageCache.clearCache();
    };
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  return (
    <ToastProvider>
      <AuthProvider>
        <UserProvider>
          <FavoritesProvider>
            <CartProvider>
              <div
                className={`min-h-screen flex flex-col ${
                  i18n.language === "ar" ? "font-sans-ar" : "font-sans-en"
                } overflow-x-hidden`}
                style={{ scrollBehavior: "smooth" }}
              >
                <Header />
                <main className="flex-grow pb-0 md:pb-0 relative" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ height: '100%', overflowY: 'auto' }}>
                  <Suspense
                    fallback={
                      <div className="flex justify-center items-center min-h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/categories" element={<CategoryPage />} />
                      <Route
                        path="/category/:slug"
                        element={<CategoryPage />}
                      />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/faq" element={<FAQPage />} />
                      <Route path="/delivery" element={<DeliveryPage />} />
                      <Route path="/occasions" element={<OccasionsPage />} />
                      <Route
                        path="/occasion/:slug"
                        element={<OccasionsPage />}
                      />
                      <Route path="/brands" element={<BrandsPage />} />
                      <Route
                        path="/special-gifts"
                        element={<SpecialGiftsPage />}
                      />
                      <Route
                        path="/notifications"
                        element={<NotificationsPage />}
                      />
                      <Route
                        path="/favorites"
                        element={
                          <ProtectedRoute requireAuthForFavorites={true}>
                            <FavoritesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/packages" element={<PackagesPage />} />
                      <Route
                        path="/gift-assistant"
                        element={<GiftAssistantPage />}
                      />

                      {/* Auth Routes - Only for non-authenticated users */}
                      <Route
                        path="/auth/login"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <LoginPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/auth/signup"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <SignupPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/auth/verify-email"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <EmailVerificationPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/auth/forgot-password"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <ForgotPasswordPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/auth/reset-password"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <ResetPasswordPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/auth/verify-phone"
                        element={
                          <ProtectedRoute>
                            <PhoneVerificationPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/auth/phone-setup"
                        element={
                          <ProtectedRoute>
                            <PhoneSetupPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/auth/verify-phone-login"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <PhoneLoginVerificationPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/auth/google/callback"
                        element={<GoogleCallbackPage />}
                      />

                      {/* User Routes - Only for authenticated users */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute requirePhoneVerification={true}>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <ProtectedRoute requirePhoneVerification={true}>
                            <OrdersPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                  </div>
                  
                  <GradualBlur
                    target="parent"
                    position="bottom"
                    height="6rem"
                    strength={2}
                    divCount={5}
                    curve="bezier"
                    exponential={true}
                    opacity={1}
                  />
                </main>
                <Footer />
                <BottomNavigation />
              </div>
            </CartProvider>
          </FavoritesProvider>
        </UserProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
