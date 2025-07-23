import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';
import { GetTopManufacturersDto } from './dto/get-top-manufacturers.dto';
import { Manufacturer } from './entities/manufacturer.entity';
import {
  GetManufacturersDto,
  ManufacturerPaginator,
} from './dto/get-manufactures.dto';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';

@Controller('manufacturers')
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Get()
  findAll(@Query() query: GetManufacturersDto) {
    return this.manufacturersService.getManufacturersPaginated(query);
  }

  @Get(':slug')
  getManufacturerBySlug(@Param('slug') slug: string) {
    return this.manufacturersService.getBySlug(slug);
  }

  @Post()
  create(@Body() createManufacturerDto: CreateManufacturerDto) {
    return this.manufacturersService.create(createManufacturerDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateManufacturerDto: UpdateManufacturerDto,
  ) {
    return this.manufacturersService.update(id, updateManufacturerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.manufacturersService.remove(id);
  }
}

// @Controller('top-manufacturers')
// export class TopManufacturersController {
//   constructor(private readonly manufacturersService: ManufacturersService) {}

//   @Get()
//   async getTopManufactures(
//     @Query() query: GetTopManufacturersDto,
//   ): Promise<Manufacturer[]> {
//     return this.manufacturersService.getTopManufactures(query);
//   }
// }
