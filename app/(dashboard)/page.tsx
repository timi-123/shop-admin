// app/(dashboard)/page.tsx - FIXED VERSION (Removed unused imports)
"use client";

import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SalesChart from "@/components/custom ui/SalesChart";
import Loader from "@/components/custom ui/Loader";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3,
  ArrowRight,
  Store,
  Globe,
  Sparkles,
  DollarSign,
  Package
} from "lucide-react";

// Beautiful Landing Page Component (Only for non-authenticated users)
const LandingPageContent = () => {
  const features = [
    {
      icon: <Store className="h-8 w-8 text-blue-600" />,
      title: "Multi-Vendor Platform",
      description: "Manage multiple vendors and their products from one central dashboard"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: "Advanced Analytics",
      description: "Track sales, monitor performance, and make data-driven decisions"
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Lightning Fast",
      description: "Optimized performance for seamless user experience"
    },
    {
      icon: <Users className="h-8 w-8 text-red-600" />,
      title: "User Management",
      description: "Comprehensive user and vendor management system"
    },
    {
      icon: <Globe className="h-8 w-8 text-indigo-600" />,
      title: "Global Ready",
      description: "Built for international commerce with multi-currency support"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Vendors" },
    { number: "500K+", label: "Products Managed" }, 
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image src="/logo.png" alt="ShopGram Admin" width={120} height={40} />
              <div className="flex items-center space-x-1">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
              ShopGram Admin
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              The most powerful e-commerce management platform. 
              <br />
              <span className="font-semibold text-gray-800">Streamline operations, boost sales, manage vendors.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-800">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools and features designed to help you manage your e-commerce business efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of successful businesses using ShopGram Admin to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image src="/logo.png" alt="ShopGram" width={100} height={30} />
              <span className="text-sm opacity-75">Admin Dashboard</span>
            </div>
            <div className="text-sm opacity-75">
              © 2025 ShopGram. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Vendor Dashboard Component
const VendorDashboard = () => {
  const { user, isLoaded } = useUser(); // Add user context
  const { role, isVendor } = useRole(); // Add role context
  const [salesData, setSalesData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [vendorStats, setVendorStats] = useState({
    totalProducts: 0,
    totalCollections: 0,
    vendorEarnings: 0,
  });

  useEffect(() => {
    const fetchVendorData = async () => {
      // CRITICAL FIX: Only fetch if user is loaded and is a vendor
      if (!isLoaded || !user || !isVendor) {
        console.log("Skipping vendor data fetch - not a vendor or user not loaded");
        setLoading(false);
        return;
      }

      // Minimum loading time to prevent flicker
      const startTime = Date.now();
      const minLoadingTime = 800; // 800ms minimum

      try {
        console.log("Fetching vendor data for authenticated vendor user");
        
        // Get vendor info first - WITH ERROR HANDLING
        const vendorRes = await fetch("/api/vendors/my-vendor");
        if (vendorRes.ok) {
          const vendorData = await vendorRes.json();
          setVendor(vendorData);

          // Get real platform and vendor statistics
          const [platformStatsRes, salesChartRes, vendorStatsRes] = await Promise.all([
            fetch("/api/dashboard/stats"), // Real platform stats (same as admin)
            fetch("/api/dashboard/sales-chart"), // Real sales chart data (same as admin)
            fetch("/api/dashboard/vendor-stats"), // Real vendor-specific stats
          ]);

          // Process platform stats - REAL DATA for all vendors
          if (platformStatsRes.ok) {
            const platformStats = await platformStatsRes.json();
            setTotalRevenue(platformStats.totalRevenue);
            setTotalOrders(platformStats.totalOrders);
            setTotalCustomers(platformStats.totalCustomers);
          }

          // Process sales chart data - REAL DATA for all vendors
          if (salesChartRes.ok) {
            const salesData = await salesChartRes.json();
            setSalesData(salesData);
          }

          // Process vendor-specific stats - REAL DATA for this vendor only
          if (vendorStatsRes.ok) {
            const vendorStats = await vendorStatsRes.json();
            setVendorStats(vendorStats);
          }
        } else {
          // Handle vendor fetch error gracefully
          console.error("Failed to fetch vendor data:", vendorRes.status, vendorRes.statusText);
          if (vendorRes.status === 401) {
            console.log("Unauthorized - user may not be authenticated yet");
          } else if (vendorRes.status === 403) {
            console.log("User is not a vendor");
          } else if (vendorRes.status === 404) {
            console.log("Vendor not found");
          }
        }

        // Ensure minimum loading time
        const elapsed = Date.now() - startTime;
        if (elapsed < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
        }

      } catch (error) {
        console.error("Error fetching vendor dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    // CRITICAL FIX: Add dependency on isLoaded and user
    fetchVendorData();
  }, [isLoaded, user, isVendor]); // Add proper dependencies

  if (loading) {
    return <Loader />;
  }

  // Show error state if vendor data couldn't be loaded
  if (!vendor && isVendor) {
    return (
      <div className="px-10 py-5">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-red-600 mb-4">Unable to Load Vendor Dashboard</h2>
          <p className="text-gray-600 mb-4">There was an issue loading your vendor information.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 py-5">
      <div className="mb-8">
        <h1 className="text-heading2-bold">Vendor Dashboard</h1>
        {vendor && (
          <p className="text-body-medium text-grey-2">Welcome back, {vendor.businessName}</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total platform orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${vendorStats.vendorEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Your total earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/my-products">
              <Button className="w-full" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                View My Products
              </Button>
            </Link>
            <Link href="/my-collections">
              <Button className="w-full" variant="outline">
                <Store className="mr-2 h-4 w-4" />
                Manage Collections
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders & Sales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/my-orders">
              <Button className="w-full" variant="outline">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View My Orders
              </Button>
            </Link>
            {vendor && (
              <Link href={`/vendors/${vendor._id}/orders`}>
                <Button className="w-full" variant="outline">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Manage Order Status
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/my-social-feed">
              <Button className="w-full" variant="outline">
                <Store className="mr-2 h-4 w-4" />
                Social Feed
              </Button>
            </Link>
            <Button className="w-full" variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Analytics (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Sales Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={salesData} />
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Dashboard Component with Enhanced Features
const AdminDashboard = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Enhanced admin-specific data
  const [vendorStats, setVendorStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    suspended: 0,
    rejected: 0
  });
  const [appealStats, setAppealStats] = useState({
    total: 0,
    pending: 0,
    responded: 0
  });
  const [urgentNotifications, setUrgentNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Minimum loading time to prevent flicker
      const startTime = Date.now();
      const minLoadingTime = 800; // 800ms minimum

      try {
        // Get real platform statistics
        const [platformStatsRes, salesChartRes] = await Promise.all([
          fetch("/api/dashboard/stats"), // Real platform stats
          fetch("/api/dashboard/sales-chart"), // Real sales chart data
        ]);

        // Process platform stats
        if (platformStatsRes.ok) {
          const platformStats = await platformStatsRes.json();
          setTotalRevenue(platformStats.totalRevenue);
          setTotalOrders(platformStats.totalOrders);
          setTotalCustomers(platformStats.totalCustomers);
        }

        // Process sales chart data
        if (salesChartRes.ok) {
          const salesData = await salesChartRes.json();
          setSalesData(salesData);
        }

        // Fetch vendor statistics
        const vendorsRes = await fetch("/api/vendors");
        if (vendorsRes.ok) {
          const vendorsData = await vendorsRes.json();
          const newVendorStats = {
            total: vendorsData.length,
            pending: vendorsData.filter((v: VendorType) => v.status === "pending").length,
            approved: vendorsData.filter((v: VendorType) => v.status === "approved").length,
            suspended: vendorsData.filter((v: VendorType) => v.status === "suspended").length,
            rejected: vendorsData.filter((v: VendorType) => v.status === "rejected").length
          };
          setVendorStats(newVendorStats);

          // Fetch appeals statistics
          const appealsRes = await fetch("/api/appeals");
          if (appealsRes.ok) {
            const appealsData = await appealsRes.json();
            const pendingAppeals = appealsData.filter((v: VendorType) => 
              v.appealSubmitted && !v.appealResponse
            ).length;
            const respondedAppeals = appealsData.filter((v: VendorType) => 
              v.appealResponse
            ).length;
            
            setAppealStats({
              total: appealsData.length,
              pending: pendingAppeals,
              responded: respondedAppeals
            });

            // Generate urgent notifications
            const notifications = [];
            
            if (newVendorStats.pending > 0) {
              notifications.push({
                type: "warning",
                title: "Pending Vendor Applications",
                message: `${newVendorStats.pending} vendor application${newVendorStats.pending > 1 ? 's' : ''} awaiting review`,
                action: "Review Applications",
                link: "/vendors"
              });
            }

            if (pendingAppeals > 0) {
              notifications.push({
                type: "error",
                title: "Pending Appeals",
                message: `${pendingAppeals} suspension appeal${pendingAppeals > 1 ? 's' : ''} require admin response`,
                action: "Review Appeals", 
                link: "/appeals"
              });
            }

            if (newVendorStats.suspended > 3) {
              notifications.push({
                type: "warning",
                title: "High Suspension Rate",
                message: `${newVendorStats.suspended} vendors currently suspended. Consider reviewing policies.`,
                action: "View Suspended",
                link: "/vendors"
              });
            }

            setUrgentNotifications(notifications);
          }
        }
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        // Ensure minimum loading time to prevent flicker
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-heading2-bold">Super Admin Dashboard</p>
          <p className="text-grey-1 mt-1">Platform overview and management center</p>
        </div>
      </div>
      
      <Separator className="bg-grey-1 my-5" />

      {/* Urgent Notifications */}
      {urgentNotifications.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            Urgent Notifications
          </h3>
          <div className="grid gap-4">
            {urgentNotifications.map((notification, index) => (
              <Card key={index} className={`border-l-4 ${
                notification.type === 'error' ? 'border-red-500 bg-red-50' : 
                notification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 
                'border-blue-500 bg-blue-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                      <p className="text-gray-600 text-sm">{notification.message}</p>
                    </div>
                    <Link href={notification.link}>
                      <Button 
                        size="sm" 
                        className={
                          notification.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                          notification.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                          'bg-blue-600 hover:bg-blue-700'
                        }
                      >
                        {notification.action}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              Platform-wide revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              All platform orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All vendor accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Management Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Vendor Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Pending Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-yellow-600">{vendorStats.pending}</span>
                  {vendorStats.pending > 0 && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Approved & Active</span>
                </div>
                <span className="font-semibold text-green-600">{vendorStats.approved}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Suspended</span>
                </div>
                <span className="font-semibold text-gray-600">{vendorStats.suspended}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Rejected</span>
                </div>
                <span className="font-semibold text-red-600">{vendorStats.rejected}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Appeals Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Pending Appeals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-yellow-600">{appealStats.pending}</span>
                  {appealStats.pending > 0 && (
                    <Link href="/appeals">
                      <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                        Review Now
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Responded</span>
                </div>
                <span className="font-semibold">{appealStats.responded}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Total Suspended</span>
                </div>
                <span className="font-semibold">{appealStats.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/vendors">
              <Button className="w-full" variant="outline">
                <Store className="mr-2 h-4 w-4" />
                Manage Vendors
              </Button>
            </Link>
            <Link href="/appeals">
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Review Appeals
              </Button>
            </Link>
            <Link href="/orders">
              <Button className="w-full" variant="outline">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View Orders
              </Button>
            </Link>
            <Link href="/customers">
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Customer Management
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Sales Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={salesData} />
        </CardContent>
      </Card>
    </div>
  );
};

// Main Component
export default function Home() {
  const { user, isLoaded } = useUser();
  const { role, loading: roleLoading } = useRole();
  const [mounted, setMounted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Add a small delay to ensure smooth loading transition
    const timer = setTimeout(() => {
      setInitialLoadComplete(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking authentication and initial setup
  if (!mounted || !isLoaded || roleLoading || !initialLoadComplete) {
    return <Loader />;
  }

  // Show landing page if user is not authenticated
  if (!user) {
    return <LandingPageContent />;
  }

  // Show landing page for regular users (they'll be redirected to vendor application by RoleGuard)
  if (role === "user") {
    return <LandingPageContent />;
  }

  // Show vendor dashboard for vendors
  if (role === "vendor") {
    return <VendorDashboard />;
  }

  // Show admin dashboard for admins
  if (role === "admin") {
    return <AdminDashboard />;
  }

  // Fallback
  return <LandingPageContent />;
}