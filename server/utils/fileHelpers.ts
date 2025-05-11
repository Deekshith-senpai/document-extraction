import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { URL } from 'url';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// Directory for uploaded files
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
export async function ensureUploadDir(): Promise<void> {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
    throw new Error('Failed to create upload directory');
  }
}

// Save a file from buffer
export async function saveFile(
  buffer: Buffer, 
  originalName: string
): Promise<{ path: string; name: string }> {
  await ensureUploadDir();
  
  // Generate a unique file name
  const fileExtension = path.extname(originalName);
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const fileName = `${timestamp}-${randomString}${fileExtension}`;
  
  const filePath = path.join(UPLOAD_DIR, fileName);
  
  try {
    await writeFile(filePath, buffer);
    return {
      path: filePath,
      name: fileName
    };
  } catch (error) {
    console.error('Failed to save file:', error);
    throw new Error('Failed to save uploaded file');
  }
}

// Get file as buffer
export async function getFileAsBuffer(filePath: string): Promise<Buffer> {
  try {
    return await readFile(filePath);
  } catch (error) {
    console.error('Failed to read file:', error);
    throw new Error('Failed to read file from disk');
  }
}

// Validate file
export function validatePdfFile(
  file: Express.Multer.File
): { valid: boolean; error?: string } {
  // Check file type
  if (file.mimetype !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' };
  }
  
  // Check file size (25MB)
  const MAX_SIZE = 25 * 1024 * 1024; // 25MB in bytes
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size exceeds 25MB limit' };
  }
  
  return { valid: true };
}

// Delete file
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await promisify(fs.unlink)(filePath);
  } catch (error) {
    console.error('Failed to delete file:', error);
    // Don't throw, just log the error
  }
}
