/**
 * Shared form primitives — react-hook-form + shadcn/ui
 *
 * Exports:
 *   FormFieldWrapper  — label + hint + error shell
 *   FormInput         — shadcn Input controlled by react-hook-form
 *   FormSelect        — shadcn Radix Select controlled by react-hook-form
 *   FormDateTimePicker — Calendar popover + time input, single ISO field
 */

import * as React from 'react';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';

import { cn } from '@/shared/utils/cn';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './shadcn-select';

// ── FormFieldWrapper ──────────────────────────────────────────────────────────

interface FormFieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export function FormFieldWrapper({
  label,
  hint,
  error,
  required,
  className,
  children,
  htmlFor,
}: FormFieldWrapperProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

// ── FormInput ─────────────────────────────────────────────────────────────────

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  hint?: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  placeholder,
  type = 'text',
  min,
  max,
  step,
  disabled,
  required,
  className,
}: FormInputProps<T>) {
  const id = `field-${name}`;
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });

  return (
    <FormFieldWrapper
      htmlFor={id}
      label={label}
      hint={hint}
      error={error?.message}
      required={required}
      className={className}
    >
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        name={field.name}
        onBlur={field.onBlur}
        ref={field.ref}
        value={
          type === 'number'
            ? field.value === undefined || field.value === null
              ? ''
              : field.value
            : (field.value ?? '')
        }
        onChange={(e) => {
          if (type === 'number') {
            // Use valueAsNumber for accurate integer/float parsing
            const v = e.target.valueAsNumber;
            field.onChange(isNaN(v) ? undefined : v);
          } else {
            field.onChange(e.target.value);
          }
        }}
      />
    </FormFieldWrapper>
  );
}

// ── FormSelect ────────────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  hint?: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  placeholder,
  options,
  disabled,
  required,
  className,
}: FormSelectProps<T>) {
  const id = `field-${name}`;
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });

  return (
    <FormFieldWrapper
      htmlFor={id}
      label={label}
      hint={hint}
      error={error?.message}
      required={required}
      className={className}
    >
      <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder ?? 'Select…'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
}

// ── FormDateTimePicker ────────────────────────────────────────────────────────
// Single ISO field (e.g. "2026-03-21T18:00") with Calendar popover + time input.

interface FormDateTimePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  dateLabel?: string;
  timeLabel?: string;
  required?: boolean;
  className?: string;
  /** Disable dates before today (default: true) */
  disablePast?: boolean;
}

export function FormDateTimePicker<T extends FieldValues>({
  control,
  name,
  dateLabel = 'Date',
  timeLabel = 'Time',
  required,
  className,
  disablePast = true,
}: FormDateTimePickerProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });
  const [open, setOpen] = React.useState(false);

  const isoValue: string = field.value ?? '';
  const [datePart, timePart] = isoValue.split('T');

  const selectedDate = datePart ? new Date(`${datePart}T00:00:00`) : undefined;

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    const d = format(day, 'yyyy-MM-dd');
    field.onChange(timePart ? `${d}T${timePart}` : d);
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    const d = datePart || format(new Date(), 'yyyy-MM-dd');
    field.onChange(t ? `${d}T${t}` : d);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {/* ── Date Picker ── */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-slate-700">
          {dateLabel}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal h-10 border-slate-300 hover:border-slate-400 bg-white',
                !selectedDate && 'text-slate-400',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-70 p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDaySelect}
              disabled={disablePast ? { before: today } : undefined}
              autoFocus
            />
          </PopoverContent>
        </Popover>
        {error && <p className="text-xs text-red-500">{error.message}</p>}
      </div>

      {/* ── Time Input ── */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {timeLabel}
        </Label>
        <Input
          type="time"
          value={timePart ?? ''}
          onBlur={field.onBlur}
          onChange={handleTimeChange}
          className="h-10"
        />
      </div>
    </div>
  );
}
