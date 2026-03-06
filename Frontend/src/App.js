import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.min.css";
import { UserProvider } from "./context/UserContext";

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
const ProductListView = lazy(() => import("./views/product/List"));
const ProductDetailView = lazy(() => import("./views/product/Detail"));
const StarZoneView = lazy(() => import("./views/product/StarZone"));
const CartView = lazy(() => import("./views/cart/Cart"));
const CheckoutView = lazy(() => import("./views/cart/Checkout"));
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

const SubCategoryManagement = lazy(() => import("./admin/pages/SubCategoryManagement"));
const ProductManagement = lazy(() => import("./admin/pages/ProductManagement"));
const AdminProfile = lazy(() => import("./admin/pages/AdminProfile"));
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
              <Route path="/account/profile" element={<Layout><MyProfileView /></Layout>} />
              <Route path="/account/orders" element={<Layout><OrdersView /></Layout>} />
              <Route path="/account/wishlist" element={<Layout><WishlistView /></Layout>} />
              <Route path="/account/notification" element={<Layout><NotificationView /></Layout>} />
              <Route path="/category" element={<Layout><ProductListView /></Layout>} />
              <Route path="/product/detail" element={<Layout><ProductDetailView /></Layout>} />
              <Route path="/star/zone" element={<Layout><StarZoneView /></Layout>} />
              <Route path="/cart" element={<Layout><CartView /></Layout>} />
              <Route path="/checkout" element={<Layout><CheckoutView /></Layout>} />
              <Route path="/create-or-edit-product" element={<Layout><CreateOrEditProduct /></Layout>} />
              <Route path="/invoice" element={<Layout><InvoiceView /></Layout>} />
              <Route path="/documentation" element={<Layout><DocumentationView /></Layout>} />
              <Route path="/contact-us" element={<Layout><ContactUsView /></Layout>} />
              <Route path="/support" element={<Layout><SupportView /></Layout>} />
              <Route path="/blog" element={<Layout><BlogView /></Layout>} />
              <Route path="/blog/detail" element={<Layout><BlogDetailView /></Layout>} />
              <Route path="/500" element={<Layout><InternalServerErrorView /></Layout>} />

              {/* Admin Routes */}
              <Route path="/admins" element={<AdminLayout><Dashboard /></AdminLayout>} />
              <Route path="/admins/product-list" element={<AdminLayout><ProductList /></AdminLayout>} />
              <Route path="/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
              <Route path="/sub-categories" element={<AdminLayout><SubCategoryManagement /></AdminLayout>} />
              <Route path="/products" element={<AdminLayout><ProductManagement /></AdminLayout>} />
              <Route path="/profile" element={<AdminLayout><AdminProfile /></AdminLayout>} />
              <Route path="/users" element={<AdminLayout><UserManagement /></AdminLayout>} />

              {/* Add these new routes for category products (use slug param for clean URLs) */}
              <Route
                path="/products/category/:categorySlug"
                element={<Layout><ProductDetailView /></Layout>}
              />
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
