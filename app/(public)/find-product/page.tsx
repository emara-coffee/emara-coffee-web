"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Search, Coffee, Star, MapPin, ArrowRight } from 'lucide-react';
import { getSearchBlueprints, getDynamicOptions, findMatchingProducts } from '@/api/public/guidedSearch';

interface SearchFilter {
  key?: string;
  type?: string;
  label: string;
  options?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  searchBlueprint: {
    filters: SearchFilter[];
  } | any;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  dealers: { id: string; businessName: string; city: string; state: string }[];
}

export default function FindYourProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [blueprintFields, setBlueprintFields] = useState<{ key: string; label: string; staticOptions: string[] }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, any>>({});
  const [currentOptions, setCurrentOptions] = useState<any[]>([]);
  
  const [results, setResults] = useState<Product[] | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await getSearchBlueprints();
      setCategories(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelections({});
    setCurrentStep(0);
    setResults(null);
    
    let fields: { key: string; label: string; staticOptions: string[] }[] = [];
    
    if (category.searchBlueprint && category.searchBlueprint.filters && Array.isArray(category.searchBlueprint.filters)) {
      fields = category.searchBlueprint.filters.map((f: SearchFilter) => ({
        key: f.key || f.label,
        label: f.label,
        staticOptions: f.options || []
      }));
    } else if (Array.isArray(category.searchBlueprint)) {
      fields = category.searchBlueprint.map((bp: any) => {
        if (typeof bp === 'string') {
          return { key: bp, label: bp.charAt(0).toUpperCase() + bp.slice(1), staticOptions: [] };
        }
        return { key: bp.key || bp.label, label: bp.label, staticOptions: bp.options || [] };
      });
    }

    setBlueprintFields(fields);
    
    if (fields.length > 0) {
      fetchOptions(category.id, {}, fields[0].key, fields);
    }
  };

  const fetchOptions = async (categoryId: string, currentSelections: any, nextField: string, fields = blueprintFields) => {
    try {
      setIsOptionsLoading(true);
      const res = await getDynamicOptions(categoryId, { currentSelections, nextField });
      
      if (res.data && res.data.options && res.data.options.length > 0) {
        setCurrentOptions(res.data.options);
      } else {
        const fieldDef = fields.find(f => f.key === nextField);
        setCurrentOptions(fieldDef?.staticOptions || []);
      }
    } catch (error) {
      const fieldDef = fields.find(f => f.key === nextField);
      setCurrentOptions(fieldDef?.staticOptions || []);
    } finally {
      setIsOptionsLoading(false);
    }
  };

  const handleOptionSelect = async (option: any) => {
    const currentField = blueprintFields[currentStep].key;
    const newSelections = { ...selections, [currentField]: option };
    setSelections(newSelections);

    if (currentStep + 1 < blueprintFields.length) {
      const nextField = blueprintFields[currentStep + 1].key;
      setCurrentStep(prev => prev + 1);
      await fetchOptions(selectedCategory!.id, newSelections, nextField);
    } else {
      executeSearch(selectedCategory!.id, newSelections);
    }
  };

  const executeSearch = async (categoryId: string, finalSelections: any) => {
    try {
      setIsSearching(true);
      const res = await findMatchingProducts(categoryId, { selections: finalSelections });
      setResults(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const goBack = () => {
    if (results) {
      setResults(null);
      const prevStep = blueprintFields.length - 1;
      setCurrentStep(prevStep);
      const newSelections = { ...selections };
      delete newSelections[blueprintFields[prevStep].key];
      setSelections(newSelections);
      fetchOptions(selectedCategory!.id, newSelections, blueprintFields[prevStep].key);
      return;
    }

    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const newSelections = { ...selections };
      delete newSelections[blueprintFields[prevStep].key];
      setSelections(newSelections);
      fetchOptions(selectedCategory!.id, newSelections, blueprintFields[prevStep].key);
    } else {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-stone-900 tracking-tight mb-4">
            Find Your <span className="text-green-600">Perfect Brew</span>
          </h1>
          <p className="text-stone-500 max-w-2xl mx-auto text-lg">
            Follow our guided search to discover the exact coffee beans roasted for your specific taste and brewing style.
          </p>
        </div>

        <AnimatePresence mode="wait">
          
          {!selectedCategory && (
            <motion.div
              key="category-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-stone-100 shadow-sm" />
                ))
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="group bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-green-300 hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Coffee className="w-24 h-24 text-green-700" />
                    </div>
                    <div className="bg-green-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Coffee className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-stone-500 flex items-center gap-2">
                      Start Search <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-stone-500">
                  No coffee varieties available at the moment.
                </div>
              )}
            </motion.div>
          )}

          {selectedCategory && !results && !isSearching && (
            <motion.div
              key="guided-steps"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <button 
                onClick={goBack}
                className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-8 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl shadow-stone-200/20">
                <div className="flex flex-wrap gap-2 mb-8">
                  {blueprintFields.map((field, idx) => (
                    <div key={field.key} className="flex items-center gap-2">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium border ${
                        idx < currentStep ? 'bg-green-50 border-green-200 text-green-700' :
                        idx === currentStep ? 'bg-green-600 border-green-600 text-white shadow-md' :
                        'bg-stone-50 border-stone-100 text-stone-400'
                      }`}>
                        {idx < currentStep ? selections[field.key] : field.label}
                      </div>
                      {idx < blueprintFields.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-stone-300" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="py-6">
                  <h2 className="text-2xl font-bold text-stone-900 mb-6">
                    Select {blueprintFields[currentStep]?.label}
                  </h2>
                  
                  {isOptionsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-16 bg-stone-100 animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : currentOptions.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {currentOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(option)}
                          className="px-6 py-4 text-left border border-stone-200 rounded-xl hover:border-green-500 hover:bg-green-50 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium text-stone-700 hover:text-green-700"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-stone-500">No options found for this selection.</p>
                      <button 
                        onClick={goBack}
                        className="mt-4 text-green-600 font-medium hover:underline"
                      >
                        Go back and change previous selection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {(isSearching || results) && (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <button 
                    onClick={goBack}
                    className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-2 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Edit Search
                  </button>
                  <h2 className="text-2xl font-bold text-stone-900">
                    Matches Found {results && `(${results.length})`}
                  </h2>
                </div>
                <div className="hidden md:flex gap-2">
                  {Object.values(selections).map((val, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-600">
                      {String(val)}
                    </span>
                  ))}
                </div>
              </div>

              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-16 h-16 border-4 border-stone-200 border-t-green-600 rounded-full animate-spin mb-6"></div>
                  <p className="text-lg font-medium text-stone-600 animate-pulse">Brewing your results...</p>
                </div>
              ) : results && results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((product) => (
                    <Link 
                      href={`/shop/${product.id}`} 
                      key={product.id}
                      className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 flex flex-col"
                    >
                      <div className="relative aspect-square bg-[#F9F7F2] p-6 overflow-hidden">
                        {product.images?.[0] ? (
                          <Image 
                            src={product.images[0]} 
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Coffee className="w-16 h-16 text-stone-300" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-stone-700 shadow-sm">
                          {product.sku}
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-stone-900 text-lg leading-tight mb-2 group-hover:text-green-700 transition-colors">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center gap-1.5 mb-4">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-stone-700">{product.averageRating.toFixed(1)}</span>
                          <span className="text-xs text-stone-400">({product.reviewCount})</span>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-black text-stone-900">
                              ₹{product.basePrice.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-green-600" />
                              {product.dealers?.length || 0} Roasters
                            </div>
                            <span className="text-green-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                              View Details <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-stone-200">
                  <Search className="w-16 h-16 text-stone-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-stone-900 mb-2">No Coffee Found</h3>
                  <p className="text-stone-500 max-w-md mx-auto mb-8">
                    We couldn't find any coffee matching your exact specifications. Try adjusting your flavor profile or roast preferences.
                  </p>
                  <button 
                    onClick={goBack}
                    className="bg-stone-900 text-white px-8 py-3 rounded-full font-medium hover:bg-stone-800 transition-colors"
                  >
                    Adjust Search
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}