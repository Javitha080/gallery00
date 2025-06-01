import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { GalleryItem } from "@shared/schema";

export default function PreviewPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: item, isLoading } = useQuery<GalleryItem>({
    queryKey: ['/api/gallery', id],
    queryFn: async () => {
      const response = await fetch(`/api/gallery/${id}`);
      if (!response.ok) throw new Error('Item not found');
      return response.json();
    }
  });

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cinematic-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen cinematic-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Button onClick={() => setLocation('/')} className="glass">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cinematic-bg">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            onClick={() => setLocation('/')} 
            variant="ghost" 
            className="text-white hover:text-violet-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Button>
          <h1 className="text-xl font-playfair font-bold gradient-text">
            Preview
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid lg:grid-cols-2 gap-8 items-start"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Media Section */}
            <div className="relative">
              {item.type === 'video' ? (
                <div className="relative rounded-3xl overflow-hidden glass border">
                  <video
                    ref={videoRef}
                    className="w-full h-auto"
                    poster={item.image}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls={false}
                  >
                    <source src={item.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Custom Video Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={togglePlay}
                        size="icon"
                        className="w-12 h-12 glass rounded-full hover:animate-glow"
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>
                      <Button
                        onClick={toggleMute}
                        size="icon"
                        variant="ghost"
                        className="text-white hover:text-violet-400"
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.img
                  src={item.image}
                  alt={item.title}
                  className="w-full rounded-3xl shadow-2xl glass border"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>

            {/* Details Section */}
            <motion.div
              className="glass-dark rounded-3xl p-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="secondary" className="glass">
                  {item.category}
                </Badge>
                <Badge variant={item.type === 'video' ? 'destructive' : 'default'} className="glass">
                  {item.type}
                </Badge>
                {item.featured && (
                  <Badge className="bg-gradient-to-r from-violet-500 to-purple-600">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-6 gradient-text">
                {item.title}
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                {item.description}
              </p>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="glass text-slate-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                  Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type</span>
                    <span className="text-slate-200 capitalize">{item.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="text-slate-200 capitalize">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Item ID</span>
                    <span className="text-slate-200">#{item.id}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}