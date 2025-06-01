import type { Express, Request, Response, NextFunction } from "express";
import { z } from 'zod';
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGalleryItemSchema } from "@shared/schema";
import { requireAuth } from "./auth";

// Custom error class for API errors
class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Async handler to catch errors in async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Input validation middleware
const validateQuery = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      next(new ApiError('Invalid query parameters', 400));
    }
  };
};

// Query validation schema
const galleryQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  type: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
});

export function setupRoutes(app: Express) {
  // Health check endpoint for Railway
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Service is healthy" });
  });

  // Gallery routes
  app.get("/api/gallery", validateQuery(galleryQuerySchema), asyncHandler(async (req, res) => {
    const { category, search, type, featured } = req.query as z.infer<typeof galleryQuerySchema>;
    
    let items;
    if (search) {
      items = await storage.searchGalleryItems(search);
    } else if (featured === 'true') {
      items = await storage.getFeaturedItems();
    } else if (type && type !== 'all') {
      items = await storage.getGalleryItemsByType(type);
    } else if (category && category !== 'all') {
      items = await storage.getGalleryItemsByCategory(category);
    } else {
      items = await storage.getAllGalleryItems();
    }
    
    res.json(items);
  }));

  // Categories route - must be placed BEFORE the :id route to prevent conflicts
  app.get("/api/gallery/categories", asyncHandler(async (req, res) => {
    const items = await storage.getAllGalleryItems();
    const categories = Array.from(new Set(items.map(item => item.category)));
    res.json(categories);
  }));

  // Single gallery item route - must be placed AFTER specific routes like /categories
  app.get("/api/gallery/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      throw new ApiError('Invalid ID format', 400);
    }
    
    const item = await storage.getGalleryItem(id);
    
    if (!item) {
      throw new ApiError('Gallery item not found', 404);
    }
    
    res.json(item);
  }));
  
  // Admin routes - Protected with authentication
  app.post("/api/admin/gallery", requireAuth, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertGalleryItemSchema.parse(req.body);
      const newItem = await storage.createGalleryItem(validatedData);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      throw error;
    }
  }));

  app.put("/api/admin/gallery/:id", requireAuth, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      throw new ApiError('Invalid ID format', 400);
    }
    
    try {
      const validatedData = insertGalleryItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updateGalleryItem(id, validatedData);
      
      if (!updatedItem) {
        throw new ApiError('Gallery item not found', 404);
      }
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      throw error;
    }
  }));

  app.delete("/api/admin/gallery/:id", requireAuth, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      throw new ApiError('Invalid ID format', 400);
    }
    
    const deleted = await storage.deleteGalleryItem(id);
    
    if (!deleted) {
      throw new ApiError('Gallery item not found', 404);
    }
    
    res.status(204).send();
  }));
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up the routes
  setupRoutes(app);
  
  // Create and return the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
