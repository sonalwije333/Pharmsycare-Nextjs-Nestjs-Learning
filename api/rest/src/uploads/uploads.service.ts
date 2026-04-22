// uploads/uploads.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { paginate } from 'src/common/pagination/paginate';
import { UploadResponseDto, UploadsResponseDto, UploadPaginatorDto } from './dto/upload-response.dto';
import { GetUploadsDto } from './dto/get-uploads.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { UploadFile } from 'src/common/types/upload-file.type';
interface UploadRecord {
  id: string;
  original: string;
  thumbnail: string;
  filename: string;
  size: number;
  mimetype: string;
  created_at: Date;
}

@Injectable()
export class UploadsService {

  private uploads: UploadRecord[] = [
    {
      id: '883',
      original: 'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/aatik-tasneem-7omHUGhhmZ0-unsplash%402x.png',
      thumbnail: 'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/conversions/aatik-tasneem-7omHUGhhmZ0-unsplash%402x-thumbnail.jpg',
      filename: 'aatik-tasneem-7omHUGhhmZ0-unsplash@2x.png',
      size: 1024000,
      mimetype: 'image/png',
      created_at: new Date('2024-01-01T00:00:00.000Z'),
    },
  ];

  async uploadFiles(files: UploadFile[]): Promise<UploadsResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedFiles: UploadResponseDto[] = [];

    for (const file of files) {

      const fileId = randomUUID();
      
      const mockFile: UploadRecord = {
        id: fileId,
        original: `https://example.com/uploads/${fileId}/${encodeURIComponent(file.originalname)}`,
        thumbnail: `https://example.com/uploads/${fileId}/thumbnail-${encodeURIComponent(file.originalname)}`,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        created_at: new Date(),
      };

      this.uploads.unshift(mockFile);
      
      uploadedFiles.push({
        id: mockFile.id,
        original: mockFile.original,
        thumbnail: mockFile.thumbnail,
      });
    }

    return {
      data: uploadedFiles,
    };
  }

  async findAll({
    page = 1,
    limit = 10,
    search,
    mimetype,
    orderBy = 'created_at',
    sortedBy = 'DESC'
  }: GetUploadsDto): Promise<UploadPaginatorDto> {
    let data = [...this.uploads];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(upload => 
        upload.filename.toLowerCase().includes(searchLower)
      );
    }

    if (mimetype) {
      data = data.filter(upload => upload.mimetype === mimetype);
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (orderBy) {
        case 'filename':
          aValue = a.filename;
          bValue = b.filename;
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (sortedBy === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const mappedResults = results.map(upload => ({
      id: upload.id,
      original: upload.original,
      thumbnail: upload.thumbnail,
    }));

    const url = `/attachments?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: mappedResults,
      current_page: paginationInfo.current_page,
      per_page: paginationInfo.per_page,
      total: paginationInfo.total,
      last_page: paginationInfo.last_page,
    };
  }

  async findOne(id: string): Promise<UploadResponseDto> {
    const upload = this.uploads.find(u => u.id === id);
    
    if (!upload) {
      throw new NotFoundException(`Upload with ID ${id} not found`);
    }
    
    return {
      id: upload.id,
      original: upload.original,
      thumbnail: upload.thumbnail,
    };
  }

  async remove(id: string): Promise<CoreMutationOutput> {
    const uploadIndex = this.uploads.findIndex(u => u.id === id);
    
    if (uploadIndex === -1) {
      throw new NotFoundException(`Upload with ID ${id} not found`);
    }

    // In a real implementation, you would also delete the file from storage
    this.uploads.splice(uploadIndex, 1);
    
    return {
      success: true,
      message: 'Upload deleted successfully',
    };
  }

  async removeMany(ids: string[]): Promise<CoreMutationOutput> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided');
    }

    let deletedCount = 0;
    const notFoundIds: string[] = [];
    
    for (const id of ids) {
      const uploadIndex = this.uploads.findIndex(u => u.id === id);
      if (uploadIndex !== -1) {
        this.uploads.splice(uploadIndex, 1);
        deletedCount++;
      } else {
        notFoundIds.push(id);
      }
    }

    if (deletedCount === 0) {
      throw new NotFoundException(`Uploads not found: ${notFoundIds.join(', ')}`);
    }

    return {
      success: true,
      message: `${deletedCount} upload(s) deleted successfully${notFoundIds.length ? ` (${notFoundIds.length} not found)` : ''}`,
    };
  }
}