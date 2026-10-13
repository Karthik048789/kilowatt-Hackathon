import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSave, product, existingSkus = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    regularPrice: '',
    category: '',
    shortDescription: '',
    description: '',
    stockStatus: 'instock',
    stockQuantity: 10,
    status: 'draft',
    attributes: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        price: product.price !== undefined ? String(product.price) : '',
        regularPrice: product.regularPrice !== undefined ? String(product.regularPrice) : '',
        category: product.category || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        stockStatus: product.stockStatus || 'instock',
        stockQuantity: product.stockQuantity || 0,
        status: product.status || 'draft',
        attributes: product.attributes || []
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        price: '',
        regularPrice: '',
        category: '',
        shortDescription: '',
        description: '',
        stockStatus: 'instock',
        stockQuantity: 50,
        status: 'draft',
        attributes: []
      });
    }
    setErrors({});
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.sku.trim()) {
      errs.sku = 'SKU is required';
    } else {
      const isDuplicate = existingSkus.some(s => 
        s.toLowerCase() === formData.sku.trim().toLowerCase() && 
        (!product || product.sku.toLowerCase() !== formData.sku.trim().toLowerCase())
      );
      if (isDuplicate) errs.sku = 'This SKU is already assigned to another product';
    }

    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errs.price = 'Price must be a valid positive number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanedAttributes = (formData.attributes || [])
      .filter(a => a.name && a.name.trim().length > 0)
      .map(a => ({
        name: a.name.trim(),
        options: a.options && a.options[0] && a.options[0].trim() ? [a.options[0].trim()] : ['Standard']
      }));

    onSave({
      ...formData,
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category ? formData.category.trim() : '',
      description: formData.description ? formData.description.trim() : '',
      shortDescription: formData.shortDescription ? formData.shortDescription.trim() : '',
      price: Number(formData.price),
      regularPrice: formData.regularPrice ? Number(formData.regularPrice) : Number(formData.price),
      stockQuantity: Number(formData.stockQuantity) || 0,
      attributes: cleanedAttributes
    });
  };

  const handleAddAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { name: '', options: [''] }]
    });
  };

  const handleUpdateAttributeName = (index, name) => {
    const updated = [...formData.attributes];
    updated[index].name = name;
    setFormData({ ...formData, attributes: updated });
  };

  const handleUpdateAttributeOption = (index, value) => {
    const updated = [...formData.attributes];
    updated[index].options = [value];
    setFormData({ ...formData, attributes: updated });
  };

  const handleRemoveAttribute = (index) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index)
    });
  };

  // Calculate live quality score preview
  let previewScore = 100;
  if (!formData.name?.trim()) previewScore -= 30;
  if (!formData.sku?.trim()) previewScore -= 25;
  if (!formData.price || Number(formData.price) <= 0) previewScore -= 25;
  const descValue = formData.description || '';
  if (!descValue.trim()) previewScore -= 25;
  else if (descValue.trim().length < 50) previewScore -= 15;
  const catValue = formData.category || '';
  if (!catValue.trim() || catValue.toLowerCase() === 'uncategorized') previewScore -= 20;
  if (!formData.attributes || formData.attributes.length === 0) previewScore -= 10;
  previewScore = Math.max(0, Math.min(100, previewScore));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f1523] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-white">
              {product ? 'Edit Product Details' : 'Create New Catalogue Product'}
            </h3>
            <p className="text-xs text-slate-400">
              Validated against core PIM schemas and WooCommerce compatibility
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quality Score Preview Bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Live Quality Estimation:</span>
            <span className={`font-bold ${previewScore >= 80 ? 'text-emerald-400' : previewScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
              {previewScore}%
            </span>
          </div>
          <div className="w-32 h-1.5 bg-slate-850 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${previewScore >= 80 ? 'bg-emerald-500' : previewScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${previewScore}%` }}
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Row 1: Name & SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Product Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ergonomic Office Chair"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3.5 py-2 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition ${
                  errors.name ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unique SKU <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ERG-CHR-01"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition ${
                  errors.sku ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              {errors.sku && <p className="text-xs text-rose-400 mt-1">{errors.sku}</p>}
            </div>
          </div>

          {/* Row 2: Price & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sale Price ($) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="49.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={`w-full px-3.5 py-2 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition ${
                  errors.price ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              {errors.price && <p className="text-xs text-rose-400 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Regular Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="59.99"
                value={formData.regularPrice}
                onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Smart Home"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Summary
            </label>
            <input
              type="text"
              placeholder="Brief 1-sentence product summary"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Full Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Detailed Product Description
              </label>
              <span className="text-[11px] text-slate-500">
                {formData.description.length} chars (recom. &gt; 50)
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Provide a comprehensive e-commerce description covering benefits, materials, and usage..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Stock & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Status</label>
              <select
                value={formData.stockStatus}
                onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
                <option value="onbackorder">Backorder</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Publication Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="publish">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Technical Specifications / Attributes */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Technical Attributes & Specifications
              </label>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Specification</span>
              </button>
            </div>

            {formData.attributes.map((attr, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Attribute (e.g. Battery)"
                  value={attr.name}
                  onChange={(e) => handleUpdateAttributeName(idx, e.target.value)}
                  className="w-1/2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 32 Hours)"
                  value={attr.options?.[0] || ''}
                  onChange={(e) => handleUpdateAttributeOption(idx, e.target.value)}
                  className="w-1/2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
