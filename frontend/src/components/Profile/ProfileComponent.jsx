import {  useState } from 'react';
import { 
  User, Mail, Lock, Camera, Save, Edit3, Shield, Bell, 
  Link2, Settings, Key, Globe,  Tag, Archive,
  Eye, EyeOff, Copy, Check, Trash2
} from 'lucide-react';
import InputField from '../InputField';
import { toast } from 'react-toastify';
import { profilepic , deleteProfile} from '../../api/user';
import { updatePassword } from '../../api/auth';




const ProfileComponent = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userInfo, setUserInfo] = useState(() => {
    const stored = localStorage.getItem('user');
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      name: parsed.name || parsed.username || null,
      email: parsed.email || parsed.gmail || null,
      bio: parsed.bio || null,
      joinDate: parsed.createdAt || null,
      avatar: parsed.photo || null,
      urlCount: parsed.urlCount || 0 
    };
  });
  const [avatarError, setAvatarError] = useState(null);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [changeForm, setChangeForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changeErrors, setChangeErrors] = useState({});
  const [isChanging, setIsChanging] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangeInput = (field) => (e) => {
    setChangeForm(prev => ({ ...prev, [field]: e.target.value }));
    if (changeErrors[field]) setChangeErrors(prev => ({ ...prev, [field]: '' }));
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (!password) return 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (password) => {
    const s = getPasswordStrength(password);
    if (s < 2) return 'bg-red-500';
    if (s < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const validateChangeForm = () => {
    const errs = {};
    if (!changeForm.currentPassword) errs.currentPassword = 'Current password is required';
    if (!changeForm.newPassword) errs.newPassword = 'New password is required';
    else if (changeForm.newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(changeForm.newPassword)) errs.newPassword = 'Password must include uppercase, lowercase, and number';
    if (!changeForm.confirmPassword) errs.confirmPassword = 'Please confirm your new password';
    else if (changeForm.newPassword !== changeForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setChangeErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePasswordSubmit = async () => {
    if (!validateChangeForm()) return;
    setIsChanging(true);
    // Placeholder: simulate API call. Replace with real endpoint when available.
     try {
      const res = await updatePassword({
        currentPassword: changeForm.currentPassword,
        newPassword: changeForm.newPassword
      });
      if (res.error) throw new Error(res.error);
      setIsChanging(false);
      toast.success('Password changed successfully');
      setIsChangeModalOpen(false);
      setChangeForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password.');
    }
  };
  
  // Delete avatar handler
  const handleDeleteAvatar = async () => {
    try {
        const res = await deleteProfile();
        if (res.error) throw new Error(res.error);
        setUserInfo(prev => ({ ...prev, avatar: null }));
        const stored = localStorage.getItem('user');
        let userObj = stored ? JSON.parse(stored) : {};
        userObj.photo = null;
        localStorage.setItem('user', JSON.stringify(userObj));
        setAvatarError(null);
        toast.success('Avatar deleted successfully!');
    } catch (error) {
        console.error('Error deleting avatar:', error);
        setAvatarError('Failed to delete avatar.');
        toast.error('Failed to delete avatar.');
    }
  };

  // Delete account (UI only - confirm then placeholder action)
  const handleDeleteAccount = () => {
    const ok = window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.');
    if (!ok) return;
    console.log('Account deletion confirmed by user (no backend call performed)');
    toast.info('Account deletion requested — backend call not implemented.');
  };

  // Avatar upload handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Only JPG, PNG, GIF, and WEBP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('File size exceeds 5MB limit.');
      return;
    }
    const reader = new FileReader();

    reader.onloadend = async () => {
      try{
        const res = await profilepic(reader.result);
        if (res.error) throw new Error(res.error);
        setUserInfo(prev => ({ ...prev, avatar: reader.result }));
        setAvatarError(null);
        // Save to localStorage under user.photo
        const stored = localStorage.getItem('user');
        let userObj = stored ? JSON.parse(stored) : {};
        userObj.photo = reader.result;
        localStorage.setItem('user', JSON.stringify(userObj));
        toast.success('Profile picture uploaded successfully!');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        toast.error('Failed to upload profile picture.');
      }
      
    };
    reader.readAsDataURL(file);
  };


 
  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log('Saving user info:', userInfo);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('sk-1234567890abcdef...');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'urls', name: 'URL Settings', icon: Link2 },
    { id: 'integration', name: 'Integration', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  // eslint-disable-next-line react/prop-types
  const TabContent = ({ tabId }) => {
    switch(tabId) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="name"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-800">{userInfo.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="email"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {userInfo.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={userInfo.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <p className="text-gray-600">{userInfo.bio}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Account Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Member since</span>
                      <span className="font-medium text-gray-800">{userInfo.joinDate}</span>
                    </div>
                    {/* <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account type</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Premium</span>
                    </div> */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">URLs created</span>
                      <span className="font-medium text-gray-800">{userInfo.urlCount }</span>
                    </div>
                    {/* <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total clicks</span>
                      <span className="font-medium text-gray-800">1,234</span>
                    </div> */}
                    {/* <div className="flex justify-between items-center">
                      <span className="text-gray-600">This month</span>
                      <span className="font-medium text-green-600">+23%</span>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Password</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Update your password to keep your account secure</p>
                <button onClick={() => setIsChangeModalOpen(true)} className="w-full bg-red-50 hover:bg-red-100 text-red-700 rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors">
                  <Lock className="w-4 h-4" />
                  Change Password
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Two-Factor Authentication</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Add an extra layer of security to your account</p>
                <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors">
                  <Shield className="w-4 h-4" />
                  Enable 2FA
                </button>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        );

      case 'urls':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">URL Management Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Branding & Organization
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Alias Prefix</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="mycompany-"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoComplete="off"
                      />
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        Save
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Add a prefix to all your short URLs</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Category</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>General</option>
                      <option>Marketing</option>
                      <option>Social Media</option>
                      <option>Documentation</option>
                      <option>Personal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Archive className="w-5 h-5" />
                  URL Behavior
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Expiration</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Never</option>
                      <option>7 days</option>
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Auto-archive expired URLs</span>
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                      
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Allow URL editing after creation</span>
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                      
        
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Auto-generate QR codes</span>
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integration':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">API & Integration</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <div className="flex gap-2">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value="sk-1234567890abcdef..."
                        readOnly
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono text-sm"
                        autoComplete="off"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleCopyApiKey}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use this API key to integrate with your applications</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit</label>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p>Current: <span className="font-medium">1,000 requests/hour</span></p>
                      <p>Used today: <span className="font-medium">247 requests</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Custom Domain
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="yourdomain.com"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoComplete="off"
                      />
                      <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                        Verify
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Add your custom domain for branded short links</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                    <input
                      type="url"
                      placeholder="https://your-api.com/webhook"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="off"
                    />
                    <p className="text-xs text-gray-500 mt-1">Receive notifications when URLs are clicked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Notification Preferences</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">URL Analytics</p>
                      <p className="text-xs text-gray-500">Weekly summary of your URL performance</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Security Alerts</p>
                      <p className="text-xs text-gray-500">Login attempts and security events</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Marketing Updates</p>
                      <p className="text-xs text-gray-500">Product updates and feature announcements</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                  </label>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Push Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">High Traffic Alerts</p>
                      <p className="text-xs text-gray-500">When a URL gets unusual traffic</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">URL Expiration</p>
                      <p className="text-xs text-gray-500">24 hours before URL expires</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">API Rate Limit</p>
                      <p className="text-xs text-gray-500">When approaching rate limits</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Avatar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative group cursor-pointer">
                {/* Main avatar container */}
                <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white transition-all duration-500 group-hover:scale-110 group-hover:shadow-3xl relative overflow-hidden">
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="Profile" className="w-28 h-28 rounded-full object-cover transition-all duration-500" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400 transition-all duration-300 group-hover:text-gray-300" />
                  )}
                  
                  {/* Hover overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                  </div>
                </div>

                {/* Floating action buttons - appear on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                  <div className="flex gap-3">
                    {/* Upload/Change button */}
                    <label className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 transition-all duration-300 transform hover:scale-110 shadow-xl cursor-pointer backdrop-blur-sm">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        autoComplete="off"
                        // accept="image/jpeg,image/png,image/jpg,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleAvatarUpload}
                      />
                    </label>
                    
                    {/* Delete button - only show if avatar exists */}
                    {userInfo.avatar && (
                      <button
                        onClick={handleDeleteAvatar}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 transition-all duration-300 transform hover:scale-110 shadow-xl backdrop-blur-sm"
                        title="Delete avatar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                {/* <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div> */}
              </div>
              {avatarError && (
                <div className="text-red-500 text-sm mt-3 bg-red-50 px-3 py-2 rounded-lg animate-pulse border border-red-200">{avatarError}</div>
              )}
            </div>
          </div>
          
          <div className="pt-20 pb-6 px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{userInfo.name}</h1>
                <p className="text-gray-600 mt-1">{userInfo.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-black ">Member since {userInfo.joinDate}</p>
                {/* <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mt-1">
                  Premium Account
                </span> */}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Update Password Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <TabContent tabId={activeTab} />
          {isChangeModalOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setIsChangeModalOpen(false)}></div>
              <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 z-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Change Password</h3>
                  <button onClick={() => setIsChangeModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <InputField
                    type="password"
                    placeholder="Current password"
                    value={changeForm.currentPassword}
                    onChange={handleChangeInput('currentPassword')}
                    icon={Lock}
                    error={changeErrors.currentPassword}
                  />

                  <InputField
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New password"
                    value={changeForm.newPassword}
                    onChange={handleChangeInput('newPassword')}
                    icon={Key}
                    error={changeErrors.newPassword}
                    showPasswordToggle={true}
                    showPassword={showNewPassword}
                    onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                  />

                  {changeForm.newPassword && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Password strength:</span>
                        <span className={`text-sm font-medium ${getPasswordStrength(changeForm.newPassword) < 2 ? 'text-red-600' : getPasswordStrength(changeForm.newPassword) < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {getPasswordStrength(changeForm.newPassword) < 2 ? 'Weak' : getPasswordStrength(changeForm.newPassword) < 4 ? 'Medium' : 'Strong'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(changeForm.newPassword)}`} style={{ width: `${(getPasswordStrength(changeForm.newPassword) / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  )}

                  <InputField
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={changeForm.confirmPassword}
                    onChange={handleChangeInput('confirmPassword')}
                    icon={Lock}
                    error={changeErrors.confirmPassword}
                    showPasswordToggle={true}
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  />

                  <div className="flex justify-center pt-2">
                    {/* <button onClick={() => setIsChangeModalOpen(false)} className="mr-3 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button> */}
                    <button onClick={handleChangePasswordSubmit} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white ">{isChanging ? 'Updating...' : 'Update'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;