// src/config/database/seeders/user-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../../../users/entities/user.entity';
import { Profile } from '../../../users/entities/profile.entity';
import { Address, UserAddress } from '../../../addresses/entities/address.entity';
import { Permission, AddressType } from '../../../common/enums/enums';

@Injectable()
export class UserSeederService {
  private readonly logger = new Logger(UserSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting user seeder...');

    try {
      const usersJsonPath = await this.findUsersJsonPath();
      
      if (!usersJsonPath) {
        this.logger.error('❌ Could not find users.json file');
        return;
      }

      this.logger.log(`📁 Found users.json at: ${usersJsonPath}`);
      const usersData = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
      
      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      for (const userData of usersData) {
        const result = await this.createOrUpdateUser(userData);
        if (result === 'created') createdCount++;
        if (result === 'updated') updatedCount++;
        if (result === 'skipped') skippedCount++;
      }

      this.logger.log(`✅ Seeded users - Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}, Total: ${usersData.length}`);
    } catch (error) {
      this.logger.error('❌ Failed to seed users:', error.message);
      throw error;
    }
  }

  private async findUsersJsonPath(): Promise<string | null> {
    // First, check environment variable
    const envPath = process.env.USERS_JSON_PATH;
    if (envPath && fs.existsSync(envPath)) {
      this.logger.log(`📁 Using users.json from environment variable`);
      return envPath;
    }

    // Check for config file
    const configPath = await this.getConfigPath();
    if (configPath) {
      return configPath;
    }

    // Try multiple possible paths
    const possiblePaths = [
      // Your specific path from error message
      path.join(process.cwd(), 'src', 'config', 'database', 'pickbazar', 'users.json'),
      path.join(process.cwd(), 'api-src-db-pickbazar', 'users.json'),
      path.join(process.cwd(), 'src', 'db', 'pickbazar', 'users.json'),
      path.join(process.cwd(), 'database', 'pickbazar', 'users.json'),
      path.join(process.cwd(), 'pickbazar', 'users.json'),
      path.join(process.cwd(), '..', 'api-src-db-pickbazar', 'users.json'),
      path.join(process.cwd(), '..', 'pickbazar', 'users.json'),
      path.join(__dirname, '..', '..', '..', '..', 'pickbazar', 'users.json'),
      path.join(__dirname, '..', '..', '..', '..', '..', 'pickbazar', 'users.json'),
      path.join(__dirname, '..', '..', '..', '..', '..', '..', 'pickbazar', 'users.json'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    // Try to find the file by walking up the directory tree
    return this.findUsersJsonRecursive();
  }

  private async getConfigPath(): Promise<string | null> {
    const configPaths = [
      path.join(process.cwd(), '.seederrc.json'),
      path.join(process.cwd(), 'seeder-config.json'),
      path.join(process.cwd(), 'config', 'seeder.json'),
    ];

    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          if (config.usersJsonPath && fs.existsSync(config.usersJsonPath)) {
            this.logger.log(`📁 Using users.json from config file: ${configPath}`);
            return config.usersJsonPath;
          }
        } catch (e) {
          this.logger.error(`Failed to parse config file: ${configPath}`);
        }
      }
    }

    return null;
  }

  private findUsersJsonRecursive(): string | null {
    // Start from current working directory and go up
    let currentDir = process.cwd();
    const maxDepth = 5; // Limit how far up we go
    let depth = 0;
    
    while (depth < maxDepth) {
      // Check common patterns in current directory
      const patterns = [
        path.join(currentDir, 'src', 'config', 'database', 'pickbazar', 'users.json'),
        path.join(currentDir, 'src', 'db', 'pickbazar', 'users.json'),
        path.join(currentDir, 'api-src-db-pickbazar', 'users.json'),
        path.join(currentDir, 'database', 'pickbazar', 'users.json'),
        path.join(currentDir, 'db', 'pickbazar', 'users.json'),
        path.join(currentDir, 'seeders', 'pickbazar', 'users.json'),
        path.join(currentDir, 'pickbazar', 'users.json'),
      ];
      
      for (const pattern of patterns) {
        if (fs.existsSync(pattern)) {
          return pattern;
        }
      }
      
      // Move up one directory
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Reached root
      currentDir = parentDir;
      depth++;
    }
    
    return null;
  }

  private async createOrUpdateUser(userData: any): Promise<'created' | 'updated' | 'skipped'> {
    try {
      // Skip if no email
      if (!userData.email) {
        this.logger.warn('⚠️ Skipping user with no email');
        return 'skipped';
      }

      // Check if user already exists
      let user = await this.userRepository.findOne({
        where: { email: userData.email },
        relations: ['profile', 'address'],
      });

      // Map permissions from the JSON structure
      const permissions = this.mapPermissions(userData.permissions);
      
      // Hash password (default password: demodemo)
      const defaultPassword = 'demodemo';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      if (user) {
        // Update existing user
        user.name = userData.name || user.name;
        user.email = userData.email;
        user.is_active = userData.is_active === 1 || userData.is_active === true;
        user.permissions = permissions;
        
        // Don't update password if user already exists
        user = await this.userRepository.save(user);
        
        // Update profile
        if (userData.profile) {
          await this.createOrUpdateProfile(user, userData.profile);
        }
        
        // Update addresses
        if (userData.address && userData.address.length > 0) {
          await this.createAddresses(user, userData.address);
        }
        
        this.logger.debug(`🔄 Updated user: ${user.email} (ID: ${user.id})`);
        return 'updated';
      } else {
        // Create new user
        user = this.userRepository.create({
          name: userData.name || 'User',
          email: userData.email,
          password: hashedPassword,
          is_active: userData.is_active === 1 || userData.is_active === true,
          permissions: permissions,
        });
        
        user = await this.userRepository.save(user);
        
        // Create profile
        if (userData.profile) {
          await this.createOrUpdateProfile(user, userData.profile);
        }
        
        // Create addresses
        if (userData.address && userData.address.length > 0) {
          await this.createAddresses(user, userData.address);
        }
        
        this.logger.debug(`✅ Created user: ${user.email} (ID: ${user.id})`);
        return 'created';
      }
    } catch (error) {
      this.logger.error(`❌ Failed to process user ${userData?.email || 'unknown'}:`, error.message);
      return 'skipped';
    }
  }

  private async createOrUpdateProfile(user: User, profileData: any) {
    try {
      let profile = await this.profileRepository.findOne({
        where: { customer: { id: user.id } },
      });

      // Process avatar if it exists
      let avatar = null;
      if (profileData.avatar) {
        if (typeof profileData.avatar === 'string') {
          avatar = profileData.avatar;
        } else if (profileData.avatar?.original) {
          avatar = profileData.avatar.original;
        } else if (profileData.avatar?.thumbnail) {
          avatar = profileData.avatar.thumbnail;
        }
      }

      if (profile) {
        // Update existing profile
        profile.avatar = avatar || profile.avatar;
        profile.bio = profileData.bio || profile.bio;
        profile.socials = profileData.socials || profile.socials;
        profile.contact = profileData.contact || profile.contact;
        await this.profileRepository.save(profile);
        this.logger.debug(`🔄 Updated profile for user: ${user.email}`);
      } else {
        // Create new profile
        profile = this.profileRepository.create({
          avatar: avatar,
          bio: profileData.bio,
          socials: profileData.socials,
          contact: profileData.contact,
          customer: user,
        });
        await this.profileRepository.save(profile);
        this.logger.debug(`✅ Created profile for user: ${user.email}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to create/update profile for user ${user.email}:`, error.message);
    }
  }

  private async createAddresses(user: User, addressesData: any[]) {
    try {
      let createdCount = 0;
      
      for (const addressData of addressesData) {
        // Check if address already exists
        const existingAddress = await this.addressRepository.findOne({
          where: { 
            customer: { id: user.id },
            title: addressData.title || 'Address',
          },
        });

        if (!existingAddress) {
          // Create UserAddress object from the address data
          const userAddress = new UserAddress();
          userAddress.street_address = addressData.address?.street_address || 
                                       addressData.address?.streetAddress || '';
          userAddress.country = addressData.address?.country || '';
          userAddress.city = addressData.address?.city || '';
          userAddress.state = addressData.address?.state || '';
          userAddress.zip = addressData.address?.zip || '';

          // Map the address type to enum
          let addressType = AddressType.BILLING;
          if (addressData.type?.toLowerCase() === 'shipping') {
            addressType = AddressType.SHIPPING;
          }

          const address = this.addressRepository.create({
            title: addressData.title || 'Address',
            type: addressType,
            default: addressData.default || false,
            address: userAddress,
            customer: user,
          });
          
          await this.addressRepository.save(address);
          createdCount++;
        }
      }
      
      if (createdCount > 0) {
        this.logger.debug(`📍 Created ${createdCount} new addresses for user ${user.email}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to create addresses for user ${user.email}:`, error.message);
    }
  }

  private mapPermissions(permissionsData: any[]): Permission[] {
    if (!permissionsData || permissionsData.length === 0) {
      return [Permission.CUSTOMER];
    }

    const permissionMap = {
      'super_admin': Permission.SUPER_ADMIN,
      'store_owner': Permission.STORE_OWNER,
      'staff': Permission.STAFF,
      'customer': Permission.CUSTOMER,
      'super admin': Permission.SUPER_ADMIN,
      'store owner': Permission.STORE_OWNER,
    };

    const permissions = permissionsData
      .map(p => {
        const name = typeof p === 'string' ? p : p.name;
        return permissionMap[name?.toLowerCase()];
      })
      .filter(p => p !== undefined);

    // Remove duplicates
    const uniquePermissions = [...new Set(permissions)];
    
    return uniquePermissions.length > 0 ? uniquePermissions : [Permission.CUSTOMER];
  }

  async clear() {
    this.logger.log('🧹 Clearing users...');
    
    try {
      // Delete in reverse order to avoid foreign key constraints
      this.logger.log('🗑️ Deleting addresses...');
      await this.addressRepository.delete({});
      
      this.logger.log('🗑️ Deleting profiles...');
      await this.profileRepository.delete({});
      
      this.logger.log('🗑️ Deleting users...');
      await this.userRepository.delete({});
      
      this.logger.log('✅ Users cleared successfully');
    } catch (error) {
      this.logger.error('❌ Failed to clear users:', error.message);
      throw error;
    }
  }

  async seedSpecificUsers(emails: string[]) {
    this.logger.log(`🎯 Seeding specific users: ${emails.join(', ')}`);
    
    try {
      const usersJsonPath = await this.findUsersJsonPath();
      if (!usersJsonPath) {
        this.logger.error('❌ Could not find users.json file');
        return;
      }

      const usersData = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
      const filteredUsers = usersData.filter(u => emails.includes(u.email));
      
      for (const userData of filteredUsers) {
        await this.createOrUpdateUser(userData);
      }
      
      this.logger.log(`✅ Seeded ${filteredUsers.length} specific users`);
    } catch (error) {
      this.logger.error('❌ Failed to seed specific users:', error.message);
    }
  }
}