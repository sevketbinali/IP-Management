/**
 * Domain Form Component
 * Form for creating and editing domains with comprehensive validation
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Domain, DomainType, DomainFormData } from '@/types';
import { Button, Input, Select } from '@/components/ui';
import { useDomainStore } from '@/stores/useDomainStore';

const domainSchema = z.object({
  name: z.nativeEnum(DomainType, {
    errorMap: () => ({ message: 'Please select a valid domain type' }),
  }),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
});

interface DomainFormProps {
  domain?: Domain;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const DomainForm: React.FC<DomainFormProps> = ({ domain, onCancel, mode }) => {
  const { createDomain, updateDomain, loading } = useDomainStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      name: domain?.name || DomainType.MFG,
      description: domain?.description || '',
    },
    mode: 'onChange',
  });

  const selectedDomainType = watch('name');

  const domainTypeOptions = [
    {
      value: DomainType.MFG,
      label: 'Manufacturing (MFG)',
      description: 'Production lines: A2, A4, A6, A10, MCO',
    },
    {
      value: DomainType.LOG,
      label: 'Logistics (LOG)',
      description: 'Logistics operations: LOG21',
    },
    {
      value: DomainType.FCM,
      label: 'Facility Management (FCM)',
      description: 'Analyzers, Cameras, Building Systems',
    },
    {
      value: DomainType.ENG,
      label: 'Engineering (ENG)',
      description: 'Engineering Test Benches',
    },
  ];

  const getDefaultDescription = (domainType: DomainType): string => {
    switch (domainType) {
      case DomainType.MFG:
        return 'Manufacturing domain covering production lines A2, A4, A6, A10, and MCO. Includes all manufacturing equipment, PLCs, HMIs, and production monitoring systems.';
      case DomainType.LOG:
        return 'Logistics domain for LOG21 operations. Covers warehouse management systems, conveyor controls, sorting equipment, and logistics tracking devices.';
      case DomainType.FCM:
        return 'Facility Management domain including environmental analyzers, security cameras, HVAC systems, lighting controls, and building automation systems.';
      case DomainType.ENG:
        return 'Engineering domain for test benches and development equipment. Includes prototype testing systems, measurement devices, and engineering workstations.';
      default:
        return '';
    }
  };

  const handleDomainTypeChange = (value: string): void => {
    const domainType = value as DomainType;
    setValue('name', domainType);
    
    // Auto-fill description if it's empty or matches a default description
    const currentDescription = watch('description');
    if (!currentDescription || Object.values(DomainType).some(type => 
      currentDescription === getDefaultDescription(type)
    )) {
      setValue('description', getDefaultDescription(domainType));
    }
  };

  const onSubmit = async (data: DomainFormData): Promise<void> => {
    try {
      if (mode === 'create') {
        await createDomain(data);
      } else if (domain) {
        await updateDomain(domain.id, data);
      }
    } catch (error) {
      // Error handling is managed by the store
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Domain Type Selection */}
      <Select
        label="Domain Type"
        value={selectedDomainType}
        onChange={handleDomainTypeChange}
        options={domainTypeOptions}
        error={errors.name?.message}
        required
        helperText="Select the business domain type for network organization"
      />

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Description <span className="text-error-500">*</span>
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          placeholder="Describe the domain's purpose, scope, and included systems..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
        )}
        <p className="mt-1 text-xs text-secondary-500">
          Provide a detailed description of what this domain encompasses, including specific 
          equipment, systems, and operational areas.
        </p>
      </div>

      {/* Domain Type Information */}
      <div className="rounded-md bg-primary-50 border border-primary-200 p-4">
        <h4 className="text-sm font-medium text-primary-800 mb-2">
          {domainTypeOptions.find(opt => opt.value === selectedDomainType)?.label} Domain
        </h4>
        <p className="text-sm text-primary-700">
          {domainTypeOptions.find(opt => opt.value === selectedDomainType)?.description}
        </p>
        <div className="mt-3 text-xs text-primary-600">
          <strong>Security Considerations:</strong>
          <ul className="mt-1 list-disc list-inside space-y-1">
            {selectedDomainType === DomainType.MFG && (
              <>
                <li>Manufacturing zones require MFZ_SL4 security level</li>
                <li>Production systems must be isolated from office networks</li>
                <li>Real-time communication protocols need dedicated VLANs</li>
              </>
            )}
            {selectedDomainType === DomainType.LOG && (
              <>
                <li>Logistics zones require LOG_SL4 security level</li>
                <li>Warehouse systems need segregated network access</li>
                <li>RFID and tracking systems require dedicated subnets</li>
              </>
            )}
            {selectedDomainType === DomainType.FCM && (
              <>
                <li>Facility zones require FMZ_SL4 security level</li>
                <li>Building systems need controlled network access</li>
                <li>Camera systems require high-bandwidth dedicated VLANs</li>
              </>
            )}
            {selectedDomainType === DomainType.ENG && (
              <>
                <li>Engineering zones require ENG_SL4 security level</li>
                <li>Test systems need isolated development networks</li>
                <li>Measurement devices require precise timing networks</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={!isValid}
        >
          {mode === 'create' ? 'Create Domain' : 'Update Domain'}
        </Button>
      </div>
    </form>
  );
};

export { DomainForm };