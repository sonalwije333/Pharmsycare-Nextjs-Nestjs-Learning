import { PickType } from '@nestjs/swagger';
import { Permission, User } from '../entities/user.entity';
import { CreateAddressDto } from '../../addresses/dto/create-address.dto';
import { PermissionType } from '../../../common/enums/enums';
import { CreateProfileDto } from './create-profile.dto';

export class CreateUserDto extends PickType(User, [
  'name',
  'email',
  'password',
]) {
  address: CreateAddressDto[];
  profile: CreateProfileDto;
  permission: PermissionType = PermissionType.CUSTOMER;
}
