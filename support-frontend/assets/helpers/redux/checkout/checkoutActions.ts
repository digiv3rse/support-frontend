import { createAction } from '@reduxjs/toolkit';
import type { PaymentMethod } from 'helpers/forms/paymentMethods';

export const validateForm = createAction<PaymentMethod | undefined>(
	'global/validateForm',
);

export const resetValidation = createAction<PaymentMethod | undefined>(
	'global/resetValidation',
);
