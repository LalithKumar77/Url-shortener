import  { useState, useEffect} from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
 PieChart, Pie, Cell
} from 'recharts';
import { 
  Link, Eye, EyeOff, MousePointer, TrendingUp,  Globe,
  Copy, ExternalLink, MoreVertical, Plus, Search, Filter,
  X, Lock, Calendar as Tag,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { getUrlsStats } from '../../api/url';


const DashboardComponent = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    originalUrl: '',
    customAlias: '',
    expirationDate: '',
    passwordProtection: false,
    password: '',
    category: 'general',
    description: ''
  });

  // Sample data
  const clicksData = [
    { date: 'Mon', clicks: 45 },
    { date: 'Tue', clicks: 52 },
    { date: 'Wed', clicks: 38 },
    { date: 'Thu', clicks: 67 },
    { date: 'Fri', clicks: 84 },
    { date: 'Sat', clicks: 93 },
    { date: 'Sun', clicks: 76 }
  ];

  const topCountries = [
    { name: 'United States', value: 45, color: '#3B82F6' },
    { name: 'United Kingdom', value: 25, color: '#8B5CF6' },
    { name: 'Canada', value: 15, color: '#10B981' },
    { name: 'Germany', value: 10, color: '#F59E0B' },
    { name: 'Others', value: 5, color: '#6B7280' }
  ];

  const [recentUrls, setRecentUrls] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [urlsError, setUrlsError] = useState(null);
  const [revealedPwId, setRevealedPwId] = useState(null);
  const [urls, setUrls] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  useEffect(() => {
    let mounted = true;
    const fetchUrls = async () => {
      setLoadingUrls(true);
      setUrlsError(null);
      try {
        const res = await getUrlsStats();
        setUrls(res.length);
        const mapped = (Array.isArray(res) ? res : (res.data || [])).map((item, idx) => {
          // console.log(item.createdAt);
          let isExpired = false;
          const hasExpiry = item.expireAt != null;
          if (hasExpiry) {
            const expireTs = Date.parse(item.expireAt);
            isExpired = !isNaN(expireTs) ? expireTs < Date.now() : false;
          }
          const count = Array.isArray(item.history) ? item.history.length : 0;
          setTotalClicks(prevCount => prevCount + count);
          return {
            id: item.shortId || item.id || idx,
            originalUrl: item.redirectUrl || '',
            shortUrl: item.shortId || '',
            clicks: Array.isArray(item.history) ? item.history.length : 0,
            createdAt: item.createdAt || '',
            status: isExpired ? 'expired' : 'active',
            expireAt: hasExpiry ? item.expireAt : null,
            passwordProtected: !!item.passwordProtected,  
            password: item.password || ''
          };
        });
        if (mounted) setRecentUrls(mapped);
      } catch (err) {
        console.error('Error fetching recent urls', err);
        if (mounted) setUrlsError('Failed to load URLs');
      } finally {
        if (mounted) setLoadingUrls(false);
      }
    };

    fetchUrls();
    return () => { mounted = false; };
  }, []);

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    // You would typically show a toast notification here
  };

  const toggleReveal = (id) => {
    setRevealedPwId(prev => prev === id ? null : id);
  };

  const copyPassword = (pw) => {
    if (!pw) return;
    navigator.clipboard.writeText(pw);
    // optionally show toast
  };

  const handleCreateUrl = () => {
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setFormData({
      originalUrl: '',
      customAlias: '',
      expirationDate: '',
      passwordProtection: false,
      password: '',
      category: 'general',
      description: ''
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would submit the form data to your backend
    console.log('Creating URL with data:', formData);
    handleModalClose();
  };
  const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4" />
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value.toLocaleString()}</h3>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
    </div>
  );

  StatCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    change: PropTypes.number,
    color: PropTypes.string
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here&appos;s whats happening with your URLs.</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button 
              onClick={handleCreateUrl}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create URL
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Link}
            title="Total URLs"
            value={urls}
            change={12}
            color="blue"
          />
          <StatCard
            icon={MousePointer}
            title="Total Clicks"
            value={totalClicks}
            change={8}
            color="green"
          />
          <StatCard
            icon={Eye}
            title="Unique Visitors"
            value={892}
            change={-2}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Click Rate"
            value={26.3}
            change={5}
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Clicks Over Time */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Clicks Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clicksData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Countries */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Countries</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={topCountries}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {topCountries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {topCountries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: country.color }}
                    ></div>
                    <span className="text-sm text-gray-700">{country.name}</span>
                  </div>
                  <span className="text-sm font-medium">{country.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent URLs Table */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent URLs</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search URLs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-160">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingUrls ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading URLs...</td>
                  </tr>
                ) : urlsError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-red-500">{urlsError}</td>
                  </tr>
                ) : recentUrls.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No URLs found</td>
                  </tr>
                ) : (
                  recentUrls.map((url) => (
                  <tr key={url.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate max-w-xs">
                          {url.originalUrl}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-600">
                          {url.shortUrl}
                        </span>
                        <button
                          onClick={() => handleCopyUrl(url.shortUrl)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{url.clicks}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {url.createdAt}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          url.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {url.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {url.passwordProtected ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-gray-800">
                              {revealedPwId === url.id && url.password ? url.password : '••••••'}
                            </span>
                            <button
                              onClick={() => url.password ? toggleReveal(url.id) : null}
                              type="button"
                              aria-label={revealedPwId === url.id ? 'Hide password' : 'Show password'}
                              title={url.password ? (revealedPwId === url.id ? 'Hide password' : 'Show password') : 'Password not provided by backend'}
                              className={`p-1 ${url.password ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
                              disabled={!url.password}
                            >
                              {revealedPwId === url.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => url.password ? copyPassword(url.password) : null}
                              type="button"
                              aria-label="Copy password"
                              title={url.password ? 'Copy password' : 'Password not provided by backend'}
                              className={`p-1 ${url.password ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
                              disabled={!url.password}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))) }
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          </div>
        </div>

        {/* Create URL Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-t-2xl">
                <button
                  onClick={handleModalClose}
                  className="absolute top-6 right-6 p-2 hover:bg-transparent hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-transparent bg-opacity-20 rounded-xl">
                    <Link className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Create Short URL</h2>
                    <p className="text-blue-100 mt-1">Transform your long URLs into powerful short links</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8 custom-scrollbar overflow-y-auto max-h-[80vh]">
                {/* Main URL Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    URL Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Original URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={formData.originalUrl}
                        onChange={(e) => handleFormChange('originalUrl', e.target.value)}
                        placeholder="https://example.com/your-very-long-url-goes-here"
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Custom Short Link (Optional)
                      </label>
                      <div className="flex items-stretch">
                        <div className="px-5 py-4 bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-medium flex items-center">
                          short.ly/
                        </div>
                        <input
                          type="text"
                          value={formData.customAlias}
                          onChange={(e) => handleFormChange('customAlias', e.target.value)}
                          placeholder="my-awesome-link"
                          className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-r-xl focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2 ml-1">Leave empty for auto-generated alias</p>
                    </div>
                  </div>
                </div>

                {/* Settings Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Basic Settings */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-green-600" />
                        Organization
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Category
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => handleFormChange('category', e.target.value)}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:ring-opacity-20 focus:border-green-500 transition-all duration-200 text-gray-700 bg-white"
                          >
                            <option value="general">📋 General</option>
                            <option value="marketing">📢 Marketing</option>
                            <option value="social">📱 Social Media</option>
                            <option value="documentation">📚 Documentation</option>
                            <option value="personal">👤 Personal</option>
                            <option value="business">💼 Business</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Description (Optional)
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                            placeholder="Add a note about this URL..."
                            rows="3"
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:ring-opacity-20 focus:border-green-500 transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Advanced Settings */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-purple-600" />
                        Security & Options
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Password Protection */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-gray-700">
                              Password Protection
                            </label>
                            <button
                              type="button"
                              onClick={() => handleFormChange('passwordProtection', !formData.passwordProtection)}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                                formData.passwordProtection 
                                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg' 
                                  : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                  formData.passwordProtection ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          
                          {formData.passwordProtection && (
                            <div className="bg-white bg-opacity-50 rounded-xl p-4 border border-purple-200">
                              <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleFormChange('password', e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500 focus:ring-opacity-20 focus:border-purple-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                                required={formData.passwordProtection}
                              />
                              <p className="text-xs text-purple-600 mt-2 font-medium">Visitors will need this password to access the URL</p>
                            </div>
                          )}
                        </div>

                        {/* Expiration Date */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Expiration Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={formData.expirationDate}
                            onChange={(e) => handleFormChange('expirationDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500 focus:ring-opacity-20 focus:border-purple-500 transition-all duration-200 text-gray-700"
                          />
                        </div>

                        {/* QR Code Option */}
                        <div className="bg-white bg-opacity-50 rounded-xl p-4 border border-purple-200">
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" />
                                  <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 01-1-1zM16 10a1 1 0 100-2 1 1 0 000 2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM13 12a1 1 0 100-2 1 1 0 000 2zM16 16a1 1 0 100-2 1 1 0 000 2zM16 13a1 1 0 100-2 1 1 0 000 2z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-gray-700">Generate QR Code</span>
                                <p className="text-xs text-gray-500">Auto-create QR code for sharing</p>
                              </div>
                            </div>
                            <input 
                              type="checkbox" 
                              className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2" 
                              defaultChecked 
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-center gap-4 pt-8 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                  >
                    <Link className="w-5 h-5" />
                    Create Short URL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardComponent;