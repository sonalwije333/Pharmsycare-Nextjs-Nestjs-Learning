import { PartialType } from '@nestjs/swagger';
import { CreateShelfLocationDto } from './create-shelf-location.dto';

export class UpdateShelfLocationDto extends PartialType(CreateShelfLocationDto) {}
