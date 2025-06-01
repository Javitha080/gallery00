import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export default function About() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const stats = [
    { number: "500+", label: "Artworks" },
    { number: "100+", label: "Artists" },
  ];

  return (
    <section ref={ref} id="about" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 cinematic-bg opacity-90"></div>
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
          alt="Modern photography studio" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="glass-dark rounded-3xl p-8 md:p-12"
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6 gradient-text">
              About Lumina
            </h2>
            <p className="text-lg text-slate-300 mb-6 leading-relaxed">
              Lumina Gallery is a premier destination for contemporary art and photography. 
              We showcase the work of emerging and established artists from around the world, 
              creating a bridge between traditional artistry and digital innovation.
            </p>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Our mission is to make art accessible, inspiring, and transformative for 
              everyone who visits our digital space.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <div className="text-3xl font-bold gradient-text mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.img
              src="https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600"
              alt="Art gallery visitors"
              className="rounded-2xl shadow-2xl glass border"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            <motion.img
              src="https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600"
              alt="Abstract digital art"
              className="rounded-2xl shadow-2xl glass border mt-8"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
