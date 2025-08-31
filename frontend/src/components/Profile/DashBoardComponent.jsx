import  { useState, useEffect} from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
 PieChart, Pie, Cell
} from 'recharts';
import { 
  Link, Eye, EyeOff, MousePointer, TrendingUp,  Globe,
  Copy, ExternalLink, MoreVertical, Plus, Search, Filter,
  X, Lock,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { getUrlsStats } from '../../api/url';
import { createAdvancedUrl } from '../../api/url';
import { getQrCodeForShortUrl } from '../../api/url';
import { updateShortUrl } from '../../api/url';
import { getUserUrlAnalytics } from '../../api/url';
// Handler to open short URL in new tab
const handleOpenUrl = (shortUrl) => {
  window.open(shortUrl, '_blank');
};

// Handler to delete URL (mock, replace with API call)
const handleDeleteUrl = (id) => {
  setRecentUrls(urls => urls.filter(url => url.id !== id));
  toast.success('URL deleted!', { position: 'top-center' });
  // For real API: await deleteUrlApi(id); and refresh list
};
import { toast } from 'react-toastify';


const DashboardComponent = () => {
  const [qrModal, setQrModal] = useState({ open: false, qr: '', url: '' });
  const [menuOpenId, setMenuOpenId] = useState(null);
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
  const [showAllUrls, setShowAllUrls] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    originalUrl: '',
    customAlias: '',
    expirationDate: '',
    password: ''
  });

  // Analytics state
  const [clicksData, setClicksData] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);

  const [recentUrls, setRecentUrls] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [urlsError, setUrlsError] = useState(null);
  const [revealedPwId, setRevealedPwId] = useState(null);
  const [urls, setUrls] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  // Click rate: average clicks per URL
  const clickRate = urls > 0 ? (totalClicks / urls).toFixed(2) : 0;
  
  useEffect(() => {
    let mounted = true;
    async function fetchUrls() {
      setLoadingUrls(true);
      setUrlsError(null);
      try {
        const res = await getUrlsStats();
        setUrls(res.length);
        // Update localStorage 'user' key with urlCount
        try {
          const user = JSON.parse(localStorage.getItem('user')) || {};
          user.urlCount = Array.isArray(res) ? res.length : (res.data?.length || 0);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {}
        const mapped = (Array.isArray(res) ? res : (res.data || [])).map((item, idx) => {
          let isExpired = false;
          const hasExpiry = item.expireAt != null;
          if (hasExpiry) {
            const parts = item.expireAt.split('/');
            if (parts.length === 3) {
              // DD/MM/YYYY
              const expireDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // YYYY-MM-DD
              isExpired = expireDate < new Date();
            }
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
        toast.error('Failed to load URLs', { position: 'top-center', autoClose: 3000 });
        if (mounted) setUrlsError('Failed to load URLs');
      } finally {
        if (mounted) setLoadingUrls(false);
      }
    }
    
    async function fetchAnalytics() {
      try {
        const res = await getUserUrlAnalytics();        
        // Generate last 7 days array
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        let days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          days.push({ key, label: dayNames[d.getDay()] });
        }
        
        let clicksByDay = days.map(day => ({ date: day.label, clicks: 0 }));
        let countryMap = {};
        let visitorSum = 0;
        
        // Process the response
        if (res && Array.isArray(res.urls)) {
          res.urls.forEach(url => {
            // Process clicks by day
            if (url.clicksByDay && typeof url.clicksByDay === 'object') {
              Object.entries(url.clicksByDay).forEach(([dateKey, clicks]) => {
                // Find matching day in our 7-day array
                const dayIndex = days.findIndex(day => day.key === dateKey);
                if (dayIndex !== -1) {
                  clicksByDay[dayIndex].clicks += clicks;
                }
              });
            }
            
            // Process country stats
            if (url.countryStats && typeof url.countryStats === 'object') {
              Object.entries(url.countryStats).forEach(([country, count]) => {
                countryMap[country] = (countryMap[country] || 0) + count;
              });
            }
            
            // Add unique visitors
            if (typeof url.uniqueVisitorCount === 'number') {
              visitorSum += url.uniqueVisitorCount;
            }
          });
        }
        
        // Convert country stats to array and get top 5
        const sortedCountries = Object.entries(countryMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
          
        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#6B7280'];
        const topCountriesArr = sortedCountries.map(([name, value], idx) => ({
          name,
          value,
          color: colors[idx % colors.length]
        }));
        
        console.log('Processed Analytics Data:', {
          clicksByDay,
          topCountriesArr,
          visitorSum
        }); // Debug log
        
        if (mounted) {
          setClicksData(clicksByDay);
          setTopCountries(topCountriesArr);
          setUniqueVisitors(visitorSum);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        // Set default values on error
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const defaultClicksData = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          defaultClicksData.push({
            date: dayNames[d.getDay()],
            clicks: 0
          });
        }
        
        if (mounted) {
          setClicksData(defaultClicksData);
          setTopCountries([]);
          setUniqueVisitors(0);
        }
      }
    }
    
    fetchUrls();
    fetchAnalytics();
    return () => { mounted = false; };
  }, []);

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
  toast.success('Short URL copied!', { position: 'top-center', autoClose: 2000 });
  };

  const toggleReveal = (id) => {
    setRevealedPwId(prev => prev === id ? null : id);
  };

  const copyPassword = (pw) => {
    if (!pw) return;
    navigator.clipboard.writeText(pw);
  toast.success('Password copied!', { position: 'top-center', autoClose: 2000 });
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
    // Prepare payload for advanced API
    const payload = {
      alias: formData.customAlias || undefined,
      redirectUrl: formData.originalUrl,
      password: formData.passwordProtection ? formData.password : undefined,
      expireAt: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : undefined,
      qr: true,
    };
    createAdvancedUrl(payload)
      .then((res) => {
        toast.success(res.message || 'Custom URL created!', { position: 'top-center' });
        // Optionally show QR code if present
        if (res.url && res.url.qrCode) {
          // You can display the QR code in a modal or toast
          toast.info('QR code generated!', { position: 'top-center' });
        }
        handleModalClose();
        // Optionally refresh dashboard URLs
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to create custom URL', { position: 'top-center' });
      });
  };
  const StatCard = ({ icon: Icon, title, value,  color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
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
    color: PropTypes.string
  };
  const handleViewQrCode = async (shortId) => {
    setQrModal({ open: true, qr: '', url: shortId });
    setQrLoading(true);
    try {
      const res = await getQrCodeForShortUrl(shortId);
      if (res && res.qrCode) {
        setQrModal({ open: true, qr: res.qrCode, url: shortId });
      } else {
        toast.error('QR code not found', { position: 'top-center', autoClose: 3000 });
        setQrModal({ open: false, qr: '', url: '' });
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        toast.error('URL not found', { position: 'top-center', autoClose: 3000 });
      } else {
        toast.error('Failed to fetch QR code', { position: 'top-center', autoClose: 3000 });
      }
      setQrModal({ open: false, qr: '', url: '' });
    } finally {
      setQrLoading(false);
    }
  };

  const handleOpenUpdateModal = (url) => {
    setUpdateFormData(url);
    setShowUpdateModal(true);
  };

  const handleUpdateModalClose = () => {
    setShowUpdateModal(false);
    setUpdateFormData(null);
  };

  useEffect(() => {
    if (showUpdateModal && updateFormData) {
      setUpdateForm({
        originalUrl: updateFormData.originalUrl || '',
        customAlias: updateFormData.shortUrl || '',
        expirationDate: '', // Always empty for update
        password: updateFormData.password || ''
      });
      toast.info('Expiration date field is intentionally left empty. Set a new date if you want to update it.', {
        position: 'top-center',
        autoClose: 3500,
        style: { minWidth: '400px', maxWidth: '600px', fontSize: '1rem' }
      });
    }
  }, [showUpdateModal, updateFormData]);

  const handleUpdateFormChange = (field, value) => {
    setUpdateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    if (updateForm.originalUrl) payload.redirectUrl = updateForm.originalUrl;
    if (updateForm.customAlias) payload.alias = updateForm.customAlias;
    if (updateForm.expirationDate) {
      const dateObj = new Date(updateForm.expirationDate);
      if (!isNaN(dateObj.getTime())) {
        payload.expireAt = dateObj.toISOString();
      }
    }
    // If password is empty string, send null
    payload.password = updateForm.password ? updateForm.password : null;
    try {
      const res = await updateShortUrl(updateFormData.shortUrl, payload);
      toast.success(res.message || 'Short URL updated!', { position: 'top-center' });
      setShowUpdateModal(false);
      setUpdateFormData(null);
      // Optionally refresh dashboard URLs here
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update short URL', { position: 'top-center' });
    }
  };

  // Utility to format DD/MM/YYYY to readable date
  function formatDate(dateStr) {
    if (!dateStr) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's whats happening with your URLs.</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
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
            color="blue"
          />
          <StatCard
            icon={MousePointer}
            title="Total Clicks"
            value={totalClicks}
            color="green"
          />
          <StatCard
            icon={Eye}
            title="Unique Visitors"
            value={uniqueVisitors}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Click Rate"
            value={clickRate}
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Clicks Over Time */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Clicks Over Time</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={clicksData} margin={{ top: 24, right: 32, left: 0, bottom: 16 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.08" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fill: '#334155', fontSize: 15, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#334155', fontSize: 15, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip
                  wrapperStyle={{ borderRadius: 14, boxShadow: '0 6px 32px rgba(0,0,0,0.10)', background: '#fff', border: '1px solid #e5e7eb', padding: 12 }}
                  labelStyle={{ color: '#6366f1', fontWeight: 700, fontSize: 16 }}
                  itemStyle={{ color: '#334155', fontSize: 15 }}
                  content={({ active, payload, label }) =>
                    active && payload && payload.length ? (
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-[120px]">
                        <div className="font-semibold text-blue-600 mb-1">{label}</div>
                        <div className="text-lg font-bold text-gray-800">{payload[0].value} Clicks</div>
                      </div>
                    ) : null
                  }
                />
                <Bar
                  dataKey="clicks"
                  fill="url(#barGradient)"
                  radius={[10, 10, 0, 0]}
                  barSize={28}
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  background={{ fill: '#f3f4f6' }}
                  filter="url(#barShadow)"
                  isAnimationActive={true}
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Countries */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Countries</h3>
            {topCountries.length > 0 ? (
              <>
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
                      <span className="text-sm font-medium">{country.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No country data available</p>
                </div>
              </div>
            )}
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
          <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
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
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading URLs...</td>
                  </tr>
                ) : urlsError ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-red-500">{urlsError}</td>
                  </tr>
                ) : recentUrls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No URLs found</td>
                  </tr>
                ) : (
                  (showAllUrls ? recentUrls : recentUrls.slice(0, 10))
                    .filter(url => {
                      const term = searchTerm.trim().toLowerCase();
                      if (!term) return true;
                      return (
                        url.originalUrl?.toLowerCase().includes(term) ||
                        url.shortUrl?.toLowerCase().includes(term)
                      );
                    })
                    .map((url) => (
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
                        {formatDate(url.createdAt)}
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
                            </span><button
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
                      <div className="flex items-center gap-2 relative">
                        <button className="text-gray-400 hover:text-gray-600" title="Open Short URL" onClick={() => handleOpenUrl(url.shortUrl)}>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600" title="More" onClick={() => setMenuOpenId(menuOpenId === url.id ? null : url.id)}>
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {menuOpenId === url.id && (
                          <div className="absolute right-0 top-8 z-20 bg-white border rounded-lg shadow-lg py-2 w-40">
                            <button
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700"
                              onClick={() => { handleViewQrCode(url.shortUrl); setMenuOpenId(null); }}
                            >
                              Show QR Image
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-blue-600"
                              onClick={() => { handleOpenUpdateModal(url); setMenuOpenId(null); }}
                            >
                              Update URL
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                              onClick={() => { handleDeleteUrl(url.id); setMenuOpenId(null); }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))) }
              </tbody>
            </table>
          </div>
          {recentUrls.length > 10 && !showAllUrls && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
              <button
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow hover:from-blue-600 hover:to-purple-700 transition-all"
                onClick={() => setShowAllUrls(true)}
              >
                Show More
              </button>
            </div>
          )}
          {recentUrls.length > 10 && showAllUrls && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-300 transition-all"
                onClick={() => setShowAllUrls(false)}
              >
                Show Less
              </button>
            </div>
          )}
        </div>

        {/* QR Modal */}
        {qrModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative flex flex-col items-center w-full max-w-md border border-gray-200 animate-fadeIn">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition" onClick={() => setQrModal({ open: false, qr: '', url: '' })}>
                <X className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full shadow">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" />
                    <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 01-1-1zM16 10a1 1 0 100-2 1 1 0 000 2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM13 12a1 1 0 100-2 1 1 0 000 2zM16 16a1 1 0 100-2 1 1 0 000 2zM16 13a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">QR Code for <span className="text-blue-600">{qrModal.url}</span></h3>
              </div>
              <div className="flex flex-col items-center gap-2 mt-2">
                {qrLoading ? (
                  <span className="text-gray-500 text-base font-medium">Loading QR code...</span>
                ) : qrModal.qr ? (
                  <img src={qrModal.qr} alt="QR Code" className="w-56 h-56 rounded-xl border-2 border-blue-100 shadow-lg mb-2" />
                ) : (
                  <span className="text-gray-400 text-base font-medium">No QR code available</span>
                )}
                {qrModal.qr && (
                  <button
                    className="mt-3 px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-purple-700 font-semibold transition-all"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrModal.qr;
                      link.download = `qr-code-${qrModal.url}.png`;
                      link.click();
                    }}
                  >
                    Download QR Code
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
                          Custom
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
                <div className="grid md:grid-cols-1 gap-8">
                  {/* Security & Options */}
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

        {/* Update URL Modal */}
        {showUpdateModal && updateFormData && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-t-2xl">
                <button
                  onClick={handleUpdateModalClose}
                  className="absolute top-6 right-6 p-2 hover:bg-transparent hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-transparent bg-opacity-20 rounded-xl">
                    <Link className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Update Short URL</h2>
                    <p className="text-blue-100 mt-1">Edit your short link details</p>
                  </div>
                </div>
              </div>
              {/* Modal Body */}
              <form className="p-8 space-y-8 custom-scrollbar overflow-y-auto max-h-[80vh]" onSubmit={handleUpdateSubmit}>
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Original URL</label>
                  <input
                    type="url"
                    value={updateForm.originalUrl}
                    onChange={e => handleUpdateFormChange('originalUrl', e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  />
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Custom Alias</label>
                  <input
                    type="text"
                    value={updateForm.customAlias}
                    onChange={e => handleUpdateFormChange('customAlias', e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  />
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Expiration Date</label>
                  <input
                    type="date"
                    value={updateForm.expirationDate}
                    onChange={e => handleUpdateFormChange('expirationDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  />
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Password</label>
                  <input
                    type="password"
                    value={updateForm.password}
                    onChange={e => handleUpdateFormChange('password', e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center justify-center gap-4 pt-8 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={handleUpdateModalClose}
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
                    Update Short URL
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