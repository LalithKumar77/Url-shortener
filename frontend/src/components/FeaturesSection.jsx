import {  Shield, Clock, BarChart3, User, Zap, QrCode } from 'lucide-react';


const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Password Protection",
      description: "Add passwords to restrict access and keep your links secure"
    },
    {
      icon: Clock,
      title: "Expiry Dates",
      description: "Auto-expire URLs by time or clicks for better control"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track location, device, and click data in real-time"
    },
    {
      icon: User,
      title: "Custom Aliases",
      description: "Make URLs branded like my.site/event for consistency"
    },
    {
      icon: Zap,
      title: "Bulk Shortening",
      description: "Shorten 100+ URLs in one click for efficiency"
    },
    {
      icon: QrCode,
      title: "QR Code Generator",
      description: "Share your links offline via QR codes instantly"
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Our URL Shortener?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features that make link management effortless and insightful
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;