'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { getProducts, createProduct } from '@/api/products';
import { uploadFiles } from '@/api/upload';

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'Light Roast',
    price: '',
    stock: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await getProducts({ limit: 50 });
      setProducts(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrls: string[] = [];
      
      // Upload images to S3 first
      if (files.length > 0) {
        const uploadRes = await uploadFiles(files);
        imageUrls = uploadRes.urls;
      }

      // Create product in database
      await createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        images: imageUrls,
      });

      setIsAdding(false);
      setNewProduct({ name: '', description: '', category: 'Light Roast', price: '', stock: '' });
      setFiles([]);
      fetchProducts();
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search inventory..."
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] w-64"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#E67E22] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#c96d1c] transition-colors"
        >
          <Plus className="w-5 h-5" /> {isAdding ? 'Cancel' : 'Add New Coffee'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#2B160A] mb-4">Add New Coffee Bean</h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E67E22]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E67E22]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock (kg)</label>
                  <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E67E22]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category / Roast</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E67E22]">
                  <option>Light Roast</option>
                  <option>Medium Roast</option>
                  <option>Dark Roast</option>
                  <option>Special Reserve</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea required rows={4} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E67E22]"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Images</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                      <p className="text-xs text-gray-500">{files.length} files selected</p>
                    </div>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
              <button type="submit" disabled={uploading} className="w-full bg-[#2B160A] text-white py-3 rounded-lg font-bold hover:bg-[#E67E22] transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mx-auto" />
                  </td>
                </tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                      <img src={product.images[0] || 'https://via.placeholder.com/40'} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-[#2B160A]">{product.name}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className="bg-orange-50 text-[#E67E22] px-2 py-1 rounded-md text-xs font-bold">{product.category}</span>
                  </td>
                  <td className="p-4 font-semibold text-gray-700">${parseFloat(product.price).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`font-bold ${product.stock > 10 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.stock} kg
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-[#E67E22] bg-white rounded-lg border border-gray-200 shadow-sm transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}