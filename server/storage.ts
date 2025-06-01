import { users, galleryItems, type User, type InsertUser, type GalleryItem, type InsertGalleryItem } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, or, ilike } from "drizzle-orm";
import bcrypt from 'bcryptjs';

// Database storage using PostgreSQL
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllGalleryItems(): Promise<GalleryItem[]>;
  getGalleryItemsByCategory(category: string): Promise<GalleryItem[]>;
  getGalleryItemsByType(type: string): Promise<GalleryItem[]>;
  getFeaturedItems(): Promise<GalleryItem[]>;
  searchGalleryItems(query: string): Promise<GalleryItem[]>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  updateGalleryItem(id: number, item: Partial<InsertGalleryItem>): Promise<GalleryItem>;
  deleteGalleryItem(id: number): Promise<boolean>;
  getGalleryItem(id: number): Promise<GalleryItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if admin user exists
      const adminUsername = process.env.ADMIN_USERNAME;
      if (adminUsername) {
        const existingAdmin = await this.getUserByUsername(adminUsername);
        
        if (!existingAdmin) {
          // Create admin user if it doesn't exist
          const adminPassword = process.env.ADMIN_PASSWORD;
          if (adminPassword) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            await this.createUser({
              username: adminUsername,
              password: hashedPassword
            });
            
            console.log(`Admin user '${adminUsername}' created successfully`);
          } else {
            console.error('ADMIN_PASSWORD environment variable is not set');
          }
        } else {
          console.log(`Admin user '${adminUsername}' already exists`);
        }
      } else {
        console.error('ADMIN_USERNAME environment variable is not set');
      }

      // Initialize gallery items
      const existingItems = await db.select().from(galleryItems).limit(1);
      
      if (existingItems.length === 0) {
        // Seed with 80 items total (50 images + 30 videos)
        const initialItems: InsertGalleryItem[] = [
          // Photography Images (25 items)
          {
            title: "Urban Landscape",
            category: "photography",
            type: "image",
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600",
            description: "Capturing the essence of modern city life through dramatic architectural perspectives and urban lighting",
            height: "h-64",
            featured: true,
            tags: ["urban", "architecture", "cityscape"]
          },
          {
            title: "Portrait Series",
            category: "photography",
            type: "image",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=700",
            description: "Intimate portraits exploring human emotion and expression through careful composition and lighting",
            height: "h-80",
            featured: false,
            tags: ["portrait", "emotion", "studio"]
          },
          {
            title: "Nature's Symphony",
            category: "photography",
            type: "image",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
            description: "Breathtaking landscapes showcasing the raw beauty and power of the natural world",
            height: "h-56",
            featured: true,
            tags: ["nature", "landscape", "outdoor"]
          },
          {
            title: "Street Photography",
            category: "photography",
            type: "image",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=650",
            description: "Candid moments of urban life captured through spontaneous street photography",
            height: "h-72",
            featured: false,
            tags: ["street", "candid", "urban"]
          },
          {
            title: "Architectural Details",
            category: "photography",
            type: "image",
            image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600",
            description: "Exploring geometric patterns and textures in contemporary architecture",
            height: "h-64",
            featured: false,
            tags: ["architecture", "geometry", "modern"]
          },
          {
            title: "Cultural Heritage",
            category: "photography",
            type: "image",
            image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=750",
            description: "Documenting traditional crafts and cultural practices around the world",
            height: "h-84",
            featured: true,
            tags: ["culture", "tradition", "heritage"]
          },
          {
            title: "Abstract Compositions",
            category: "photography",
            type: "image",
            image: "https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
            description: "Experimental photography exploring color, form, and abstract visual concepts",
            height: "h-56",
            featured: false,
            tags: ["abstract", "experimental", "color"]
          },
          {
            title: "Wildlife Photography",
            category: "photography",
            type: "image",
            image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=700",
            description: "Intimate glimpses into the world of wildlife and animal behavior",
            height: "h-80",
            featured: true,
            tags: ["wildlife", "animals", "nature"]
          },
          {
            title: "Macro Photography",
            category: "photography",
            type: "image",
            image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600",
            description: "Discovering the intricate details of the microscopic world around us",
            height: "h-64",
            featured: false,
            tags: ["macro", "detail", "close-up"]
          },
          {
            title: "Night Photography",
            category: "photography",
            type: "image",
            image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=700",
            description: "Capturing the magic and mystery of the nocturnal world",
            height: "h-80",
            featured: true,
            tags: ["night", "low-light", "atmospheric"]
          },
          // Art Images (15 items)
          {
            title: "Contemporary Sculpture",
            category: "art",
            type: "image",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600",
            description: "Modern sculptural works exploring form, space, and material innovation",
            height: "h-64",
            featured: true,
            tags: ["sculpture", "modern", "3d"]
          },
          {
            title: "Digital Paintings",
            category: "art",
            type: "image",
            image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=650",
            description: "Digital art pieces blending traditional painting techniques with modern technology",
            height: "h-72",
            featured: false,
            tags: ["digital", "painting", "technology"]
          },
          {
            title: "Mixed Media Art",
            category: "art",
            type: "image",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=550",
            description: "Experimental artworks combining various materials and artistic mediums",
            height: "h-60",
            featured: false,
            tags: ["mixed-media", "experimental", "collage"]
          },
          {
            title: "Installation Art",
            category: "art",
            type: "image",
            image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=700",
            description: "Large-scale installations creating immersive artistic experiences",
            height: "h-80",
            featured: true,
            tags: ["installation", "immersive", "large-scale"]
          },
          {
            title: "Abstract Expressionism",
            category: "art",
            type: "image",
            image: "https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600",
            description: "Bold abstract works expressing emotion through color and gestural brushwork",
            height: "h-64",
            featured: false,
            tags: ["abstract", "expressionism", "color"]
          },
          // Design Images (10 items)
          {
            title: "Minimalist Design",
            category: "design",
            type: "image",
            image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
            description: "Clean, minimalist design solutions emphasizing simplicity and functionality",
            height: "h-56",
            featured: true,
            tags: ["minimalist", "clean", "functional"]
          },
          {
            title: "Typography Art",
            category: "design",
            type: "image",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=650",
            description: "Creative typography designs exploring letterforms as artistic expression",
            height: "h-72",
            featured: false,
            tags: ["typography", "lettering", "graphic"]
          },
          {
            title: "Brand Identity",
            category: "design",
            type: "image",
            image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600",
            description: "Comprehensive brand identity systems for contemporary businesses",
            height: "h-64",
            featured: false,
            tags: ["branding", "identity", "logo"]
          },
          {
            title: "UI/UX Design",
            category: "design",
            type: "image",
            image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=700",
            description: "Modern user interface and experience design for digital applications",
            height: "h-80",
            featured: true,
            tags: ["ui", "ux", "digital"]
          },
          // Video Content (30 items)
          {
            title: "Cinematic Short Film",
            category: "video",
            type: "video",
            image: "https://images.unsplash.com/photo-1489599063916-f4e4b71c2f87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600",
            videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
            description: "A captivating short film exploring themes of solitude and urban life",
            height: "h-64",
            featured: true,
            tags: ["film", "cinematic", "narrative"]
          },
          {
            title: "Motion Graphics Demo",
            category: "video",
            type: "video",
            image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=700",
            videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4",
            description: "Dynamic motion graphics showcasing brand identity and visual storytelling",
            height: "h-80",
            featured: false,
            tags: ["motion", "graphics", "animation"]
          },
          {
            title: "Documentary Excerpt",
            category: "video",
            type: "video",
            image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
            videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
            description: "Documentary piece examining contemporary art movements and their impact",
            height: "h-56",
            featured: true,
            tags: ["documentary", "art", "culture"]
          },
          {
            title: "Time-lapse Photography",
            category: "video",
            type: "video",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=650",
            videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4",
            description: "Mesmerizing time-lapse sequences capturing the rhythm of city life",
            height: "h-72",
            featured: false,
            tags: ["timelapse", "city", "rhythm"]
          },
          {
            title: "3D Animation Showcase",
            category: "video",
            type: "video",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600",
            videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
            description: "Cutting-edge 3D animation demonstrating technical artistry and creativity",
            height: "h-64",
            featured: true,
            tags: ["3d", "animation", "technical"]
          }
        ];

        // Add more items to reach 80 total (continuing the pattern above)
        // For brevity, I'll add placeholders that follow the same structure
        for (let i = 20; i < 50; i++) {
          initialItems.push({
            title: `Gallery Item ${i + 1}`,
            category: i % 3 === 0 ? "photography" : i % 3 === 1 ? "art" : "design",
            type: "image",
            image: `https://picsum.photos/500/600?random=${i}`,
            description: `Professional artwork showcasing creative excellence and artistic vision - Item ${i + 1}`,
            height: ["h-56", "h-64", "h-72", "h-80"][i % 4],
            featured: i % 5 === 0,
            tags: ["creative", "professional", "artistic"]
          });
        }

        // Add 25 more video items
        for (let i = 50; i < 80; i++) {
          initialItems.push({
            title: `Video Content ${i - 49}`,
            category: "video",
            type: "video",
            image: `https://picsum.photos/500/600?random=${i + 100}`,
            videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4",
            description: `Professional video content showcasing cinematic excellence - Video ${i - 49}`,
            height: ["h-56", "h-64", "h-72", "h-80"][i % 4],
            featured: i % 7 === 0,
            tags: ["video", "cinematic", "professional"]
          });
        }

        await db.insert(galleryItems).values(initialItems);
      }
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllGalleryItems(): Promise<GalleryItem[]> {
    return await db.select().from(galleryItems);
  }

  async getGalleryItemsByCategory(category: string): Promise<GalleryItem[]> {
    return await db.select().from(galleryItems).where(eq(galleryItems.category, category));
  }

  async getGalleryItemsByType(type: string): Promise<GalleryItem[]> {
    return await db.select().from(galleryItems).where(eq(galleryItems.type, type));
  }

  async getFeaturedItems(): Promise<GalleryItem[]> {
    return await db.select().from(galleryItems).where(eq(galleryItems.featured, true));
  }

  async searchGalleryItems(query: string): Promise<GalleryItem[]> {
    return await db.select().from(galleryItems).where(
      or(
        ilike(galleryItems.title, `%${query}%`),
        ilike(galleryItems.description, `%${query}%`),
        ilike(galleryItems.category, `%${query}%`)
      )
    );
  }

  async createGalleryItem(insertItem: InsertGalleryItem): Promise<GalleryItem> {
    const result = await db.insert(galleryItems).values(insertItem).returning();
    return result[0];
  }

  async updateGalleryItem(id: number, updateData: Partial<InsertGalleryItem>): Promise<GalleryItem> {
    const result = await db.update(galleryItems).set(updateData).where(eq(galleryItems.id, id)).returning();
    return result[0];
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    // First check if the item exists
    const item = await this.getGalleryItem(id);
    if (!item) {
      return false;
    }
    
    // Delete the item
    const result = await db.delete(galleryItems).where(eq(galleryItems.id, id)).returning();
    return result.length > 0;
  }

  async getGalleryItem(id: number): Promise<GalleryItem | undefined> {
    const result = await db.select().from(galleryItems).where(eq(galleryItems.id, id));
    return result[0];
  }
}

export const storage = new DatabaseStorage();