/**
 * Create Post Form
 * Uses react-hook-form + zod for validation.
 * UI is composed from shared FormInput / FormSelect / FormDateTimePicker components.
 */

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { Button } from '@/shared/ui/button';
import { FormInput, FormSelect, FormDateTimePicker, FormFieldWrapper } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { ACTIVITY_TYPES } from '../forms';
import { useCreatePost } from '../hooks';
import type { CreatePostInput } from '../types';

// ── Zod schema ────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Max 500 characters').optional(),
  activityType: z.string().min(1, 'Please select an activity type'),
  vibe: z.enum(['Chill', 'Energetic', 'Creative', 'Networking', 'Fun']).optional(),
  latitude: z.number({ invalid_type_error: 'Pick a location on the map' }).min(-90).max(90),
  longitude: z.number({ invalid_type_error: 'Pick a location on the map' }).min(-180).max(180),
  scheduledTime: z
    .string()
    .refine((v) => v.includes('T'), 'Please select both date and time')
    .refine((v) => new Date(v) > new Date(), 'Scheduled time must be in the future'),
  requiredParticipants: z
    .number({ invalid_type_error: 'Enter a number' })
    .int()
    .min(1, 'At least 1 person required')
    .max(100, 'Maximum 100 people'),
  rolesNeeded: z
    .array(
      z.object({
        role: z.string().min(1, 'Role name required'),
        count: z.number().int().min(1, 'At least 1'),
      }),
    )
    .optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [13.0827, 80.2707];
const RADIUS_METERS = 5000;

const VIBE_OPTIONS = [
  { value: 'Chill', label: '😌 Chill' },
  { value: 'Energetic', label: '⚡ Energetic' },
  { value: 'Creative', label: '🎨 Creative' },
  { value: 'Networking', label: '🤝 Networking' },
  { value: 'Fun', label: '🎉 Fun' },
];

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Map sub-components ────────────────────────────────────────────────────────

function LocationPicker({
  userCenter,
  onPick,
}: {
  userCenter: [number, number];
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e: { latlng: { lat: number; lng: number } }) {
      const { lat, lng } = e.latlng;
      if (getDistanceMeters(lat, lng, userCenter[0], userCenter[1]) <= RADIUS_METERS) {
        onPick(lat, lng);
      } else {
        alert('Please select a location within 5 km of your current location.');
      }
    },
  });
  return null;
}

function MapFitBounds({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.fitBounds(
      L.latLngBounds(
        L.latLng(center[0] - 0.05, center[1] - 0.05),
        L.latLng(center[0] + 0.05, center[1] + 0.05),
      ),
      { padding: [50, 50] },
    );
  }, [map, center[0], center[1]]);
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const userId = window.userId;
  const createPostMutation = useCreatePost();

  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null);
  const [pickedLocation, setPickedLocation] = React.useState<[number, number] | null>(null);
  const [showRoles, setShowRoles] = React.useState(false);

  React.useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLocation([...DEFAULT_CENTER]),
    );
  }, []);

  const center = userLocation ?? DEFAULT_CENTER;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    register,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      activityType: '',
      vibe: undefined,
      latitude: undefined as unknown as number,
      longitude: undefined as unknown as number,
      scheduledTime: '',
      requiredParticipants: undefined as unknown as number,
      rolesNeeded: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rolesNeeded' });

  const lat = watch('latitude');
  const lng = watch('longitude');

  const onPick = (pickedLat: number, pickedLng: number) => {
    setValue('latitude', pickedLat, { shouldValidate: true });
    setValue('longitude', pickedLng, { shouldValidate: true });
    setPickedLocation([pickedLat, pickedLng]);
  };

  const onSubmit = async (values: FormValues) => {
    await createPostMutation.mutateAsync({
      ...values,
      rolesNeeded: showRoles ? values.rolesNeeded : undefined,
      createdById: userId,
    } as CreatePostInput);
    reset();
    setPickedLocation(null);
    setShowRoles(false);
    onSuccess?.();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {/* ── Card 1: Basic Info ── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-5">
          <FormInput
            control={control}
            name="title"
            label="Activity Title"
            placeholder="e.g., Rooftop Jam Session"
            hint="Be descriptive so others know what to expect"
            required
          />

          {/* Description textarea */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="What's the plan? Any gear needed? Skill level?"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <FormSelect
            control={control}
            name="activityType"
            label="Activity Type"
            placeholder="Select a category"
            options={ACTIVITY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            required
          />

          <FormSelect
            control={control}
            name="vibe"
            label="Vibe"
            placeholder="What's the vibe? (optional)"
            options={VIBE_OPTIONS}
          />
        </div>

        {/* ── Card 2: Location ── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          <FormFieldWrapper label="Location" hint="Click on the map to pin your activity location">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <Input
                value={lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : ''}
                readOnly
                disabled
                placeholder="Click the map to select a location"
                className="text-sm bg-gray-50 flex-1"
              />
            </div>
          </FormFieldWrapper>

          <div>
            <Label className="text-sm font-semibold text-slate-700 block mb-2">
              Pick Location on Map
            </Label>
            {/* Isolation wrapper — creates a new stacking context so Leaflet's
                internal z-indices never bleed above popovers/modals. */}
            <div style={{ isolation: 'isolate', position: 'relative', zIndex: 0 }}>
              {/* @ts-ignore */}
              <MapContainer
                center={center as any}
                zoom={13}
                style={{
                  height: '280px',
                  width: '100%',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                }}
                scrollWheelZoom
                minZoom={12}
              >
                {/* @ts-ignore */}
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapFitBounds center={center} />
                <LocationPicker userCenter={center} onPick={onPick} />
                {/* @ts-ignore */}
                <Circle
                  center={center as any}
                  radius={RADIUS_METERS}
                  pathOptions={{
                    color: '#3b82f6',
                    weight: 2,
                    fillColor: '#3b82f6',
                    fillOpacity: 0.15,
                    dashArray: '5, 5',
                  }}
                />
                {pickedLocation && (
                  // @ts-ignore
                  <Marker position={pickedLocation as any} icon={markerIcon as any} />
                )}
              </MapContainer>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              The <strong>blue dashed circle</strong> shows your 5 km allowed area.
            </p>
          </div>
        </div>

        {/* ── Card 3: Schedule ── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <FormDateTimePicker
            control={control}
            name="scheduledTime"
            dateLabel="Date"
            timeLabel="Time"
            required
          />
        </div>

        {/* ── Card 4: People Needed ── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">👥</span>
            <span className="text-sm font-semibold text-slate-700">People Needed</span>
          </div>
          <FormInput
            control={control}
            name="requiredParticipants"
            type="number"
            min={1}
            max={100}
            step={1}
            placeholder="e.g., 6"
            hint="How many people do you need total?"
          />

          {/* Roles toggle */}
          <div>
            {!showRoles ? (
              <button
                type="button"
                onClick={() => {
                  setShowRoles(true);
                  if (fields.length === 0) append({ role: '', count: 1 });
                }}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
              >
                <span>+</span> Add Roles{' '}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700">Roles Needed</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoles(false);
                      // clear the array but keep fields for re-open
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Hide roles
                  </button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      {...register(`rolesNeeded.${index}.role`)}
                      placeholder="Role name (e.g., Guitarist)"
                      className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number"
                      {...register(`rolesNeeded.${index}.count`, { valueAsNumber: true })}
                      min={1}
                      max={50}
                      placeholder="Count"
                      className="w-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-slate-400 hover:text-red-500 text-lg leading-none px-1"
                      aria-label="Remove role"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {errors.rolesNeeded && (
                  <p className="text-xs text-red-500">Check role fields above</p>
                )}
                <button
                  type="button"
                  onClick={() => append({ role: '', count: 1 })}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                >
                  <span>+</span> Add Another Role
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              reset();
              setPickedLocation(null);
              setShowRoles(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isSubmitting || createPostMutation.isPending}
          >
            {isSubmitting || createPostMutation.isPending ? 'Creating…' : 'Create Activity'}
          </Button>
        </div>

        {createPostMutation.isError && (
          <p className="text-sm text-red-500 text-center">{createPostMutation.error?.message}</p>
        )}
      </form>
    </div>
  );
}
