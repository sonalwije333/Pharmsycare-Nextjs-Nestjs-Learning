import { crudFactory } from '@/data/client/curd-factory';
import {
  CreateTagInput,
  QueryOptions,
  Tag,
  TagPaginator,
  TagQueryOptions,
} from '@/types';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';

export const tagClient = {
  ...crudFactory<Tag, QueryOptions, CreateTagInput>(API_ENDPOINTS.TAGS),
  paginated: ({ type, name, ...params }: Partial<TagQueryOptions>) => {
    const queryParams = {
      searchJoin: 'and',
      ...params,
      ...(name ? { name } : {}),
      ...(type ? { hasType: type } : {}),
    };

    return HttpClient.get<TagPaginator>(API_ENDPOINTS.TAGS, {
      ...queryParams,
    });
  },
};
