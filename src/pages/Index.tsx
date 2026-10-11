import VerificationForm from "@/components/VerificationForm";
import FaqSection from "@/components/FaqSection";
import Header from "@/components/layout/Header";
import {
  Shield,
  Lock,
  Zap,
  Globe,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Encrypted verification keeps every product check protected",
      color: "bg-blue-500",
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Authenticate products in under 3 seconds",
      color: "bg-purple-500",
    },
    {
      icon: Lock,
      title: "One-Time Access",
      description: "Each code verifies once, then locks after 60 minutes",
      color: "bg-green-500",
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Trusted worldwide by leading manufacturers",
      color: "bg-orange-500",
    },
  ];

  const stats = [
    { value: "10M+", label: "Products Verified" },
    { value: "99.9%", label: "Success Rate" },
    { value: "150+", label: "Countries" },
    { value: "<3s", label: "Avg Response Time" },
  ];

  return (
    <div className="min-h-screen bg-gradient-nexatech">
      <Header />

      {/* Hero Section */}
      <main className="container-nexatech pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-primary">
                Research Use Only
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Verify Your
              <span className="block bg-gradient-to-r from-primary via-accent to-primary-600 bg-clip-text text-transparent">
                Nexa Biotech
              </span>
              Product
            </h1>

            <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
              ALL ARTICLES AND PRODUCT INFORMATION PROVIDED ON THIS WEBSITE ARE
              FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 items-center pt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
                <FlaskConical className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Lab Grade Quality</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Highly Purified</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">Premium Standards</span>
              </div>
            </div>
          </div>

          {/* Right Column - Verification Form */}
          <div
            className="lg:pl-8 animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <VerificationForm />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 card-premium p-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Trusted Globally
            </h2>
            <p className="text-gray-600 text-lg">
              Ensure authenticity in seconds. Enter your unique serial number
              and password to verify your product is 100% genuine.
            </p>
          </div>
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-premium p-6 hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <FaqSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="container-nexatech py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-primary" />
              <span>Protected by Nexa Biotech Authentication System</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
              <p>
                For inquiries and bulk orders, please contact us at <br />
                <a
                  href="mailto:sales@nexabiotech.net"
                  className="font-bold bg-gradient-to-r from-[#002447] to-[#0062F7] bg-clip-text text-transparent opacity-80 hover:opacity-100 transition-opacity duration-300"
                >
                  sales@nexabiotech.net
                </a>
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <span>© {new Date().getFullYear()} Nexa Biotech Solutions.</span>
            <span className="hidden md:inline">•</span>
            <span>All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
