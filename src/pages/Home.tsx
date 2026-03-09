import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, Users, Newspaper } from 'lucide-react';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white"
    >
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/jakarta/1920/1080?blur=2"
            alt="Jakarta cityscape"
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#BC002D] animate-pulse" />
              <span className="text-sm font-medium text-[#BC002D] tracking-wide uppercase">
                Chinese Indonesian Association
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-tight mb-6">
              Bridging <span className="text-[#BC002D] relative inline-block">
                Cultures
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-[#FFD700]/40 origin-left -z-10"
                />
              </span><br />
              Building Futures
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
              Empowering the Chinese Indonesian community through cultural preservation, 
              business networking, and social contribution since 1999.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                to="/portal"
                className="px-8 py-4 rounded-lg bg-[#BC002D] text-white font-medium hover:bg-[#9a0025] transition-all shadow-lg hover:shadow-xl hover:shadow-[#BC002D]/30 flex items-center gap-2 group"
              >
                Join the Association
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 rounded-lg bg-white text-gray-900 font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                Our History
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative brush stroke */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full pointer-events-none"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 10 C 20 20, 40 20, 50 10\' stroke=\'%23BC002D\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </section>

      {/* Stats/Features */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "10,000+", desc: "Active Members Nationwide" },
              { icon: Calendar, title: "500+", desc: "Annual Cultural Events" },
              { icon: Newspaper, title: "25 Years", desc: "Of Community Service" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6 text-[#BC002D]">
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">{stat.title}</h3>
                <p className="text-gray-600">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Ticker */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Latest Updates</h2>
            <p className="text-gray-600 text-lg">Stay informed with community news and events.</p>
          </div>
          <Link to="/blog" className="hidden md:flex items-center gap-2 text-[#BC002D] font-medium hover:underline">
            View All News <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              <div className="relative h-64 mb-6 rounded-2xl overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/culture${i}/800/600`}
                  alt="News thumbnail"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase text-[#BC002D]">
                  Culture
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span>March {10 + i}, 2026</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>5 min read</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-[#BC002D] transition-colors">
                Preserving Traditional Arts in the Modern Digital Era
              </h3>
              <p className="text-gray-600 line-clamp-2">
                An exploration of how the younger generation is adapting traditional Chinese Indonesian art forms for contemporary audiences.
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
