import { Injectable, PipeTransform } from '@nestjs/common';
import { PageDirectionEnum, PageListRequest } from '@/dto/pagination.dto';

type FormatParams = Partial<Omit<PageListRequest, 'pageSize' | 'page'>>;
@Injectable()
export class PaginationParamsFormatPipe implements PipeTransform {
  private defaultParams: FormatParams = {};
  constructor(
    options: FormatParams = {
      orderBy: 'created_at',
      direction: PageDirectionEnum.DESC,
    },
  ) {
    this.defaultParams = options;
  }

  private getPagValidNumberValue(val, defaultValue = 1): number {
    if (val === null || val === undefined || val === '') {
      return defaultValue;
    }
    return parseInt(val, 10);
  }

  transform(values: PageListRequest) {
    const { page, pageSize, orderBy, direction, ...other } = values;

    return {
      page: this.getPagValidNumberValue(page, 1),
      pageSize: this.getPagValidNumberValue(pageSize, 10),
      orderBy: orderBy || this.defaultParams.orderBy,
      direction: direction || this.defaultParams.direction,
      ...other,
    };
  }
}
