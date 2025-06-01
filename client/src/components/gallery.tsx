import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Play, Image as ImageIcon, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { GalleryItem } from "@shared/schema";

interface GalleryProps {
  onItemClick: (id: number) => void;
}

export default function Gallery({ onItemClick }: GalleryProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedItems, setDisplayedItems] = useState(20);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const { data: galleryItems = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const filteredItems = useMemo(() => {
    let items = galleryItems;

    // Apply category filter
    if (activeFilter !== "all") {
      items = items.filter(item => item.category === activeFilter || item.type === activeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    return items;
  }, [galleryItems, activeFilter, searchQuery]);

  const itemsToShow = filteredItems.slice(0, displayedItems);
  const hasMoreItems = displayedItems < filteredItems.length;

  const filters = [
    { id: "all", label: "All Works", count: galleryItems.length },
    { id: "photography", label: "Photography", count: galleryItems.filter(item => item.category === 'photography').length },
    { id: "art", label: "Digital Art", count: galleryItems.filter(item => item.category === 'art').length },
    { id: "design", label: "Design", count: galleryItems.filter(item => item.category === 'design').length },
    { id: "video", label: "Videos", count: galleryItems.filter(item => item.type === 'video').length },
  ];

  const loadMore = () => {
    setDisplayedItems(prev => prev + 12);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section ref={ref} id="gallery" className="py-20 px-4 cinematic-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6 gradient-text">
            Lumina Gallery
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover {galleryItems.length} stunning artworks including {galleryItems.filter(item => item.type === 'image').length} images and {galleryItems.filter(item => item.type === 'video').length} videos
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {filters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setDisplayedItems(20);
              }}
              variant={activeFilter === filter.id ? "default" : "ghost"}
              className={`glass px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 ${
                activeFilter === filter.id ? "bg-violet-500/30 border-violet-400/50" : ""
              }`}
            >
              {filter.label}
              <Badge variant="secondary" className="ml-2 text-xs">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="max-w-lg mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Search gallery by title, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass rounded-full px-6 py-4 pl-12 text-slate-100 placeholder-slate-400 border-0 focus:ring-2 focus:ring-violet-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          </div>
        </motion.div>

        {/* Results Info */}
        {searchQuery && (
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-slate-400">
              Found {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          </motion.div>
        )}

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-400">Loading gallery...</p>
          </div>
        ) : itemsToShow.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No items found matching your criteria</p>
          </div>
        ) : (
          <motion.div
            className="masonry"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <AnimatePresence>
              {itemsToShow.map((item) => (
                <motion.div
                  key={item.id}
                  className="masonry-item cursor-pointer group"
                  variants={itemVariants}
                  layout
                  onClick={() => onItemClick(item.id)}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative overflow-hidden rounded-2xl glass border transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                    {/* Image/Video Thumbnail */}
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className={`w-full ${item.height} object-cover transition-transform duration-500 group-hover:scale-110`}
                        loading="lazy"
                      />
                      
                      {/* Video Play Overlay */}
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                          <div className="w-16 h-16 glass rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
                          </div>
                        </div>
                      )}

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge 
                          variant={item.type === 'video' ? 'destructive' : 'default'} 
                          className="glass border-0 text-xs font-medium"
                        >
                          {item.type === 'video' ? (
                            <>
                              <Video className="w-3 h-3 mr-1" />
                              Video
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3 h-3 mr-1" />
                              Image
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Featured Badge */}
                      {item.featured && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 border-0 text-xs">
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant="outline" className="glass text-xs mb-2 border-white/30">
                              {item.category}
                            </Badge>
                            <h3 className="text-lg font-playfair font-bold text-white mb-2 line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-slate-300 line-clamp-2 mb-3">
                              {item.description}
                            </p>
                            
                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.tags.slice(0, 3).map((tag, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="secondary" 
                                    className="text-xs bg-white/10 text-white border-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs bg-white/10 text-white border-0">
                                    +{item.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4">
                            <div className="w-10 h-10 glass rounded-full flex items-center justify-center group-hover:animate-pulse">
                              <Search className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Load More Button */}
        {hasMoreItems && !searchQuery && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={loadMore}
              className="glass hover:animate-glow px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Load More ({filteredItems.length - displayedItems} remaining)
            </Button>
          </motion.div>
        )}

        {/* Gallery Stats */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="glass-dark rounded-2xl p-4">
              <div className="text-2xl font-bold gradient-text">{galleryItems.length}</div>
              <div className="text-sm text-slate-400">Total Items</div>
            </div>
            <div className="glass-dark rounded-2xl p-4">
              <div className="text-2xl font-bold gradient-text">{galleryItems.filter(item => item.type === 'image').length}</div>
              <div className="text-sm text-slate-400">Images</div>
            </div>
            <div className="glass-dark rounded-2xl p-4">
              <div className="text-2xl font-bold gradient-text">{galleryItems.filter(item => item.type === 'video').length}</div>
              <div className="text-sm text-slate-400">Videos</div>
            </div>
            <div className="glass-dark rounded-2xl p-4">
              <div className="text-2xl font-bold gradient-text">{galleryItems.filter(item => item.featured).length}</div>
              <div className="text-sm text-slate-400">Featured</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}