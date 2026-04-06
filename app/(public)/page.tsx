"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Plus, Minus, Send, BarChart3, Globe2, Truck, ShieldCheck,
  Star, ChevronRight, Quote, Package, Loader2, PlayCircle, MapPin, Sprout, Leaf
} from 'lucide-react';
import { getCategories } from '@/api/public/catalog';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

const stats = [
  { value: '50+', label: 'Partner Cooperatives' },
  { value: '4', label: 'Key Origin Countries' },
  { value: '100%', label: 'Traceable Supply' },
  { value: '24/7', label: 'B2B Logistics Support' },
];

const regions = [
  {
    name: 'Kenya',
    tagline: 'Bright Acidity & Complex Berries',
    desc: 'Sourced from the high-altitude volcanic soils of Mount Kenya and Nyeri. Known globally for the meticulous cooperative washing process.',
    img: 'https://www.saveur.com/uploads/2019/03/07/CKZA2TR45TLW4KHAPJY7E6GT3I.jpg?auto=webp'
  },
  {
    name: 'Uganda',
    tagline: 'Rich Body & Deep Earth Notes',
    desc: 'Partnering directly with women-led cooperatives in the Rwenzori Mountains to bring you premium washed Arabica and bold Robusta.',
    img: 'https://media.licdn.com/dms/image/v2/D4D12AQFZxwrsOS_0BA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1730450353884?e=2147483647&v=beta&t=67bi81Ouwq_3HUTi2MxJ04GPdS6JI3-hmrYMbPKtMJo'
  },
  {
    name: 'Ethiopia',
    tagline: 'Floral, Citrus & Heirloom Heritage',
    desc: 'The birthplace of coffee. We distribute wild, forest-grown heirloom varietals from Sidamo, Yirgacheffe, and Harrar.',
    img: 'https://olololodge.com/wp-content/uploads/Karunguru-Coffee-Farm-1024x683.jpg'
  },
  {
    name: 'Rwanda',
    tagline: 'Silky Sweetness & Orange Blossom',
    desc: 'Grown along the slopes of Lake Kivu. Our Rwandan Bourbon beans are celebrated for their incredible sweetness and clean cup profile.',
    img: 'https://perfectdailygrind.com/wp-content/uploads/2017/12/rwanda5-e1513217450711.jpg'
  }
];

const features = [
  {
    title: 'Direct East African Sourcing',
    desc: 'We eliminate the middlemen, connecting global roasters directly to the finest estates and cooperatives in the Rift Valley and beyond.',
    icon: MapPin,
  },
  {
    title: 'Climate-Controlled Logistics',
    desc: 'From the washing stations to the port of Mombasa, our distribution network ensures your green beans never degrade in transit.',
    icon: Truck,
  },
  {
    title: 'Fair Trade & Empowerment',
    desc: 'We guarantee premium wages for our farmers, heavily supporting women-led harvesting cooperatives across Uganda and Kenya.',
    icon: Sprout,
  },
  {
    title: 'Uncompromised Quality Control',
    desc: 'Every micro-lot is rigorously cupped, graded, and sorted to meet strict specialty coffee standards before export.',
    icon: ShieldCheck,
  },
];

const testimonials = [
  {
    quote: "Emara Coffee has completely transformed our sourcing. The traceability back to the specific washing stations in Nyeri gives our customers the transparency they demand.",
    author: "Sarah Jenkins",
    company: "Cascade Roasters, USA",
    rating: 5
  },
  {
    quote: "The quality of their Rwandan Bourbon is exceptional. Their logistics team handled the entire export process flawlessly, ensuring the beans arrived in peak condition.",
    author: "Bram de Vries",
    company: "Dutch Bean Exchange",
    rating: 5
  },
  {
    quote: "Partnering with Emara means we are actively supporting female farmers in Uganda. It's a B2B relationship that aligns perfectly with our ethical sourcing goals.",
    author: "Elin Johansson",
    company: "Nordic Roast Co, Sweden",
    rating: 5
  }
];

const faqs = [
  {
    q: "What is the minimum order quantity (MOQ) for wholesale green beans?",
    a: "Our standard MOQ for international export is one full pallet (approx. 10 bags / 600kg). However, we offer mixed-pallet consolidation for registered micro-roasters."
  },
  {
    q: "How does Emara Coffee ensure the quality of its shipments?",
    a: "Every batch undergoes physical grading and cupping by Q-Graders at our Nairobi facility. We use GrainPro or Ecotact bags to preserve moisture content during oceanic or air freight."
  },
  {
    q: "Do you supply both washed and natural processed coffees?",
    a: "Yes. Depending on the origin, we supply Washed, Natural (Sun-dried), and Honey processed beans. Ethiopia and Burundi often yield our best Naturals, while Kenya excels in Washed."
  },
  {
    q: "Can I trace my coffee back to the specific farm or cooperative?",
    a: "Absolutely. Traceability is core to our mission. Every lot distributed by Emara Coffee comes with a detailed origin report, including the cooperative name, altitude, and varietal."
  }
];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    const fetchDynamicCategories = async () => {
      try {
        const res = await getCategories();
        const categoryData = Array.isArray(res.data) ? res.data : [];
        setCategories(categoryData);
      } catch (error) {
        console.error("Failed to fetch categories");
      } finally {
        setLoadingCats(false);
      }
    };
    fetchDynamicCategories();
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen w-full font-sans selection:bg-[#4A7C59] selection:text-white">

      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/coffee-v1.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-[#3E200C]/70 z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pt-20">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl mx-auto">
            <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#4A7C59] animate-pulse"></span>
              <span className="text-white font-bold text-xs tracking-widest uppercase">East Africa's Premier Coffee Distributor</span>
            </motion.div>

            <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-[1.1]">
              The Soul of Africa.<br />
              <span className="text-[#4A7C59]">Distributed Globally.</span>
            </motion.h1>

            <motion.p variants={fadeUpVariant} className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-12 leading-relaxed">
              Emara Coffee bridges the gap between remote East African highlands and global roasters. We deliver uncompromised quality, empowering farmers and preserving the rich heritage of origin.
            </motion.p>

            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/apply-dealer" className="w-full sm:w-auto bg-[#4A7C59] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#3b6347] transition-all shadow-lg shadow-[#4A7C59]/30 flex items-center justify-center gap-2 group border border-[#4A7C59]">
                Become a Partner <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/shop" className="w-full sm:w-auto bg-transparent text-white border border-white/30 px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-[#3E200C] transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                <PlayCircle className="h-5 w-5" /> Explore Origins
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-transparent py-16 relative z-20 -mt-20 mx-4 md:mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/95 backdrop-blur-xl border border-slate-100 p-8 rounded-3xl shadow-xl shadow-[#3E200C]/5 text-center hover:-translate-y-1 transition-transform"
            >
              <h3 className="text-4xl font-black text-[#3E200C] mb-2">{stat.value}</h3>
              <p className="text-[#4A7C59] font-bold text-xs tracking-wider uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Regions Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[#4A7C59] font-bold tracking-widest uppercase text-sm mb-4 block">Our Terroirs</motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-black text-[#3E200C]">
              Sourced from the Source
            </motion.h2>
            <p className="mt-6 text-lg text-slate-600">We maintain deep roots in the communities that cultivate the world's most sought-after beans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((region, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer"
              >
                <img src={region.img} alt={region.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3E200C] via-[#3E200C]/60 to-transparent opacity-90" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-3xl font-black text-white mb-1">{region.name}</h3>
                  <p className="text-[#4A7C59] font-bold text-sm mb-4 uppercase tracking-wide">{region.tagline}</p>
                  <p className="text-slate-200 text-sm leading-relaxed opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {region.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Categories Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div className="max-w-2xl">
            <span className="text-[#4A7C59] font-bold tracking-widest uppercase text-sm mb-4 block">Our Inventory</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#3E200C]">
              Premium Wholesale Offerings
            </h2>
          </div>
        </div>

        {loadingCats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-[450px] bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-pulse flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-[#4A7C59] animate-spin" />
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.15 }}
                className="group relative h-[450px] rounded-[2rem] overflow-hidden cursor-pointer bg-[#3E200C] shadow-sm hover:shadow-2xl hover:shadow-[#4A7C59]/20 transition-all duration-500"
              >
                <img
                  src={
                    cat.imageUrl ||
                    (cat.name.toLowerCase().includes('green')
                      ? "https://i.pinimg.com/736x/90/75/57/907557854b76611c4b77c13c9d8377d3.jpg"
                      : "https://i.pinimg.com/webp/736x/0c/dd/18/0cdd185ef4b89fb7a342716b61d9bed4.webp")
                  }
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 group-hover:rotate-1 transition-transform duration-700 opacity-80 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3E200C] via-[#3E200C]/80 to-transparent" />

                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-500">
                    <Leaf className="h-6 w-6 text-[#4A7C59]" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">{cat.name}</h3>
                  <p className="text-slate-300 mb-8 max-w-md line-clamp-2 font-medium">{cat.description || `Browse our extensive collection of ${cat.name.toLowerCase()} available for wholesale.`}</p>
                  <Link href={`/shop?categoryId=${cat.id}`} className="inline-flex items-center gap-2 bg-[#4A7C59] hover:bg-white hover:text-[#3E200C] text-white w-fit px-6 py-3.5 rounded-xl font-bold transition-all shadow-md group-hover:px-8">
                    View Catalog <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No inventory available at the moment.</p>
          </div>
        )}
      </section>

      {/* Features / Story Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/3"
            >
              <span className="text-[#4A7C59] font-bold tracking-widest uppercase text-sm mb-4 block">The Emara Advantage</span>
              <h2 className="text-4xl md:text-5xl font-black text-[#3E200C] mb-6 leading-tight">
                Beyond <br />Just Beans.
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                We are more than distributors. We are partners in origin. By heavily investing in local cooperative infrastructure, we ensure that every bean distributed by Emara carries the true essence of East Africa while enriching the communities that grew it.
              </p>
              <Link href="/apply-dealer" className="inline-flex items-center gap-2 text-[#4A7C59] font-bold hover:text-[#3E200C] bg-[#4A7C59]/10 px-6 py-3 rounded-xl transition-colors">
                Open a Wholesale Account <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>

            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-[#4A7C59]/30 transition-all duration-300 group"
                >
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#4A7C59] group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="h-7 w-7 text-[#4A7C59] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3E200C] mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#3E200C] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#4A7C59] via-[#3E200C] to-[#3E200C]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="text-[#4A7C59] font-bold tracking-widest uppercase text-sm mb-4 block">Partner Success</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Trusted by Global Roasters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="bg-white/5 backdrop-blur-lg p-10 rounded-3xl border border-white/10 relative hover:-translate-y-2 transition-transform duration-300"
              >
                <Quote className="absolute top-8 right-8 h-10 w-10 text-white/10" />
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(test.rating)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />)}
                </div>
                <p className="text-slate-200 text-lg leading-relaxed mb-8 font-medium">"{test.quote}"</p>
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/10">
                  <div className="h-12 w-12 bg-[#4A7C59] rounded-full flex items-center justify-center text-white font-black text-xl">
                    {test.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{test.author}</p>
                    <p className="text-sm font-bold text-[#4A7C59] uppercase tracking-wider">{test.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ & Contact */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">

          <div>
            <span className="text-[#4A7C59] font-bold tracking-widest uppercase text-sm mb-4 block">Knowledge Base</span>
            <h2 className="text-4xl font-black text-[#3E200C] mb-10">Sourcing & Logistics FAQ</h2>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === idx ? 'border-[#4A7C59]/30 bg-[#4A7C59]/5 shadow-sm' : 'border-slate-200 bg-white hover:border-[#4A7C59]/20'}`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className="font-bold text-[#3E200C] pr-8">{faq.q}</span>
                    <span className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border transition-colors ${openFaq === idx ? 'border-[#4A7C59] bg-[#4A7C59] text-white' : 'border-slate-200 text-slate-400 bg-slate-50'}`}>
                      {openFaq === idx ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-slate-600 font-medium leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-50 border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8 md:p-12 h-fit"
          >
            <h2 className="text-3xl font-black text-[#3E200C] mb-2">Contact Sourcing</h2>
            <p className="text-slate-500 mb-8 font-medium">Our green bean buyers will respond within 24 hours.</p>

            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Roastery / Company</label>
                  <input type="text" placeholder="Your Business Name" className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] transition-all text-[#3E200C] font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Business Email</label>
                  <input type="email" placeholder="buyer@roastery.com" className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] transition-all text-[#3E200C] font-medium" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Inquiry Type</label>
                <select defaultValue="" className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] appearance-none transition-all cursor-pointer text-[#3E200C] font-medium">
                  <option value="" disabled>Select a topic...</option>
                  <option value="samples">Request Green Bean Samples</option>
                  <option value="bulk">Pallet/Container Freight Quote</option>
                  <option value="partnership">Cooperative Partnership</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Message</label>
                <div className="relative">
                  <textarea
                    placeholder="Tell us about your volume requirements and preferred origins..."
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] transition-all resize-none text-[#3E200C] font-medium"
                  ></textarea>
                  <button
                    type="button"
                    className="absolute bottom-4 right-4 h-12 w-12 bg-[#4A7C59] hover:bg-[#3b6347] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#4A7C59]/30 transition-all hover:scale-105"
                  >
                    <Send className="h-5 w-5 ml-1" />
                  </button>
                </div>
              </div>
            </form>
          </motion.div>

        </div>
      </section>
    </div>
  );
}