import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Patient, PatientUpsertInput } from '../types/patient';
import { usePatientMutations } from '../hooks/usePatientMutations';

const patientFormSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['female', 'male', 'other', 'unknown']),
    mrn: z.string().min(1, 'Medical record number is required'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .regex(/^[0-9()+\-\s]*$/, 'Use digits, spaces, parentheses, or dashes')
      .min(7, 'Phone number looks too short')
      .optional()
      .or(z.literal('')),
    primaryProvider: z.string().optional().or(z.literal('')),
    addressLine1: z.string().optional().or(z.literal('')),
    addressLine2: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z
      .string()
      .max(2, 'Use the two-letter state code')
      .optional()
      .or(z.literal('')),
    postalCode: z.string().optional().or(z.literal(''))
  })
  .superRefine((values, ctx) => {
    const addressFields = [values.addressLine1, values.city, values.state, values.postalCode];
    const providedFields = addressFields.filter((value) => Boolean(value?.trim())).length;

    if (providedFields > 0 && providedFields < addressFields.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Complete address requires street, city, state, and postal code.',
        path: ['addressLine1']
      });
    }
  });

export type PatientFormValues = z.infer<typeof patientFormSchema>;

const emptyFormValues: PatientFormValues = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: 'female',
  mrn: '',
  email: '',
  phone: '',
  primaryProvider: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: ''
};

type PatientFormProps = {
  mode: 'create' | 'edit';
  patient?: Patient;
  onCancel: () => void;
  onSuccess: (patientId: string) => void;
};

const toFormValues = (patient?: Patient): PatientFormValues => {
  if (!patient) {
    return emptyFormValues;
  }
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    dob: patient.dob,
    gender: patient.gender,
    mrn: patient.mrn,
    email: patient.email ?? '',
    phone: patient.phone ?? '',
    primaryProvider: patient.primaryProvider ?? '',
    addressLine1: patient.address?.line1 ?? '',
    addressLine2: patient.address?.line2 ?? '',
    city: patient.address?.city ?? '',
    state: patient.address?.state ?? '',
    postalCode: patient.address?.postalCode ?? ''
  } satisfies PatientFormValues;
};

const toPayload = (values: PatientFormValues): PatientUpsertInput => {
  const addressProvided = [values.addressLine1, values.city, values.state, values.postalCode].some(
    (field) => Boolean(field.trim())
  );
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    dob: values.dob,
    gender: values.gender,
    mrn: values.mrn.trim(),
    email: values.email.trim() || undefined,
    phone: values.phone.trim() || undefined,
    primaryProvider: values.primaryProvider.trim() || undefined,
    address: addressProvided
      ? {
          line1: values.addressLine1.trim(),
          line2: values.addressLine2.trim() || undefined,
          city: values.city.trim(),
          state: values.state.trim().toUpperCase(),
          postalCode: values.postalCode.trim()
        }
      : undefined
  };
};

const PatientForm = ({ mode, patient, onCancel, onSuccess }: PatientFormProps): JSX.Element => {
  const defaultValues = useMemo(() => toFormValues(patient), [patient]);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { createMutation, updateMutation } = usePatientMutations();
  const mutation = mode === 'create' ? createMutation : updateMutation;

  const onSubmit = async (values: PatientFormValues) => {
    setSubmissionError(null);
    const payload = toPayload(values);

    try {
      const result =
        mode === 'create'
          ? await createMutation.mutateAsync(payload)
          : await updateMutation.mutateAsync({ id: patient!.id, data: payload });

      onSuccess(result.id);
      if (mode === 'create') {
        reset(emptyFormValues);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save patient data.';
      setSubmissionError(message);
    }
  };

  const isPending = mutation.isPending || isSubmitting;

  const handleCancelClick = () => {
    setSubmissionError(null);
    createMutation.reset();
    updateMutation.reset();
    onCancel();
  };

  return (
    <form className="patient-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <header className="patient-detail-header">
        <div>
          <h2>{mode === 'create' ? 'Create patient' : 'Edit patient'}</h2>
          <p>Fields marked with * are required.</p>
        </div>
      </header>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="firstName">First name *</label>
          <input id="firstName" type="text" {...register('firstName')} />
          {errors.firstName ? <span className="form-error-text">{errors.firstName.message}</span> : null}
        </div>

        <div className="form-field">
          <label htmlFor="lastName">Last name *</label>
          <input id="lastName" type="text" {...register('lastName')} />
          {errors.lastName ? <span className="form-error-text">{errors.lastName.message}</span> : null}
        </div>

        <div className="form-field">
          <label htmlFor="dob">Date of birth *</label>
          <input id="dob" type="date" {...register('dob')} />
          {errors.dob ? <span className="form-error-text">{errors.dob.message}</span> : null}
        </div>

        <div className="form-field">
          <label htmlFor="gender">Gender *</label>
          <select id="gender" {...register('gender')}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="unknown">Unknown</option>
          </select>
          {errors.gender ? <span className="form-error-text">{errors.gender.message}</span> : null}
        </div>

        <div className="form-field">
          <label htmlFor="mrn">Medical record number *</label>
          <input id="mrn" type="text" {...register('mrn')} />
          {errors.mrn ? <span className="form-error-text">{errors.mrn.message}</span> : null}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email')} />
          {errors.email ? <span className="form-error-text">{errors.email.message}</span> : null}
        </div>

        <div className="form-field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" type="tel" {...register('phone')} />
          {errors.phone ? <span className="form-error-text">{errors.phone.message}</span> : null}
        </div>

        <div className="form-field">
          <label htmlFor="primaryProvider">Primary provider</label>
          <input id="primaryProvider" type="text" {...register('primaryProvider')} />
          {errors.primaryProvider ? (
            <span className="form-error-text">{errors.primaryProvider.message}</span>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="addressLine1">Address line 1</label>
          <input id="addressLine1" type="text" {...register('addressLine1')} />
        </div>

        <div className="form-field">
          <label htmlFor="addressLine2">Address line 2</label>
          <input id="addressLine2" type="text" {...register('addressLine2')} />
        </div>

        <div className="form-field">
          <label htmlFor="city">City</label>
          <input id="city" type="text" {...register('city')} />
        </div>

        <div className="form-field">
          <label htmlFor="state">State</label>
          <input id="state" type="text" {...register('state')} />
          {errors.state ? <span className="form-error-text">{errors.state.message}</span> : null}
        </div>

        <div className="form-field">
          <label htmlFor="postalCode">Postal code</label>
          <input id="postalCode" type="text" {...register('postalCode')} />
          {errors.postalCode ? <span className="form-error-text">{errors.postalCode.message}</span> : null}
        </div>
      </div>

      {submissionError ? (
        <div role="alert" className="form-submission-error">
          {submissionError}
        </div>
      ) : null}

      <div className="form-actions">
        <button type="button" onClick={handleCancelClick} disabled={isPending}>
          Cancel
        </button>
        <button type="submit" disabled={isPending}>
          {mode === 'create' ? 'Create patient' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
