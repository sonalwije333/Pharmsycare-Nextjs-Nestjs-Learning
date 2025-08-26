import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
  ChangePasswordInput,
  ForgetPasswordInput,
  VerifyForgetPasswordTokenInput,
  ResetPasswordInput,
  MakeAdminInput,
  BlockUserInput,
  WalletPointsInput,
  UpdateUser,
  QueryOptionsType,
  UserPaginator,
  UserQueryOptions,
  VendorQueryOptionsType,
  KeyInput,
  LicensedDomainPaginator,
  LicenseAdditionalData,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

// Helper function to convert orderBy to uppercase enum values
const formatOrderBy = (orderBy: string | undefined) => {
  if (!orderBy) return undefined;

  const orderByMap: Record<string, string> = {
    'name': 'NAME',
    'created_at': 'CREATED_AT',
    'updated_at': 'UPDATED_AT',
    'is_active': 'IS_ACTIVE'
  };

  return orderByMap[orderBy.toLowerCase()] || orderBy.toUpperCase();
};

export const userClient = {
  me: () => {
    return HttpClient.get<User>(API_ENDPOINTS.ME);
  },
  login: (variables: LoginInput) => {
    return HttpClient.post<AuthResponse>(API_ENDPOINTS.TOKEN, variables);
  },
  logout: () => {
    return HttpClient.post<any>(API_ENDPOINTS.LOGOUT, {});
  },
  register: (variables: RegisterInput) => {
    return HttpClient.post<AuthResponse>(API_ENDPOINTS.REGISTER, variables);
  },
  update: ({ id, input }: { id: string; input: UpdateUser }) => {
    return HttpClient.put<User>(`${API_ENDPOINTS.USERS}/${id}`, input);
  },
  changePassword: (variables: ChangePasswordInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.CHANGE_PASSWORD, variables);
  },
  forgetPassword: (variables: ForgetPasswordInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.FORGET_PASSWORD, variables);
  },
  verifyForgetPasswordToken: (variables: VerifyForgetPasswordTokenInput) => {
    return HttpClient.post<any>(
      API_ENDPOINTS.VERIFY_FORGET_PASSWORD_TOKEN,
      variables
    );
  },
  resetPassword: (variables: ResetPasswordInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.RESET_PASSWORD, variables);
  },
  makeAdmin: (variables: MakeAdminInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.MAKE_ADMIN, variables);
  },
  block: (variables: BlockUserInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.BLOCK_USER, variables);
  },
  unblock: (variables: BlockUserInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.UNBLOCK_USER, variables);
  },
  addWalletPoints: (variables: WalletPointsInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.ADD_WALLET_POINTS, variables);
  },
  addLicenseKey: (variables: KeyInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.ADD_LICENSE_KEY_VERIFY, variables);
  },

  fetchUsers: ({ name, ...params }: Partial<UserQueryOptions>) => {
    const { orderBy, sortedBy, ...restParams } = params;
    const searchParams = name ? { search: HttpClient.formatSearchParams({ name }) } : {};

    return HttpClient.get<UserPaginator>(API_ENDPOINTS.USERS, {
      searchJoin: 'and',
      with: 'wallet',
      ...restParams,
      orderBy: formatOrderBy(orderBy),
      sortedBy,
      ...searchParams,
    });
  },

  fetchAdmins: ({ name, ...params }: Partial<UserQueryOptions>) => {
    const { orderBy, sortedBy, ...restParams } = params;
    const searchParams = name ? { search: HttpClient.formatSearchParams({ name }) } : {};

    return HttpClient.get<UserPaginator>(API_ENDPOINTS.ADMIN_LIST, {
      searchJoin: 'and',
      with: 'wallet;permissions;profile',
      ...restParams,
      orderBy: formatOrderBy(orderBy),
      sortedBy,
      ...searchParams,
    });
  },

  fetchUser: ({ id }: { id: string }) => {
    return HttpClient.get<User>(`${API_ENDPOINTS.USERS}/${id}`);
  },

  resendVerificationEmail: () => {
    return HttpClient.post<any>(API_ENDPOINTS.SEND_VERIFICATION_EMAIL, {});
  },

  updateEmail: ({ email }: { email: string }) => {
    return HttpClient.post<any>(API_ENDPOINTS.UPDATE_EMAIL, { email });
  },

  fetchVendors: ({ name, is_active, ...params }: Partial<UserQueryOptions>) => {
    const { orderBy, sortedBy, ...restParams } = params;
    const searchParams = (name || is_active !== undefined) ? {
      search: HttpClient.formatSearchParams({ name, is_active })
    } : {};

    return HttpClient.get<UserPaginator>(API_ENDPOINTS.VENDORS_LIST, {
      searchJoin: 'and',
      with: 'wallet;permissions;profile',
      ...restParams,
      orderBy: formatOrderBy(orderBy),
      sortedBy,
      ...searchParams,
    });
  },

  fetchCustomers: ({ name, ...params }: Partial<UserQueryOptions>) => {
    const { orderBy, sortedBy, ...restParams } = params;
    const searchParams = name ? { search: HttpClient.formatSearchParams({ name }) } : {};

    return HttpClient.get<UserPaginator>(API_ENDPOINTS.CUSTOMERS, {
      searchJoin: 'and',
      with: 'wallet',
      ...restParams,
      orderBy: formatOrderBy(orderBy),
      sortedBy,
      ...searchParams,
    });
  },

  getMyStaffs: ({ is_active, shop_id, name, ...params }: Partial<UserQueryOptions & { shop_id: string }>) => {
    const { orderBy, sortedBy, ...restParams } = params;
    const searchParams = (name || is_active !== undefined) ? {
      search: HttpClient.formatSearchParams({ name, is_active })
    } : {};

    return HttpClient.get<UserPaginator>(API_ENDPOINTS.MY_STAFFS, {
      searchJoin: 'and',
      shop_id,
      ...restParams,
      orderBy: formatOrderBy(orderBy),
      sortedBy,
      ...searchParams,
    });
  },

  getAllStaffs: ({ is_active, name, ...params }: Partial<UserQueryOptions>) => {
    const { orderBy, sortedBy, ...restParams } = params;
    const searchParams = (name || is_active !== undefined) ? {
      search: HttpClient.formatSearchParams({ name, is_active })
    } : {};

    return HttpClient.get<UserPaginator>(API_ENDPOINTS.ALL_STAFFS, {
      searchJoin: 'and',
      ...restParams,
      orderBy: formatOrderBy(orderBy),
      sortedBy,
      ...searchParams,
    });
  },
};