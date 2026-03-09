import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { QrCode } from 'lucide-react';

export default function MembershipCard() {
  const { user } = useAuth();

  if (!user) return null;

  const getTierStyles = (tier: string = 'Standard') => {
    switch(tier.toUpperCase()) {
      case 'VIP':
        return {
          bg: 'from-gray-900 via-gray-800 to-black',
          text: 'text-[#FFD700]',
          accent: 'border-[#FFD700]/30',
          barcodeBg: 'bg-white/10',
          barcodeText: 'text-[#FFD700]/70',
          barcodeBars: 'bg-[#FFD700]'
        };
      case 'PREMIUM':
        return {
          bg: 'from-[#FFD700] via-[#D4AF37] to-[#AA8000]',
          text: 'text-gray-900',
          accent: 'border-white/20',
          barcodeBg: 'bg-white/90',
          barcodeText: 'text-gray-500',
          barcodeBars: 'bg-gray-900'
        };
      default: // STANDARD
        return {
          bg: 'from-gray-100 via-gray-200 to-gray-300',
          text: 'text-gray-900',
          accent: 'border-gray-400/20',
          barcodeBg: 'bg-white/90',
          barcodeText: 'text-gray-500',
          barcodeBars: 'bg-gray-900'
        };
    }
  };

  const styles = getTierStyles(user.tier);

  // Generate a simple visual barcode based on user ID
  const generateBarcode = (id: number) => {
    const seed = id * 12345;
    const bars = [];
    for (let i = 0; i < 40; i++) {
      const width = ((seed * (i + 1)) % 4) + 1;
      bars.push(
        <div
          key={i}
          className={`${styles.barcodeBars} h-full`}
          style={{ width: `${width}px`, marginRight: '1px' }}
        />
      );
    }
    return bars;
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, rotateY: -10 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="relative w-full max-w-md mx-auto aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer perspective-1000"
    >
      {/* Texture Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.bg} z-0`} />
      
      {/* Texture overlay */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay z-0"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
        }}
      />

      {/* Card Content */}
      <div className={`relative z-10 h-full p-6 flex flex-col justify-between ${styles.text}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-[#BC002D] rounded-full flex items-center justify-center text-white font-serif font-bold text-2xl shadow-lg border-2 ${styles.accent}`}>
              I
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl tracking-tight leading-none">INTI</h3>
              <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Association</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Member ID</p>
            <p className="font-mono font-bold text-lg tracking-wider">
              {user.id.toString().padStart(8, '0')}
            </p>
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Member Name</p>
          <h2 className="text-2xl font-serif font-bold uppercase tracking-wide mb-4">
            {user.name}
          </h2>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Tier</p>
              <p className="font-medium text-sm uppercase tracking-wider">
                {user.tier || 'Standard'}
              </p>
            </div>
            
            {/* Barcode Area */}
            <div className={`${styles.barcodeBg} p-2 rounded-lg shadow-inner flex flex-col items-center backdrop-blur-sm`}>
              <div className="flex h-8 items-center justify-center mb-1">
                {generateBarcode(user.id)}
              </div>
              <p className={`font-mono text-[8px] tracking-[0.2em] ${styles.barcodeText}`}>
                {user.id.toString().padStart(8, '0')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] z-20 pointer-events-none" />
    </motion.div>
  );
}
