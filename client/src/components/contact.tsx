import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent!",
      description: "Thank you for your message. We'll get back to you soon.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <section ref={ref} id="contact" className="py-20 px-4 cinematic-bg">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6 gradient-text">
            Get In Touch
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Ready to showcase your work or learn more about our gallery?
          </p>
        </motion.div>

        <motion.div
          className="glass-dark rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="glass rounded-2xl px-6 py-4 text-slate-100 placeholder-slate-400 border-0 focus:ring-2 focus:ring-violet-500"
              />
              <Input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="glass rounded-2xl px-6 py-4 text-slate-100 placeholder-slate-400 border-0 focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <Input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="glass rounded-2xl px-6 py-4 text-slate-100 placeholder-slate-400 border-0 focus:ring-2 focus:ring-violet-500"
            />
            <Textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className="glass rounded-2xl px-6 py-4 text-slate-100 placeholder-slate-400 border-0 focus:ring-2 focus:ring-violet-500 resize-none"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full glass hover:animate-glow py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-20 pt-12 glass-dark border-t border-white/10 rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid md:grid-cols-4 gap-8 p-8">
            <div>
              <h3 className="text-2xl font-playfair font-bold gradient-text mb-4">
                Lumina
              </h3>
              <p className="text-slate-400">
                Discover, explore, and collect extraordinary art from around the world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                {["Home", "Gallery", "About", "Contact"].map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => {
                        const element = document.getElementById(link.toLowerCase());
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="hover:text-violet-400 transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-slate-400">
                {["Photography", "Digital Art", "Design", "Illustrations"].map((category) => (
                  <li key={category}>
                    <span className="hover:text-violet-400 transition-colors cursor-pointer">
                      {category}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {["instagram", "twitter", "facebook"].map((social) => (
                  <button
                    key={social}
                    className="w-10 h-10 glass rounded-full flex items-center justify-center hover:animate-glow transition-all duration-300"
                  >
                    <span className="text-sm capitalize">{social[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-slate-400 pb-8">
            <p>&copy; 2024 Lumina Gallery. All rights reserved.</p>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}
