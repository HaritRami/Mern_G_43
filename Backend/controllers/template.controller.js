import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/reviewTemplates.json');

// Memory cache to avoid hitting disk excessively
let templateCache = null;

const ensureDataFile = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // If doesn't exist, create an empty array JSON
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
};

const readTemplates = async () => {
  if (templateCache) return templateCache;
  await ensureDataFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    templateCache = JSON.parse(data);
    return templateCache;
  } catch (error) {
    console.error("Error reading templates JSON:", error);
    return [];
  }
};

const writeTemplates = async (dataArray) => {
  try {
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(dataArray, null, 2), 'utf8');
    templateCache = dataArray; // update cache
    return true;
  } catch (error) {
    console.error("Error writing templates JSON:", error);
    return false;
  }
};

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// ─── CLIENT: Generate Random Template ─────────────────────────────────────
export const generateReviewTemplate = async (req, res) => {
  try {
    const { rating, productName = '', categoryName = '', discount = 0, platformName = 'NexaMart' } = req.query;

    let targetRating = Number(rating) || 0;
    const templates = await readTemplates();

    // Filter templates by rating if rating > 0
    let matchTemplates = targetRating > 0 ? templates.filter(t => Number(t.rating) === targetRating) : [];

    // If no exact match (or targetRating is 0), fallback to all
    if (matchTemplates.length === 0) {
      if (templates.length > 0) {
        matchTemplates = templates; 
      } else {
        return res.status(200).json({
          success: true,
          data: { suggestion: "Great product! Highly recommended.", rating: 5 }
        });
      }
    }

    // Pick random
    const randomIdx = Math.floor(Math.random() * matchTemplates.length);
    let selectedText = matchTemplates[randomIdx].template;
    let assignedRating = matchTemplates[randomIdx].rating;

    // Apply tokens safely
    selectedText = selectedText.replace(/{{product_name}}/g, productName || 'product');
    selectedText = selectedText.replace(/{{category_name}}/g, categoryName || 'item');
    selectedText = selectedText.replace(/{{discount}}/g, discount || '0');
    selectedText = selectedText.replace(/{{platform_name}}/g, platformName || 'NexaMart');

    return res.status(200).json({
      success: true,
      data: { suggestion: selectedText, rating: assignedRating }
    });
  } catch (error) {
    console.error('generateReviewTemplate error:', error);
    return res.status(500).json({ success: false, message: 'Unable to generate suggestion' });
  }
};

// ─── ADMIN: Get All Templates ──────────────────────────────────────────────
export const getAllTemplates = async (req, res) => {
  try {
    const templates = await readTemplates();
    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching templates' });
  }
};

// ─── ADMIN: Add Template ───────────────────────────────────────────────────
export const addTemplate = async (req, res) => {
  try {
    const { rating, template } = req.body;
    
    if (!rating || !template || typeof template !== 'string') {
      return res.status(400).json({ success: false, message: 'Rating and template text are required' });
    }
    
    const templates = await readTemplates();
    const newDoc = {
      id: generateId(),
      rating: Number(rating),
      template: template.trim()
    };
    
    templates.push(newDoc);
    const saved = await writeTemplates(templates);
    
    if (!saved) return res.status(500).json({ success: false, message: 'Error saving to file' });
    
    return res.status(201).json({ success: true, message: 'Template added', data: newDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error adding template' });
  }
};

// ─── ADMIN: Update Template ────────────────────────────────────────────────
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, template } = req.body;
    
    const templates = await readTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    
    if (rating) templates[index].rating = Number(rating);
    if (template) templates[index].template = template.trim();
    
    const saved = await writeTemplates(templates);
    if (!saved) return res.status(500).json({ success: false, message: 'Error saving to file' });
    
    return res.status(200).json({ success: true, message: 'Template updated', data: templates[index] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error updating template' });
  }
};

// ─── ADMIN: Delete Template ────────────────────────────────────────────────
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const templates = await readTemplates();
    const newTemplates = templates.filter(t => t.id !== id);
    
    if (newTemplates.length === templates.length) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    
    const saved = await writeTemplates(newTemplates);
    if (!saved) return res.status(500).json({ success: false, message: 'Error saving to file' });
    
    return res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error deleting template' });
  }
};
