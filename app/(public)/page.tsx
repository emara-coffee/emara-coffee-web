'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Globe, ShieldCheck, Leaf, Star, ArrowRight, Loader2 } from 'lucide-react';
import { getProducts } from '@/api/products';

const features = [
  {
    icon: Globe,
    title: 'Global Shipping',
    description: 'We deliver our premium Kenyan beans to 14+ countries worldwide with priority express.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    description: 'Every batch is cupped and graded by Q-Graders to ensure maximum quality standard.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Trade',
    description: 'We pay above fairtrade prices directly to cooperatives, supporting local communities.',
  },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const floatAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

export default function HomePage() {
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityBg = useTransform(scrollYProgress, [0, 1], [1, 0.5]);

  useEffect(() => {
    const fetchLatestArrivals = async () => {
      try {
        const res = await getProducts({ limit: 3 });
        setLatestProducts(res.data || []);
      } catch (error) {
        console.error('Failed to fetch latest arrivals:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchLatestArrivals();
  }, []);

  return (
    <div className="w-full">
      <section ref={heroRef} className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: yBg, opacity: opacityBg }}
        >
          <Image
            src="https://images.unsplash.com/photo-1512568400610-62da28bc8a13?q=80&w=2000&auto=format&fit=crop"
            alt="Roasted Coffee Beans"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p variants={fadeInUp} className="text-[#E67E22] font-semibold tracking-widest uppercase mb-4 text-sm">
              Direct Trade • Premium Quality
            </motion.p>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Finest Beans <br />
              <span className="text-[#E67E22]">From the High Peaks</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the distinct bright acidity and deep berry notes of specialty Kenyan coffee, sourced directly from smallholder farmers in Nyeri and Kirinyaga.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/shop">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#E67E22] text-white px-8 py-4 rounded-full font-bold hover:bg-[#c96d1c] transition-colors w-full sm:w-auto shadow-lg shadow-orange-900/20"
                >
                  Shop the Collection
                </motion.button>
              </Link>
              <Link href="/about">
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,1)", color: "#2B160A" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold transition-all w-full sm:w-auto"
                >
                  Discover the Origin
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={index} 
                variants={fadeInUp} 
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl p-8 shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-shadow"
              >
                <motion.div 
                  whileHover={{ rotate: 15 }}
                  className="w-16 h-16 mx-auto bg-orange-50 rounded-full flex items-center justify-center mb-6 text-[#E67E22]"
                >
                  <Icon className="w-8 h-8" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#2B160A] mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-2xl"
          >
            <h2 className="text-4xl font-bold text-[#2B160A] mb-4">Current Arrivals</h2>
            <p className="text-gray-600 text-lg">
              Freshly harvested micro-lots from the central highlands, roasted to highlight their unique, vibrant cup profile.
            </p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-6 md:mt-0"
          >
            <Link href="/shop" className="text-[#E67E22] font-semibold flex items-center gap-2 hover:gap-3 transition-all group">
              View all coffees <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {loadingProducts ? (
           <div className="flex items-center justify-center py-20">
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
               <Loader2 className="w-10 h-10 text-[#E67E22]" />
             </motion.div>
           </div>
        ) : (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {latestProducts.map((product) => (
              <motion.div 
                key={product.id} 
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="h-full"
              >
                <Link href={`/shop/${product.id}`} className="block group cursor-pointer h-full">
                  <div className="relative h-80 w-full rounded-2xl overflow-hidden mb-6 bg-gray-100 shadow-md group-hover:shadow-xl transition-shadow duration-500">
                    <Image
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#E67E22] shadow-sm">
                      {product.category}
                    </div>
                  </div>
                  <div className="px-2">
                    <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">KENYA</p>
                    <h3 className="text-xl font-bold text-[#2B160A] mb-2 group-hover:text-[#E67E22] transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-4">
                      <div className="flex text-[#E67E22]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 font-medium ml-1">4.8</span>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-2xl font-bold text-[#2B160A]">${parseFloat(product.price).toFixed(2)}</span>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#2B160A] text-white px-6 py-2.5 rounded-full font-semibold group-hover:bg-[#E67E22] transition-colors text-sm shadow-md"
                      >
                        Buy Now
                      </motion.button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section className="bg-[#2B160A] text-white py-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=1200&auto=format&fit=crop"
              alt="Coffee Farmer"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <motion.div 
              variants={floatAnimation}
              initial="initial"
              animate="animate"
              className="absolute -bottom-10 -right-10 w-64 h-64 border-8 border-[#2B160A] rounded-2xl overflow-hidden hidden md:block z-10 shadow-2xl"
            >
               <Image
                  src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop"
                  alt="Pouring Coffee"
                  fill
                  sizes="256px"
                  className="object-cover"
                />
            </motion.div>
          </div>
          
          <div className="w-full lg:w-1/2 flex items-center justify-center p-12 lg:p-24 relative z-20">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-lg"
            >
              <motion.p variants={fadeInUp} className="text-[#E67E22] font-bold tracking-widest uppercase mb-4 text-sm">
                Our Roots
              </motion.p>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                The Journey from Kenya to the World
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-gray-300 text-lg mb-6 leading-relaxed">
                Founded in Nairobi, our mission started with a simple question: Why do the best beans often never reach the person who cares most?
              </motion.p>
              <motion.p variants={fadeInUp} className="text-gray-300 text-lg mb-12 leading-relaxed">
                We work directly with 12 cooperatives across Mount Kenya region. By cutting out middle-men, we ensure that farmers receive 300% higher income than traditional auction systems, while you get the freshest roast possible.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-8 border-t border-gray-700 pt-8">
                <motion.div whileHover={{ scale: 1.05 }} className="cursor-default">
                  <h4 className="text-4xl font-bold text-[#E67E22] mb-2">12+</h4>
                  <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">Partner Farms</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="cursor-default">
                  <h4 className="text-4xl font-bold text-[#E67E22] mb-2">85+</h4>
                  <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">Cup Score</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}