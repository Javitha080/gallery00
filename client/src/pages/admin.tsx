import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, Video, Image, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GalleryItem, InsertGalleryItem } from "@shared/schema";

export default function AdminPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Move formData state before any conditional returns
  const [formData, setFormData] = useState<InsertGalleryItem>({
    title: "",
    category: "photography",
    type: "image",
    image: "",
    videoUrl: "",
    description: "",
    height: "h-64",
    featured: false,
    tags: []
  });

  // Check authentication status
  const { data: user, isLoading: isAuthLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  
  // Move gallery items query before conditional returns
  const { data: galleryItems = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  // Move mutations before conditional returns
  const createMutation = useMutation({
    mutationFn: (data: InsertGalleryItem) => apiRequest(
      'POST',
      '/api/admin/gallery',
      data
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Gallery item created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create gallery item", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertGalleryItem> }) => 
      apiRequest(
        'PUT',
        `/api/admin/gallery/${id}`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({ title: "Success", description: "Gallery item updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update gallery item", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Success", description: "Gallery item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete gallery item", variant: "destructive" });
    }
  });

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/login");
    }
  }, [user, isAuthLoading, setLocation]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: "",
      category: "photography",
      type: "image",
      image: "",
      videoUrl: "",
      description: "",
      height: "h-64",
      featured: false,
      tags: []
    });
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      type: item.type,
      image: item.image,
      videoUrl: item.videoUrl || "",
      description: item.description || "",
      height: item.height,
      featured: item.featured,
      tags: item.tags || []
    });
    setIsEditDialogOpen(true);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(id);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  return (
    <div className="min-h-screen cinematic-bg">
      {/* Header */}
      <div className="glass-dark border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-playfair font-bold gradient-text">
                Lumina Admin Portal
              </h1>
              <p className="text-slate-400 mt-1">Manage your gallery content</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="glass" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="glass hover:animate-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-dark border-white/20 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="gradient-text">Add New Gallery Item</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                        className="glass"
                      />
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="glass">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="photography">Photography</SelectItem>
                          <SelectItem value="art">Art</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="glass">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={formData.height} onValueChange={(value) => setFormData(prev => ({ ...prev, height: value }))}>
                        <SelectTrigger className="glass">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h-56">Small</SelectItem>
                          <SelectItem value="h-64">Medium</SelectItem>
                          <SelectItem value="h-72">Large</SelectItem>
                          <SelectItem value="h-80">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Input
                      placeholder="Image URL"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      required
                      className="glass"
                    />

                    {formData.type === 'video' && (
                      <Input
                        placeholder="Video URL"
                        value={formData.videoUrl || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                        className="glass"
                      />
                    )}

                    <Textarea
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      className="glass"
                      rows={3}
                    />

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="featured" className="text-sm text-slate-300">Featured Item</label>
                    </div>

                    <div>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Add tag and press Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="glass"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="glass cursor-pointer" onClick={() => removeTag(tag)}>
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="glass" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Creating..." : "Create Item"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-dark border-white/20">
            <CardContent className="p-6">
              <div className="text-2xl font-bold gradient-text">{galleryItems.length}</div>
              <p className="text-slate-400">Total Items</p>
            </CardContent>
          </Card>
          <Card className="glass-dark border-white/20">
            <CardContent className="p-6">
              <div className="text-2xl font-bold gradient-text">
                {galleryItems.filter(item => item.type === 'image').length}
              </div>
              <p className="text-slate-400">Images</p>
            </CardContent>
          </Card>
          <Card className="glass-dark border-white/20">
            <CardContent className="p-6">
              <div className="text-2xl font-bold gradient-text">
                {galleryItems.filter(item => item.type === 'video').length}
              </div>
              <p className="text-slate-400">Videos</p>
            </CardContent>
          </Card>
          <Card className="glass-dark border-white/20">
            <CardContent className="p-6">
              <div className="text-2xl font-bold gradient-text">
                {galleryItems.filter(item => item.featured).length}
              </div>
              <p className="text-slate-400">Featured</p>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              className="glass-dark rounded-2xl overflow-hidden border border-white/10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  {item.type === 'video' ? (
                    <Badge className="bg-red-500/80">
                      <Video className="w-3 h-3 mr-1" />
                      Video
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/80">
                      <Image className="w-3 h-3 mr-1" />
                      Image
                    </Badge>
                  )}
                </div>
                {item.featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-violet-500/80">Featured</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1 truncate">{item.title}</h3>
                <p className="text-sm text-slate-400 mb-2 capitalize">{item.category}</p>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">ID: {item.id}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`/preview/${item.id}`, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dark border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text">Edit Gallery Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Same form content as add dialog */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="glass"
              />
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formData.height} onValueChange={(value) => setFormData(prev => ({ ...prev, height: value }))}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h-56">Small</SelectItem>
                  <SelectItem value="h-64">Medium</SelectItem>
                  <SelectItem value="h-72">Large</SelectItem>
                  <SelectItem value="h-80">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Image URL"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              required
              className="glass"
            />

            {formData.type === 'video' && (
              <Input
                placeholder="Video URL"
                value={formData.videoUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                className="glass"
              />
            )}

            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              className="glass"
              rows={3}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-featured"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="edit-featured" className="text-sm text-slate-300">Featured Item</label>
            </div>

            <div>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="glass"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="glass cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="glass" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
