import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PropertyRequestDto } from './dto/PropertyRequestDto';
import { CityRequestDto } from './dto/CityRequestDto';

@ApiTags('Properties')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('properties')
  @ApiOperation({ summary: 'Get filtered list of properties' })
  async getProperties(
    @Query() query: PropertyRequestDto
  ) {
    return await this.appService.getProperties(query);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get filtered list of cities' })
  async getCities(
    @Query() query: CityRequestDto
  ) {
    return await this.appService.getCities(query);
  }
}
