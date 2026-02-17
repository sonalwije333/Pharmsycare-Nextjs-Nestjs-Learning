import Alert from '@/components/ui/alert';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from '@/components/ui/link';
import {
  allowedRoles,
  hasAccess,
  setAuthCredentials,
} from '@/utils/auth-utils';
import { Permission } from '@/types';
import { useRegisterMutation } from '@/data/user';
import Select from '../ui/select/select';

type FormValues = {
  name: string;
  email: string;
  password: string;
  permission: Permission;
};

// Define available roles for selection
const availableRoles = [
  { value: Permission.SuperAdmin, label: 'Super Admin' },
  { value: Permission.StoreOwner, label: 'Store Owner' },
  { value: Permission.Staff, label: 'Staff' },
  { value: Permission.Customer, label: 'Customer' },
];

const registrationFormSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup.string().required('form:error-password-required'),
  permission: yup
    .string()
    .required('form:error-role-required')
    .oneOf(Object.values(Permission)),
});

const RegistrationForm = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { mutate: registerUser, isLoading: loading } = useRegisterMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: yupResolver(registrationFormSchema),
    defaultValues: {
      permission: undefined,
    },
  });

  const router = useRouter();
  const { t } = useTranslation();

  async function onSubmit({ name, email, password, permission }: FormValues) {
    registerUser(
      {
        name,
        email,
        password,
        permission,
      },
      {
        onSuccess: (data) => {
          if (data?.token) {
            // If user has dashboard access (admin)
            if (hasAccess(allowedRoles, data?.permissions)) {
              setAuthCredentials(data?.token, data?.permissions, data?.role);
              router.push(Routes.dashboard);
              return;
            }

            // If user is customer
            if (data?.permissions?.includes(Permission.Customer)) {
              setSuccessMessage(
                'Registration successful! Please login to continue.',
              );
              // Redirect to login page after 3 seconds
              setTimeout(() => {
                router.push(Routes.login);
              }, 3000);
              return;
            }

            setErrorMessage('form:error-enough-permission');
          } else {
            setErrorMessage('form:error-credential-wrong');
          }
        },
        onError: (error: any) => {
          // Handle validation errors
          if (error?.response?.data) {
            if (typeof error.response.data === 'object') {
              Object.keys(error.response.data).forEach((field: any) => {
                setError(field, {
                  type: 'manual',
                  message: error?.response?.data[field],
                });
              });
            } else {
              setErrorMessage(error.response.data);
            }
          } else {
            setErrorMessage('form:error-credential-wrong');
          }
        },
      },
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label={t('form:input-label-name')}
          {...register('name')}
          variant="outline"
          className="mb-4"
          error={t(errors?.name?.message!)}
        />
        <Input
          label={t('form:input-label-email')}
          {...register('email')}
          type="email"
          variant="outline"
          className="mb-4"
          error={t(errors?.email?.message!)}
        />
        <PasswordInput
          label={t('form:input-label-password')}
          {...register('password')}
          error={t(errors?.password?.message!)}
          variant="outline"
          className="mb-4"
        />

        {/* Role Selection Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black-900 mb-1">
            {t('form:input-label-role')}
          </label>
          <Controller
            name="permission"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={availableRoles.map((role) => ({
                  ...role,
                  label: t(`form:role-${role.value}`),
                }))}
                value={availableRoles.find(
                  (option) => option.value === field.value,
                )}
                onChange={(option) => field.onChange(option?.value)}
              />
            )}
          />
          {errors.permission && (
            <p className="mt-1 text-xs text-red-500">
              {t(errors.permission.message!)}
            </p>
          )}
        </div>

        <Button className="w-full" loading={loading} disabled={loading}>
          {t('form:text-register')}
        </Button>

        {errorMessage && (
          <Alert
            message={t(errorMessage)}
            variant="error"
            closeable={true}
            className="mt-5"
            onClose={() => setErrorMessage(null)}
          />
        )}

        {successMessage && (
          <Alert message={successMessage} variant="success" className="mt-5" />
        )}
      </form>
      <div className="relative flex flex-col items-center justify-center mt-8 mb-6 text-sm text-heading sm:mt-11 sm:mb-8">
        <hr className="w-full" />
        <span className="start-2/4 -ms-4 absolute -top-2.5 bg-light px-2">
          {t('common:text-or')}
        </span>
      </div>
      <div className="text-sm text-center text-body sm:text-base">
        {t('form:text-already-account')}{' '}
        <Link
          href={Routes.login}
          className="font-semibold underline transition-colors duration-200 ms-1 text-accent hover:text-accent-hover hover:no-underline focus:text-accent-700 focus:no-underline focus:outline-none"
        >
          {t('form:button-label-login')}
        </Link>
      </div>
    </>
  );
};

export default RegistrationForm;
