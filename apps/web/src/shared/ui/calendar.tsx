/**
 * shadcn/ui Calendar — built on react-day-picker v9
 * Uses concrete Tailwind classes (no CSS variable utilities).
 */
import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3 select-none', className)}
      classNames={{
        months: 'flex flex-col gap-2',
        month: 'flex flex-col gap-3',
        month_caption: 'flex justify-center pt-1 pb-1 relative items-center',
        caption_label: 'text-sm font-semibold text-slate-800',
        nav: 'absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none',
        button_previous: cn(
          'pointer-events-auto h-7 w-7 p-0 flex items-center justify-center',
          'rounded-md border border-slate-200 bg-white text-slate-600',
          'hover:bg-slate-50 hover:border-slate-300 transition-colors',
        ),
        button_next: cn(
          'pointer-events-auto h-7 w-7 p-0 flex items-center justify-center',
          'rounded-md border border-slate-200 bg-white text-slate-600',
          'hover:bg-slate-50 hover:border-slate-300 transition-colors',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex mb-1',
        weekday: 'text-slate-400 rounded-md w-9 text-center font-normal text-[0.75rem]',
        week: 'flex w-full',
        day: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
        day_button: cn(
          'h-9 w-9 p-0 font-normal rounded-md text-slate-700',
          'hover:bg-purple-50 hover:text-purple-700 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
        ),
        selected:
          '[&>button]:!bg-purple-600 [&>button]:!text-white [&>button]:hover:!bg-purple-700',
        today: '[&>button]:font-bold [&>button]:text-purple-600',
        outside: '[&>button]:text-slate-300 [&>button]:hover:bg-transparent',
        disabled: '[&>button]:text-slate-300 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
