import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

export interface UploadedFileResponse {
    id: string;
    original: string;
    thumbnail: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
}

@Injectable()
export class UploadsService {
    private readonly uploadDir: string;

    constructor(private configService: ConfigService) {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this.ensureUploadDirExists();
    }

    private ensureUploadDirExists() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadFiles(files: Array<Express.Multer.File>): Promise<UploadedFileResponse[]> {
        try {
            const uploadPromises = files.map(file => this.processSingleFile(file));
            const results = await Promise.all(uploadPromises);
            return results;
        } catch (error) {
            throw error;
        }
    }

    private async processSingleFile(file: Express.Multer.File): Promise<UploadedFileResponse> {
        try {
            // Validate file
            this.validateFile(file);

            // Generate unique filename
            const fileExtension = path.extname(file.originalname);
            const uniqueFilename = this.generateUniqueFilename(fileExtension);
            const filePath = path.join(this.uploadDir, uniqueFilename);

            // Save file
            fs.writeFileSync(filePath, file.buffer);

            // Generate response
            const response = {
                id: crypto.randomUUID(),
                original: this.generateFileUrl(uniqueFilename),
                thumbnail: this.generateThumbnailUrl(uniqueFilename),
                filename: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                uploadedAt: new Date(),
            };

            return response;
        } catch (error) {
            throw error;
        }
    }

    private validateFile(file: Express.Multer.File) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (file.size > maxSize) {
            throw new BadRequestException(`File ${file.originalname} exceeds maximum size of 10MB`);
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
    }

    private generateUniqueFilename(extension: string): string {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        return `${timestamp}-${randomString}${extension}`;
    }

    private generateFileUrl(filename: string): string {
        const baseUrl = this.configService.get('app.baseUrl') || 'http://localhost:3000';
        return `${baseUrl}/uploads/${filename}`;
    }

    private generateThumbnailUrl(filename: string): string {
        // For now, return the same URL as original
        // In production, you'd generate actual thumbnails
        return this.generateFileUrl(filename);
    }

    findAll() {
        try {
            // In a real application, you'd fetch from database
            const files = this.getFilesFromUploadDir();
            return files;
        } catch (error) {
            throw error;
        }
    }

    private getFilesFromUploadDir(): any[] {
        try {
            const files = fs.readdirSync(this.uploadDir);
            return files.map(file => ({
                id: crypto.randomUUID(),
                filename: file,
                original: this.generateFileUrl(file),
                thumbnail: this.generateThumbnailUrl(file),
                size: fs.statSync(path.join(this.uploadDir, file)).size,
                uploadedAt: fs.statSync(path.join(this.uploadDir, file)).mtime,
            }));
        } catch (error) {
            return [];
        }
    }

    findOne(id: number) {
        try {
            // In a real application, you'd fetch from database
            const files = this.getFilesFromUploadDir();
            const file = files.find(f => f.id === id.toString());

            if (!file) {
                throw new NotFoundException(`Attachment with ID ${id} not found`);
            }

            return file;
        } catch (error) {
            throw error;
        }
    }

    remove(id: number) {
        try {
            // In a real application, you'd delete from database and storage
            const files = this.getFilesFromUploadDir();
            const file = files.find(f => f.id === id.toString());

            if (!file) {
                throw new NotFoundException(`Attachment with ID ${id} not found`);
            }

            // Delete file from filesystem
            const filePath = path.join(this.uploadDir, file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            return { message: `Attachment with ID ${id} deleted successfully` };
        } catch (error) {
            throw error;
        }
    }

    // Utility method to clean up old files
    async cleanupOldFiles(days: number = 30): Promise<void> {
        try {
            const files = this.getFilesFromUploadDir();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            for (const file of files) {
                if (new Date(file.uploadedAt) < cutoffDate) {
                    const filePath = path.join(this.uploadDir, file.filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }
}