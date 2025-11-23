import express from 'express';
import apiRoutes from './routes/api.js';

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  initializeMiddleware() {
    // Parse JSON bodies
    this.app.use(express.json());
    
    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true }));

    // CORS headers (if needed)
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });
  }

  initializeRoutes() {
    // Health check endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Kloth.me Image Scraper API',
        endpoints: {
          extractImages: 'GET /api/extract-images?url=<ecommerce-url>'
        }
      });
    });

    // API routes
    this.app.use('/api', apiRoutes);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
      console.log(`Try: http://localhost:${this.port}/api/extract-images?url=<your-ecommerce-url>`);
    });
  }
}

export default Server;
