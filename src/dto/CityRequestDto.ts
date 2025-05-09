import { IsOptional, IsString, IsBoolean, IsNumber, IsIn, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CityRequestDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  city?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  availability?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['high', 'medium', 'low'])
  @ApiPropertyOptional({ enum: ['high', 'medium', 'low'] })
  priceSegment: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  @Min(100)
  @Max(1000)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  @Min(100)
  @Max(1000)
  maxPrice?: number;
}
