
import { Author } from '../entities/author.entity';
import {PaginationArgs} from "../../common/dto/pagination-args.dto";
import {SortOrder} from "../../common/dto/generic-conditions.dto";
import {Paginator} from "../../common/dto/paginator.dto";

export class AuthorPaginator extends Paginator<Author> {
  // data: Author[];
}

export class GetAuthorDto extends PaginationArgs {
  orderBy?: QueryAuthorsOrderByColumn;
  // sortedBy?: SortOrder;
  search?: string;
  language?: string;
}

export enum QueryAuthorsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}
