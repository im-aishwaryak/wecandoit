import React, { useState } from 'react';
import { Search, Upload, Package, CheckCircle, Clock, MapPin, Tag } from 'lucide-react';

export default function LostAndFoundSite() {
  const [currentPage, setCurrentPage] = useState('home');
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Blue Backpack',
      category: 'Bags',
      location: 'Library',
      date: '2025-10-15',
      description: 'Navy blue backpack with front pocket',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      finder: 'Anonymous'
    },
    {
      id: 2,
      name: 'AirPods Case',
      category: 'Electronics',
      location: 'Gym',
      date: '2025-10-16',
      description: 'White AirPods Pro case',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
      finder: 'Anonymous'
    },
    {
      id: 3,
      name: 'Calculator',
      category: 'School Supplies',
      location: 'Math Building',
      date: '2025-10-14',
      description: 'TI-84 Plus graphing calculator',
      status: 'claimed',
      image: 'https://images.unsplash.com/photo-1611329857570-f02f340e7378?w=400',
      finder: 'Anonymous'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [adminView, setAdminView] = useState(false);

  const categories = ['Bags', 'Electronics', 'Clothing', 'School Supplies', 'Sports Equipment', 'Accessories', 'Other'];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory && (!adminView || item.status === 'available');
  });

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">School Lost & Found</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-indigo-600 font-medium">Home</button>
            <button onClick={() => setCurrentPage('browse')} className="text-gray-700 hover:text-indigo-600 font-medium">Browse Items</button>
            <button onClick={() => setCurrentPage('report')} className="text-gray-700 hover:text-indigo-600 font-medium">Report Found</button>
            <button onClick={() => setCurrentPage('admin')} className="text-gray-700 hover:text-indigo-600 font-medium">Admin</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">Lost Something?</h2>
          <p className="text-xl text-gray-600">We're here to help reunite you with your belongings</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <Search className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Search Items</h3>
            <p className="text-gray-600">Browse through found items to find what you're looking for</p>
            <button onClick={() => setCurrentPage('browse')} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Browse Now
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <Upload className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Found Something?</h3>
            <p className="text-gray-600">Report items you've found to help others</p>
            <button onClick={() => setCurrentPage('report')} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              Report Item
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <CheckCircle className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Claim Your Item</h3>
            <p className="text-gray-600">Found your item? Submit a claim to get it back</p>
            <button onClick={() => setCurrentPage('browse')} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
              Start Claim
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6">Recent Success Stories</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-gray-700 italic">"Found my laptop within 2 days! Thank you to whoever turned it in!"</p>
              <p className="text-sm text-gray-500 mt-2">- Senior, Class of 2026</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-gray-700 italic">"Lost my keys and they were here the next day. This system is amazing!"</p>
              <p className="text-sm text-gray-500 mt-2">- Junior, Class of 2027</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-xl shadow-lg px-12 py-6">
            <p className="text-4xl font-bold text-indigo-600 mb-2">{items.filter(i => i.status === 'claimed').length}</p>
            <p className="text-gray-600">Items Successfully Reunited</p>
          </div>
        </div>
      </div>
    </div>
  );

  const BrowsePage = () => (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">School Lost & Found</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-indigo-600 font-medium">Home</button>
            <button onClick={() => setCurrentPage('browse')} className="text-indigo-600 font-medium">Browse Items</button>
            <button onClick={() => setCurrentPage('report')} className="text-gray-700 hover:text-indigo-600 font-medium">Report Found</button>
            <button onClick={() => setCurrentPage('admin')} className="text-gray-700 hover:text-indigo-600 font-medium">Admin</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Browse Found Items</h2>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  {item.status === 'claimed' && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Claimed</span>
                  )}
                  {item.status === 'available' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Available</span>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Found at: {item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{item.description}</p>
                {item.status === 'available' && (
                  <button
                    onClick={() => setCurrentPage('claim')}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Claim This Item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No items found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );

  const ReportPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      category: 'Other',
      location: '',
      description: '',
      finderName: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newItem = {
        id: items.length + 1,
        name: formData.name,
        category: formData.category,
        location: formData.location,
        date: new Date().toISOString().split('T')[0],
        description: formData.description,
        status: 'available',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
        finder: formData.finderName || 'Anonymous'
      };
      setItems([...items, newItem]);
      alert('Item reported successfully! Thank you for helping out.');
      setFormData({ name: '', category: 'Other', location: '', description: '', finderName: '' });
      setCurrentPage('browse');
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">School Lost & Found</h1>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-indigo-600 font-medium">Home</button>
              <button onClick={() => setCurrentPage('browse')} className="text-gray-700 hover:text-indigo-600 font-medium">Browse Items</button>
              <button onClick={() => setCurrentPage('report')} className="text-indigo-600 font-medium">Report Found</button>
              <button onClick={() => setCurrentPage('admin')} className="text-gray-700 hover:text-indigo-600 font-medium">Admin</button>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Report a Found Item</h2>
            <p className="text-gray-600 mb-8">Help someone find their lost item by reporting what you found!</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  placeholder="e.g., Blue Water Bottle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Found *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  placeholder="e.g., Library 2nd Floor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  rows="4"
                  placeholder="Provide details to help the owner identify their item..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name (Optional)</label>
                <input
                  type="text"
                  value={formData.finderName}
                  onChange={(e) => setFormData({...formData, finderName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  placeholder="Leave blank to remain anonymous"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
              >
                Submit Found Item
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const ClaimPage = () => {
    const [claimData, setClaimData] = useState({
      itemId: '',
      name: '',
      email: '',
      phone: '',
      description: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      alert('Claim submitted! The lost & found coordinator will contact you soon to verify your claim.');
      setCurrentPage('home');
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">School Lost & Found</h1>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-indigo-600 font-medium">Home</button>
              <button onClick={() => setCurrentPage('browse')} className="text-gray-700 hover:text-indigo-600 font-medium">Browse Items</button>
              <button onClick={() => setCurrentPage('report')} className="text-gray-700 hover:text-indigo-600 font-medium">Report Found</button>
              <button onClick={() => setCurrentPage('admin')} className="text-gray-700 hover:text-indigo-600 font-medium">Admin</button>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Claim an Item</h2>
            <p className="text-gray-600 mb-8">Fill out this form to claim your item. We'll verify your claim and contact you.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item You're Claiming *</label>
                <select
                  required
                  value={claimData.itemId}
                  onChange={(e) => setClaimData({...claimData, itemId: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="">Select an item...</option>
                  {items.filter(i => i.status === 'available').map(item => (
                    <option key={item.id} value={item.id}>{item.name} - {item.location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                <input
                  type="text"
                  required
                  value={claimData.name}
                  onChange={(e) => setClaimData({...claimData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={claimData.email}
                  onChange={(e) => setClaimData({...claimData, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={claimData.phone}
                  onChange={(e) => setClaimData({...claimData, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details *</label>
                <textarea
                  required
                  value={claimData.description}
                  onChange={(e) => setClaimData({...claimData, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  rows="4"
                  placeholder="Describe something unique about the item to verify ownership..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Please provide accurate verification details. You may be asked additional questions to confirm ownership.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg"
              >
                Submit Claim
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const AdminPage = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">School Lost & Found</h1>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-indigo-600 font-medium">Home</button>
              <button onClick={() => setCurrentPage('browse')} className="text-gray-700 hover:text-indigo-600 font-medium">Browse Items</button>
              <button onClick={() => setCurrentPage('report')} className="text-gray-700 hover:text-indigo-600 font-medium">Report Found</button>
              <button onClick={() => setCurrentPage('admin')} className="text-indigo-600 font-medium">Admin</button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Items</p>
              <p className="text-3xl font-bold text-indigo-600">{items.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Available</p>
              <p className="text-3xl font-bold text-blue-600">{items.filter(i => i.status === 'available').length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Claimed</p>
              <p className="text-3xl font-bold text-green-600">{items.filter(i => i.status === 'claimed').length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">This Week</p>
              <p className="text-3xl font-bold text-purple-600">{items.filter(i => new Date(i.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Manage Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'available' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            const updated = items.map(i =>
                              i.id === item.id ? {...i, status: i.status === 'available' ? 'claimed' : 'available'} : i
                            );
                            setItems(updated);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-4"
                        >
                          {item.status === 'available' ? 'Mark Claimed' : 'Mark Available'}
                        </button>
                        <button
                          onClick={() => setItems(items.filter(i => i.id !== item.id))}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'browse' && <BrowsePage />}
      {currentPage === 'report' && <ReportPage />}
      {currentPage === 'claim' && <ClaimPage />}
      {currentPage === 'admin' && <AdminPage />}
    </>
  );
}