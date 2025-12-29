/**
 * Domain Form Component
 * Form for creating and editing domains with validation
 */

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { Domain, DomainType, DomainFormData } from '@/types';
import { Button, Input, Select } from '@/components/ui';
import { useDomainStore } from '@/stores/useDomainStore';

interface DomainFormProps {
  domain?: Domain;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

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

const DOMAIN_OPTIONS = [
  {
    value: DomainType.MFG,
    label: 'MFG - Manufacturing',
    description: 'Manufacturing domains (A2, A4, A6, A10, MCO)',
  },
  {
    value: DomainType.LOG,
    label: 'LOG - Logistics',
    description: 'Logistics operations (LOG21)',
  },
  {
    value: DomainType.FCM,
    label: 'FCM - Facility Management',
    description: 'Facility systems (Analyzers, Cameras, Building Systems)',
  },
  {
    value: DomainType.ENG,
    label: 'ENG - Engineering',
    description: 'Engineering test benches and development',
  },
];

export const DomainForm: React.FC<DomainFormProps> = ({
  domain,
  onCancel,
  mode,
}) => {
  const { createDomain, updateDomain, loading } = useDomainStore();
  
  const [formData, setFormData] = useState<DomainFormData>({
    name: domain?.name || DomainType.MFG,
    description: domain?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update form data when domain prop changes
  useEffect(() => {
    if (domain) {
      setFormData({
        name: domain.name,
        description: domain.description,
      });
    }
  }, [domain]);

  const validateField = (name: keyof DomainFormData, value: any) => {
    try {
      domainSchema.pick({ [name]: true }).parse({ [name]: value });
      setErrors(prev => ({ ...prev, [name]: '' }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [name]: error.errors[0]?.message || 'Invalid value',
        }));
      }
    }
  };

  const handleInputChange = (name: keyof DomainFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name: keyof DomainFormData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateForm = (): boolean => {
    try {
      domainSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      description: true,
    });

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        await createDomain(formData);
      } else if (domain) {
        await updateDomain(domain.id, formData);
      }
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const selectedDomainOption = DOMAIN_OPTIONS.find(
    option => option.value === formData.name
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Domain Type Selection */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Domain Type *
        </label>
        <Select
          value={formData.name}
          onChange={(value) => handleInputChange('name', value as DomainType)}
          onBlur={() => handleBlur('name')}
          error={touched.name ? errors.name : undefined}
          placeholder="Select domain type..."
          options={DOMAIN_OPTIONS.map(option => ({
            value: option.value,
            label: option.label,
          }))}
          disabled={mode === 'edit'} // Don't allow changing domain type when editing
        />
        
        {selectedDomainOption && (
          <div className="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-md">
            <p className="text-sm text-primary-700">
              {selectedDomainOption.description}
            </p>
          </div>
        )}
        
        {mode === 'edit' && (
          <p className="mt-1 text-xs text-secondary-500">
            Domain type cannot be changed after creation
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          placeholder="Describe the purpose and scope of this domain..."
          rows={4}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm placeholder-secondary-400
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${touched.description && errors.description
              ? 'border-error-300 focus:ring-error-500 focus:border-error-500'
              : 'border-secondary-300'
            }
          `}
        />
        {touched.description && errors.description && (
          <p className="mt-1 text-sm text-error-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-secondary-500">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Compliance Notice */}
      <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-warning-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-warning-800">
              Bosch Rexroth Compliance
            </h3>
            <div className="mt-2 text-sm text-warning-700">
              <p>
                This domain configuration must comply with Bosch Rexroth IT/OT 
                security policies and network segmentation requirements. All 
                associated VLANs and IP allocations will inherit the security 
                classification of this domain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-secondary-200">
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
        >
          {mode === 'create' ? 'Create Domain' : 'Update Domain'}
        </Button>
      </div>
    </form>
  );
};