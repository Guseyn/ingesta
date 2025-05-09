import { IsOptional, IsString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PropertyRequestDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  @Min(1)
  id?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  country?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  city?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(1000)
  @ApiPropertyOptional()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(1000)
  @ApiPropertyOptional()
  maxPrice?: number;
}
