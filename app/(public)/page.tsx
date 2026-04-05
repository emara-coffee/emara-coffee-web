'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import { 
  Public,
  VerifiedUser,
  Nature,
  Star,
  ArrowForward,
  LocalShipping,
  Agriculture,
  Waves,
  WbSunny 
} from '@mui/icons-material';

import { getProducts } from '@/api/products';

const features = [
  {
    icon: Public,
    title: 'Global Shipping',
    description: 'We deliver our premium African beans from Kenya, Uganda, Ethiopia, and Rwanda worldwide.',
  },
  {
    icon: VerifiedUser,
    title: 'Quality Guaranteed',
    description: 'Every batch is cupped and graded by experts to ensure maximum quality standard.',
  },
  {
    icon: Nature,
    title: 'Sustainable Plantation',
    description: 'We support local African coffee plantations, ensuring sustainable and eco-friendly growth.',
  },
];

const processSteps = [
  { icon: Agriculture, title: "1. Selective Harvesting", desc: "Cherries are hand-picked only at peak ripeness by skilled local farmers in high-altitude regions." },
  { icon: Waves, title: "2. Wet Processing", desc: "Beans are depulped and fermented in natural spring water to enhance their clean, bright acidity." },
  { icon: WbSunny, title: "3. Sun Drying", desc: "Laid out on raised African drying beds, the beans are sun-dried and turned regularly for even moisture." },
  { icon: LocalShipping, title: "4. Direct Export", desc: "Graded, sorted, and packed in GrainPro bags, then shipped directly to preserve ultimate freshness." }
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const floatAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: { duration: 6, ease: "easeInOut", repeat: Infinity },
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
    let isMounted = true;
    
    const fetchLatestArrivals = async () => {
      try {
        const res = await getProducts({ limit: 3 });
        if (isMounted) setLatestProducts(res.data || []);
      } catch (error) {
        console.error("API Error:", error);
        if (isMounted) {
          setLatestProducts([
            { id: 1, name: 'Kenya AA Premium', price: '24.99', category: 'Light Roast', images: ['https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800'] },
            { id: 2, name: 'Uganda Robusta', price: '19.99', category: 'Dark Roast', images: ['https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=800'] },
            { id: 3, name: 'Ethiopian Yirgacheffe', price: '28.50', category: 'Medium Roast', images: ['https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=800'] }
          ]);
        }
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    fetchLatestArrivals();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="w-full bg-[#FAF8F5]">
      <section ref={heroRef} className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: yBg, opacity: opacityBg }}
        >
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
          >
            <source src="/coffee-v1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#3E200C]/60" />
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.p variants={fadeInUp} className="text-[#4A7C59] font-bold tracking-widest uppercase mb-4 text-sm bg-white/10 inline-block px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
              Authentic African Plantations
            </motion.p>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Finest Beans <br />
              <span className="text-[#4A7C59]">From The Source</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Experience the distinct flavors of specialty African coffee. Sourced directly from lush green plantations across Kenya, Uganda, Ethiopia, and Rwanda.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/shop">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#4A7C59] text-white px-8 py-4 rounded-full font-bold hover:bg-[#3A5A40] transition-colors w-full sm:w-auto shadow-xl"
                >
                  Shop the Collection
                </motion.button>
              </Link>
              <Link href="#origins">
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,1)", color: "#3E200C" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold transition-all w-full sm:w-auto"
                >
                  Discover the Plantations
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
                  className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6 text-[#4A7C59]"
                >
                  <Icon fontSize="large" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#3E200C] mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section id="origins" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold text-[#3E200C] mb-6">The Soul of East Africa</h2>
          <p className="text-gray-600 text-lg">
            Our trade network connects you to the most prestigious coffee-growing micro-climates in the world. Each origin offers a profoundly different tasting experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { country: "Kenya", tag: "Complex & Fruity", desc: "Volcanic soil produces highly acidic, bold beans with notes of blackcurrant.", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800" },
            { country: "Ethiopia", tag: "Floral & Bright", desc: "The birthplace of coffee. Expect tea-like bodies with jasmine and bergamot aromas.", img: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=800" },
            { country: "Uganda", tag: "Rich & Earthy", desc: "Premium Robusta grown around Lake Victoria, offering intense crema and dark chocolate notes.", img: "https://images.unsplash.com/photo-1557223562-6c77ef16210f?q=80&w=800" },
            { country: "Rwanda", tag: "Sweet & Balanced", desc: "The Land of a Thousand Hills provides syrupy sweet beans with hints of orange blossom.", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800" }
          ].map((origin, i) => (
            <motion.div 
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative h-96 rounded-2xl overflow-hidden group"
            >
              <Image src={origin.img} alt={origin.country} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3E200C] via-[#3E200C]/40 to-transparent opacity-90" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-[#4A7C59] font-bold text-sm tracking-widest uppercase mb-2 block">{origin.tag}</span>
                <h3 className="text-3xl font-bold text-white mb-2">{origin.country}</h3>
                <p className="text-gray-300 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">{origin.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white py-32 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#3E200C] mb-4">From Soil to Sack</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our retrieval process honors the generations of African farming traditions, combined with modern quality control.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {processSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div key={index} variants={fadeInUp} className="relative text-center px-4">
                  {index !== processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-[#4A7C59] to-transparent z-0 opacity-20" />
                  )}
                  <div className="relative z-10 w-20 h-20 mx-auto bg-[#4A7C59] rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-green-900/20">
                    <StepIcon fontSize="large" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3E200C] mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-2xl">
            <h2 className="text-4xl font-bold text-[#3E200C] mb-4">Current Arrivals</h2>
            <p className="text-gray-600 text-lg">
              Freshly harvested micro-lots from African plantations, representing the finest qualities of their regions.
            </p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mt-6 md:mt-0">
            <Link href="/shop" className="text-[#4A7C59] font-semibold flex items-center gap-2 hover:gap-3 transition-all group">
              View all coffees <ArrowForward className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {loadingProducts ? (
           <div className="flex items-center justify-center py-20">
             <CircularProgress sx={{ color: '#4A7C59' }} />
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
              <motion.div key={product.id} variants={fadeInUp} whileHover={{ y: -8 }} className="h-full">
                <Link href={`/shop/${product.id}`} className="block group cursor-pointer h-full">
                  <div className="relative h-80 w-full rounded-2xl overflow-hidden mb-6 bg-gray-100 shadow-md group-hover:shadow-xl transition-shadow duration-500">
                    <Image
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#4A7C59] shadow-sm">
                      {product.category || 'Specialty'}
                    </div>
                  </div>
                  <div className="px-2">
                    <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">AFRICAN ORIGIN</p>
                    <h3 className="text-xl font-bold text-[#3E200C] mb-2 group-hover:text-[#4A7C59] transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-4">
                      <div className="flex text-[#4A7C59]">
                        {[...Array(5)].map((_, i) => <Star key={i} fontSize="small" />)}
                      </div>
                      <span className="text-sm text-gray-500 font-medium ml-1">4.8</span>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-2xl font-bold text-[#3E200C]">${parseFloat(product.price).toFixed(2)}</span>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#3E200C] text-white px-6 py-2.5 rounded-full font-semibold group-hover:bg-[#4A7C59] transition-colors text-sm shadow-md"
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

      <section className="bg-[#3E200C] text-white py-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1597816760638-406d7271105c?q=80&w=1200"
              alt="Coffee Plantation Worker"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <motion.div 
              variants={floatAnimation}
              initial="initial"
              animate="animate"
              className="absolute -bottom-10 -right-10 w-64 h-64 border-8 border-[#3E200C] rounded-2xl overflow-hidden hidden md:block z-10 shadow-2xl"
            >
               <Image
                  src="https://images.unsplash.com/photo-1586095516671-d085ff58cdd4?q=80&w=600"
                  alt="Fresh Coffee Beans"
                  fill
                  sizes="256px"
                  className="object-cover"
                />
            </motion.div>
          </div>
          
          <div className="w-full lg:w-1/2 flex items-center justify-center p-12 lg:p-24 relative z-20">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-lg">
              <motion.p variants={fadeInUp} className="text-[#4A7C59] font-bold tracking-widest uppercase mb-4 text-sm">
                Our Roots
              </motion.p>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                From African Plantations to the World
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-gray-300 text-lg mb-6 leading-relaxed">
                By partnering directly with local farmers, we bypass the traditional supply chain. This ensures ethical sourcing, sustainable agriculture, and significantly higher wages for the hands that harvest your coffee.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-8 border-t border-gray-700 pt-8 mt-12">
                <motion.div whileHover={{ scale: 1.05 }} className="cursor-default">
                  <h4 className="text-4xl font-bold text-[#4A7C59] mb-2">4+</h4>
                  <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">African Nations</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="cursor-default">
                  <h4 className="text-4xl font-bold text-[#4A7C59] mb-2">100%</h4>
                  <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">Direct Trade</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}