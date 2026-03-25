import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.min.css";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";

const TopMenu = lazy(() => import("./components/TopMenu"));
const Header = lazy(() => import("./components/Header"));
const Footer = lazy(() => import("./components/Footer"));
const CreateOrEditProduct = lazy(() => import("./admin/pages/CreateorEditProduct"));
const ProductList = lazy(() => import("./admin/pages/ProductList"));
const AdminFooter = lazy(() => import("./admin/components/AdminFooter"));
const AdminHeader = lazy(() => import("./admin/components/AdminHeader"));

// Lazy load the views
const HomeView = lazy(() => import("./views/Home"));
const SignInView = lazy(() => import("./views/account/SignIn"));
const SignUpView = lazy(() => import("./views/account/SignUp"));
const ForgotPasswordView = lazy(() => import("./views/account/ForgotPassword"));
const OrdersView = lazy(() => import("./views/account/Orders"));
const WishlistView = lazy(() => import("./views/account/Wishlist"));
const NotificationView = lazy(() => import("./views/account/Notification"));
const MyProfileView = lazy(() => import("./views/account/MyProfile"));
const CategoryListView = lazy(() => import("./views/product/List"));
const ProductListView = lazy(() => import("./views/product/ProductList"));
const ProductDetailView = lazy(() => import("./views/product/Detail"));
const StarZoneView = lazy(() => import("./views/product/StarZone"));
const CartView = lazy(() => import("./views/cart/Cart"));
const CheckoutView = lazy(() => import("./views/cart/Checkout"));
const OrderConfirmation = lazy(() => import("./views/cart/OrderConfirmation"));
const Tracking = lazy(() => import("./views/cart/Tracking"));
const InvoiceView = lazy(() => import("./views/cart/Invoice"));
const DocumentationView = lazy(() => import("./views/Documentation"));
const NotFoundView = lazy(() => import("./views/pages/404"));
const InternalServerErrorView = lazy(() => import("./views/pages/500"));
const ContactUsView = lazy(() => import("./views/pages/ContactUs"));
const SupportView = lazy(() => import("./views/pages/Support"));
const BlogView = lazy(() => import("./views/blog/Blog"));
const BlogDetailView = lazy(() => import("./views/blog/Detail"));
const Dashboard = lazy(() => import("./admin/pages/Deashboed"));
const CategoryManagement = lazy(() => import("./admin/pages/CategoryManagement"));
const UserManagement = lazy(() => import("./admin/pages/UserManagement"));
const OrderManagement = lazy(() => import("./admin/pages/OrderManagement"));

const SubCategoryManagement = lazy(() => import("./admin/pages/SubCategoryManagement"));
const ProductManagement = lazy(() => import("./admin/pages/ProductManagement"));
const AdminProfile = lazy(() => import("./admin/pages/AdminProfile"));

// New admin panel (v2)
const AdminV2Layout = lazy(() => import("./admin/v2/components/AdminV2Layout"));
const AdminV2Dashboard = lazy(() => import("./admin/v2/pages/Dashboard"));
const AdminV2Users = lazy(() => import("./admin/v2/pages/Users"));
const AdminV2Products = lazy(() => import("./admin/v2/pages/Products"));
const AdminV2Categories = lazy(() => import("./admin/v2/pages/Categories"));
const AdminV2SubCategories = lazy(() => import("./admin/v2/pages/SubCategories"));
const AdminV2Sellers = lazy(() => import("./admin/v2/pages/Sellers"));
const AdminV2Orders = lazy(() => import("./admin/v2/pages/Orders"));
const AdminV2Profile = lazy(() => import("./admin/v2/pages/Profile"));
const AdminV2Settings = lazy(() => import("./admin/v2/pages/Settings"));
const AdminV2Coupons = lazy(() => import("./admin/v2/pages/Coupons"));
// Layout component that includes Header, TopMenu, and Footer
const Layout = ({ children }) => (
  <React.Fragment>
    <Header />
    <TopMenu />
    <div>{children}</div>
    <Footer />
  </React.Fragment>
);

const AdminLayout = ({ children }) => (
  <React.Fragment>
    <AdminHeader />
    <div>{children}</div>
    <AdminFooter />
  </React.Fragment>
);

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <React.Fragment>
          <Suspense
            fallback={<div className="text-white text-center mt-3">Loading...</div>}
          >
            <Routes>
              {/* Routes that require the common layout */}
              <Route path="/" element={<Layout ><HomeView /></Layout>} />
              <Route path="/home" element={<Layout ><HomeView /></Layout>} />
              <Route path="/account/signin" element={<SignInView />} />
              <Route path="/account/signup" element={<SignUpView />} />
              <Route path="/account/forgotpassword" element={<ForgotPasswordView />} />
              <Route path="/account/profile" element={<ProtectedRoute><Layout><MyProfileView /></Layout></ProtectedRoute>} />
              <Route path="/account/orders" element={<ProtectedRoute><Layout><OrdersView /></Layout></ProtectedRoute>} />
              <Route path="/account/wishlist" element={<ProtectedRoute><Layout><WishlistView /></Layout></ProtectedRoute>} />
              <Route path="/account/notification" element={<ProtectedRoute><Layout><NotificationView /></Layout></ProtectedRoute>} />
              <Route path="/categories" element={<Layout><CategoryListView /></Layout>} />
              <Route path="/products" element={<Layout><ProductListView /></Layout>} />
              <Route path="/star/zone" element={<Layout><StarZoneView /></Layout>} />
              <Route path="/cart" element={<Layout><CartView /></Layout>} />
              <Route path="/checkout" element={<ProtectedRoute><Layout><CheckoutView /></Layout></ProtectedRoute>} />
              <Route path="/order-confirmation" element={<Layout><OrderConfirmation /></Layout>} />
              <Route path="/track/:id" element={<Layout><Tracking /></Layout>} />
              <Route path="/create-or-edit-product" element={<Layout><CreateOrEditProduct /></Layout>} />
              <Route path="/invoice" element={<ProtectedRoute><Layout><InvoiceView /></Layout></ProtectedRoute>} />
              <Route path="/documentation" element={<Layout><DocumentationView /></Layout>} />
              <Route path="/contact-us" element={<Layout><ContactUsView /></Layout>} />
              <Route path="/support" element={<Layout><SupportView /></Layout>} />
              <Route path="/blog" element={<Layout><BlogView /></Layout>} />
              <Route path="/blog/detail" element={<Layout><BlogDetailView /></Layout>} />
              <Route path="/500" element={<Layout><InternalServerErrorView /></Layout>} />

              {/* Admin Routes (legacy panel) */}
              <Route path="/seller" element={<AdminLayout><Dashboard /></AdminLayout>} />
              <Route path="/seller/product-list" element={<AdminLayout><ProductList /></AdminLayout>} />
              <Route path="/seller/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
              <Route path="/seller/orders" element={<AdminLayout><OrderManagement /></AdminLayout>} />
              <Route path="/seller/sub-categories" element={<AdminLayout><SubCategoryManagement /></AdminLayout>} />
              <Route path="/seller/products" element={<AdminLayout><ProductManagement /></AdminLayout>} />
              <Route path="/seller/profile" element={<AdminLayout><AdminProfile /></AdminLayout>} />
              <Route path="/seller/users" element={<AdminLayout><UserManagement /></AdminLayout>} />

              {/* Admin Routes (new panel) */}
              <Route path="/admin" element={<AdminV2Layout><AdminV2Dashboard /></AdminV2Layout>} />
              <Route path="/admin/users" element={<AdminV2Layout><AdminV2Users /></AdminV2Layout>} />
              <Route path="/admin/products" element={<AdminV2Layout><AdminV2Products /></AdminV2Layout>} />
              <Route path="/admin/categories" element={<AdminV2Layout><AdminV2Categories /></AdminV2Layout>} />
              <Route path="/admin/subcategories" element={<AdminV2Layout><AdminV2SubCategories /></AdminV2Layout>} />
              <Route path="/admin/sellers" element={<AdminV2Layout><AdminV2Sellers /></AdminV2Layout>} />
              <Route path="/admin/orders" element={<AdminV2Layout><AdminV2Orders /></AdminV2Layout>} />
              <Route path="/admin/profile" element={<AdminV2Layout><AdminV2Profile /></AdminV2Layout>} />
              <Route path="/admin/settings" element={<AdminV2Layout><AdminV2Settings /></AdminV2Layout>} />
              <Route path="/admin/coupons" element={<AdminV2Layout><AdminV2Coupons /></AdminV2Layout>} />

              <Route
                path="/product/:productId"
                element={<Layout><ProductDetailView /></Layout>}
              />

              {/* Other routes */}
              <Route path="*" element={<Layout><NotFoundView /></Layout>} />
            </Routes>
          </Suspense>
        </React.Fragment>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
