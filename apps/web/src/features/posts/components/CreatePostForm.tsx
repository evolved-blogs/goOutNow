/**
 * Create Post Form Component
 * Uses TanStack Form for form state and validation
 * No business logic - purely presentational
 */

import { useForm } from '@tanstack/react-form';
import React from 'react';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { createPostSchema, ACTIVITY_TYPES, DEFAULT_FORM_VALUES } from '../forms';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useCreatePost } from '../hooks';
import type { CreatePostInput } from '../types';

interface CreatePostFormProps {
  /** Called after the post is successfully created */
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const createPostMutation = useCreatePost();
  // Get userId from window (set in main.tsx)
  const userId = window.userId;

  const form = useForm({
    defaultValues: DEFAULT_FORM_VALUES,
    onSubmit: async ({ value }) => {
      // Always attach userId as createdById
      const postData = {
        ...value,
        createdById: userId,
      };
      await createPostMutation.mutateAsync(postData as CreatePostInput);
      form.reset();
      onSuccess?.();
    },
    validatorAdapter: zodValidator(),
  });

  // Dynamic map center (user location)
  const DEFAULT_CENTER: [number, number] = [13.0827, 80.2707]; // fallback: Chennai
  const RADIUS_METERS = 5000; // 5km
  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setUserLocation([...DEFAULT_CENTER]); // fallback
        },
      );
    } else {
      setUserLocation([...DEFAULT_CENTER]);
    }
  }, []);

  // Custom marker icon (fixes missing default icon in Leaflet)
  const markerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  // Map click handler component
  // Haversine formula for distance in meters
  function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371000; // Earth radius in meters
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function LocationPicker() {
    const center = userLocation || DEFAULT_CENTER;
    useMapEvents({
      click(e: any) {
        const { lat, lng } = e.latlng;
        const dist = getDistanceMeters(lat, lng, center[0], center[1]);
        if (dist <= RADIUS_METERS) {
          form.setFieldValue('latitude', lat);
          form.setFieldValue('longitude', lng);
        } else {
          alert('Please select a location within 5km of your current location.');
        }
      },
    });
    return null;
  }

  // Component to fit map bounds to show the 5km circle
  function MapFitBounds() {
    const map = useMap();
    const center = userLocation || DEFAULT_CENTER;

    React.useEffect(() => {
      if (map && center) {
        // Calculate bounds from center and radius
        const bounds = L.latLngBounds(
          L.latLng(center[0] - 0.05, center[1] - 0.05),
          L.latLng(center[0] + 0.05, center[1] + 0.05),
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [map, center]);

    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        {/* Card 1: Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-5">
          {/* Title Field */}
          <form.Field name="title" validators={{ onChange: createPostSchema.shape.title }}>
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                  Activity Title
                </Label>
                <Input
                  id="title"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Beach Cricket Match"
                  className="text-sm"
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</p>
                )}
                <p className="text-xs text-slate-400">
                  Be descriptive so others know what to expect
                </p>
              </div>
            )}
          </form.Field>

          {/* Activity Type Field */}
          <form.Field
            name="activityType"
            validators={{ onChange: createPostSchema.shape.activityType }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="activityType" className="text-sm font-semibold text-slate-700">
                  Activity Type
                </Label>
                <Select
                  id="activityType"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="text-sm"
                >
                  <option value="">Select an activity type</option>
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                {field.state.meta.errors?.length > 0 && (
                  <p className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* Card 2: Location */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          {/* Location display */}
          <form.Field name="latitude" validators={{ onChange: createPostSchema.shape.latitude }}>
            {(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <Label htmlFor="location" className="text-sm font-semibold text-slate-700">
                    Location
                  </Label>
                </div>
                <Input
                  id="location"
                  value={
                    field.state.value && form.state.values.longitude
                      ? `${field.state.value.toFixed(4)}, ${form.state.values.longitude.toFixed(4)}`
                      : ''
                  }
                  disabled
                  placeholder="e.g., Marina Beach, Chennai"
                  className="text-sm bg-gray-50"
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</p>
                )}
                <p className="text-xs text-slate-400">Tap to select from map or type address</p>
              </div>
            )}
          </form.Field>

          {/* Map Picker */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 block mb-2">
              Pick Location on Map
            </Label>
            {/* @ts-ignore */}
            <MapContainer
              center={(userLocation || DEFAULT_CENTER) as any}
              zoom={13}
              style={{
                height: '280px',
                width: '100%',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
              }}
              scrollWheelZoom={true}
              minZoom={12}
            >
              {/* @ts-ignore */}
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFitBounds />
              <LocationPicker />
              {/* @ts-ignore */}
              <Circle
                center={(userLocation || DEFAULT_CENTER) as any}
                radius={RADIUS_METERS}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 2,
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  dashArray: '5, 5',
                }}
              />
              {form.state.values.latitude && form.state.values.longitude && (
                // @ts-ignore
                <Marker
                  position={[form.state.values.latitude, form.state.values.longitude] as any}
                  icon={markerIcon as any}
                />
              )}
            </MapContainer>
            <p className="text-xs text-slate-400 mt-2">
              The <strong>blue dashed circle</strong> shows your 5km allowed area. Click on the map
              to select a location within this radius.
            </p>
          </div>

          {/* Hidden longitude field */}
          <div className="hidden">
            <form.Field
              name="longitude"
              validators={{ onChange: createPostSchema.shape.longitude }}
            >
              {(field) => (
                <Input
                  type="number"
                  step="any"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                />
              )}
            </form.Field>
          </div>
        </div>

        {/* Card 3: Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="scheduledTime"
              validators={{ onChange: createPostSchema.shape.scheduledTime }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-sm font-semibold text-slate-700">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={field.state.value.split('T')[0] || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = field.state.value.split('T')[1] || '12:00';
                      field.handleChange(`${date}T${time}`);
                    }}
                    className="text-sm"
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="scheduledTime"
              validators={{ onChange: createPostSchema.shape.scheduledTime }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🕐</span>
                    <Label htmlFor="time" className="text-sm font-semibold text-slate-700">
                      Time
                    </Label>
                  </div>
                  <Input
                    id="time"
                    type="time"
                    value={field.state.value.split('T')[1] || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const time = e.target.value;
                      const date =
                        field.state.value.split('T')[0] || new Date().toISOString().split('T')[0];
                      field.handleChange(`${date}T${time}`);
                    }}
                    className="text-sm"
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {/* Card 4: Players Needed */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <form.Field
            name="requiredPlayers"
            validators={{ onChange: createPostSchema.shape.requiredPlayers }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <Label htmlFor="requiredPlayers" className="text-sm font-semibold text-slate-700">
                    Players Needed
                  </Label>
                </div>
                <Input
                  id="requiredPlayers"
                  type="number"
                  min="2"
                  max="100"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(parseInt(e.target.value, 10))}
                  placeholder="e.g., 10"
                  className="text-sm"
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</p>
                )}
                <p className="text-xs text-slate-400">How many players do you need?</p>
              </div>
            )}
          </form.Field>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-6">
          <Button type="button" variant="outline" className="flex-1" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={
              createPostMutation.isPending ||
              !form.state.values.title ||
              !form.state.values.activityType ||
              !form.state.values.scheduledTime ||
              !form.state.values.latitude ||
              !form.state.values.longitude ||
              form.state.isValidating
            }
          >
            {createPostMutation.isPending ? 'Creating...' : 'Create Activity'}
          </Button>
        </div>

        {/* Error Message */}
        {createPostMutation.isError && (
          <p className="text-sm text-red-500 text-center">{createPostMutation.error.message}</p>
        )}

        {/* Success Message */}
        {createPostMutation.isSuccess && (
          <p className="text-sm text-green-600 text-center">Activity created successfully!</p>
        )}
      </form>
    </div>
  );
}
