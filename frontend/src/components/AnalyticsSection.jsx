import {  BarChart3, Globe, Smartphone } from 'lucide-react';

const AnalyticsSection = () => {
  const analyticsData = {
    totalClicks: 12547,
    countries: [
      { name: "United States", clicks: 4521, flag: "🇺🇸" },
      { name: "United Kingdom", clicks: 2843, flag: "🇬🇧" },
      { name: "Germany", clicks: 1976, flag: "🇩🇪" },
      { name: "Canada", clicks: 1534, flag: "🇨🇦" },
      { name: "Australia", clicks: 1673, flag: "🇦🇺" }
    ]
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Analytics Dashboard
          </h2>
          <p className="text-xl text-gray-600">
            Get detailed insights into your link performance
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">Total Clicks</h3>
              </div>
              <p className="text-4xl font-bold">{analyticsData.totalClicks.toLocaleString()}</p>
              <p className="text-blue-100 mt-2">+12% from last month</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">Mobile Traffic</h3>
              </div>
              <p className="text-4xl font-bold">68%</p>
              <p className="text-purple-100 mt-2">Desktop: 32%</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-500" />
              Top Countries
            </h3>
            <div className="space-y-4">
              {analyticsData.countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="font-medium text-gray-900">{country.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(country.clicks / analyticsData.totalClicks) * 100 * 3}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-700 w-16 text-right">
                      {country.clicks.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;