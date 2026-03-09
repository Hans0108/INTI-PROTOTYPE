import { motion } from 'motion/react';

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6">About INTI</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The Chinese Indonesian Association (Perhimpunan INTI) is a social organization 
            dedicated to nation-building and fostering harmony among all Indonesians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src="https://picsum.photos/seed/history/800/1000"
              alt="Historical gathering"
              className="rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Our History</h2>
              <p className="text-gray-600 leading-relaxed">
                Founded in 1999 during the reform era, INTI emerged as a response to the need 
                for a unified voice representing the Chinese Indonesian community. We strive to 
                eliminate discrimination and promote active participation in national development.
              </p>
            </div>
            
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To become a progressive, inclusive, and respected organization that actively 
                contributes to realizing a just, prosperous, and harmonious Indonesia based on Pancasila.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Board of Directors */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Board of Directors</h2>
          <p className="text-gray-600">Leading our community towards a brighter future.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100"
            >
              <img
                src={`https://picsum.photos/seed/person${i}/400/400`}
                alt="Board member"
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-md"
                referrerPolicy="no-referrer"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-1">Dr. Hendra Wijaya</h3>
              <p className="text-[#BC002D] font-medium text-sm mb-4">Chairman</p>
              <p className="text-gray-500 text-sm">
                Dedicated to advancing educational initiatives and cultural preservation.
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
