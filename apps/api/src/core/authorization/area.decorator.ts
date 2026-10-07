import { SetMetadata } from '@nestjs/common';

export const AREA_KEY = 'orison_area';
export const Area = (area: 'school' | 'platform') => SetMetadata(AREA_KEY, area);
