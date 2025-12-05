# ImageMarker Component

A high-performance React component for adding, editing, and managing markers on images using Konva canvas rendering.

## Features

- ✨ Add markers by clicking on the image
- 🎯 Drag and resize markers
- 🔄 Multi-selection with Ctrl/Cmd + Click
- ⌨️ Delete markers with Delete/Backspace keys
- 📐 Alignment guides when dragging and resizing
- 🎨 Customizable marker styles
- 🔧 TypeScript support with generics
- 📱 Responsive scaling

## Basic Usage

```tsx
import { useState } from 'react';
import { ImageMarker, type Marker, type MarkerChangeEvent } from '@/components';

function Demo() {
    const [markers, setMarkers] = useState<Marker[]>([]);

    const handleMarkersChange = (event: MarkerChangeEvent) => {
        console.log('Change type:', event.type);
        console.log('Changed marker:', event.marker);
        setMarkers(event.markers);
    };

    return (
        <ImageMarker
            width={800}
            height={600}
            image="https://example.com/image.jpg"
            markers={markers}
            onMarkersChange={handleMarkersChange}
        />
    );
}
```

## Using with Generic Types

The component supports TypeScript generics to provide type-safe custom marker data:

```tsx
import { useState, useRef } from 'react';
import { ImageMarker, type Marker, type ImageMarkerProps, type ImageMarkerInstance, type MarkerChangeEvent } from '@/components';

// Define your custom marker data type
interface DeviceData {
    deviceId: string;
    deviceName: string;
    status: 'online' | 'offline';
    temperature?: number;
}

function DeviceMap() {
    const [markers, setMarkers] = useState<Marker<DeviceData>[]>([
        {
            // id: 'device-1',
            position: { x: 30, y: 40 },
            style: {
                backgroundColor: '#52c41a',
                width: 40,
                height: 40,
                border: '2px solid #ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            },
            data: {
                deviceId: '001',
                deviceName: 'Temperature Sensor A',
                status: 'online',
                temperature: 25.5,
            },
        },
    ]);

    // Use the same generic type for ref
    const markerRef = useRef<ImageMarkerInstance<DeviceData>>(null);

    const handleMarkersChange = (event: MarkerChangeEvent<DeviceData>) => {
        console.log('Change type:', event.type);
        console.log('Device data:', event.marker.data);
        setMarkers(event.markers);
    };

    const handleMarkerClick: ImageMarkerProps<DeviceData>['onMarkerClick'] = (event, marker) => {
        // marker.data is fully typed as DeviceData
        console.log('Device ID:', marker.data?.deviceId);
        console.log('Status:', marker.data?.status);
        console.log('Temperature:', marker.data?.temperature);
    };

    const handleAddDevice = () => {
        // Type-safe marker creation
        markerRef.current?.addMarker({
            position: { x: 50, y: 50 },
            style: { backgroundColor: '#1890ff' },
            data: {
                deviceId: '002',
                deviceName: 'Sensor B',
                status: 'online',
            },
        });
    };

    return (
        <>
            <button onClick={handleAddDevice}>Add Device</button>
            <ImageMarker<DeviceData>
                ref={markerRef}
                width="100%"
                height={600}
                image="https://example.com/floor-plan.jpg"
                markers={markers}
                onMarkersChange={handleMarkersChange}
                onMarkerClick={handleMarkerClick}
                onMarkerDoubleClick={(event, marker) => {
                    alert(`Device: ${marker.data?.deviceName}`);
                }}
            />
        </>
    );
}
```

### Using Popup Feature

```tsx
function FloorPlanWithPopup() {
    const [markers, setMarkers] = useState<Marker<DeviceData>[]>([
        {
            id: '1',
            position: { x: 30, y: 40 },
            content: '🌡️',
            data: {
                deviceId: '001',
                deviceName: 'Temperature Sensor',
                status: 'online',
                temperature: 22.5,
            },
        },
    ]);

    return (
        <ImageMarker<DeviceData>
            width="100%"
            height={600}
            image="https://example.com/floor-plan.jpg"
            markers={markers}
            editable={false} // Disable edit mode to enable popup
            enablePopup={true}
            popupTrigger="click" // or "hover"
            renderPopup={(marker) => (
                <div>
                    <h4>{marker.data?.deviceName}</h4>
                    <p>Status: {marker.data?.status}</p>
                    <p>Temperature: {marker.data?.temperature}°C</p>
                </div>
            )}
            onMarkersChange={setMarkers}
        />
    );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number \| string` | `'100%'` | Container width |
| `height` | `number \| string` | `'100%'` | Container height |
| `image` | `string` | - | Image source (URL or base64) |
| `markers` | `Marker<T>[]` | `[]` | Array of markers |
| `defaultMarkerStyle` | `Partial<DefaultMarkerStyle>` | - | Default marker style configuration |
| `editable` | `boolean` | `true` | Allow adding, editing markers (add by clicking, drag, resize) |
| `deletable` | `boolean` | `true` | Allow deleting markers (Delete/Backspace) |
| `keepAspectRatio` | `boolean` | `true` | Keep aspect ratio when resizing |
| `resizeStep` | `number` | `0.1` | Resize step size in pixels (max: 5) |
| `showAlignmentGuides` | `boolean` | `true` | Show alignment guides when dragging |
| `alignmentThreshold` | `number` | `5` | Alignment guide threshold in pixels |
| `alignmentLineColor` | `string` | `'#8e66ff'` | Alignment guide line color |
| `enablePopup` | `boolean` | `false` | Enable marker popup (disabled in edit mode) |
| `popupTrigger` | `'hover' \| 'click'` | `'hover'` | Popup trigger type |
| `renderPopup` | `(marker: Marker<T>) => ReactNode` | - | Custom popup content renderer |
| `onMarkersChange` | `(event: MarkerChangeEvent<T>) => void` | - | Callback when markers change |
| `onMarkerClick` | `(event: KonvaEventObject<MouseEvent>, marker: Marker<T>) => void` | - | Callback when a marker is clicked |
| `onMarkerDoubleClick` | `(event: KonvaEventObject<MouseEvent>, marker: Marker<T>) => void` | - | Callback when a marker is double-clicked |
| `onImageLoaded` | `(imageSize: ImageSize) => void` | - | Callback when image is loaded |
| `onImageError` | `(error: Event) => void` | - | Callback when image fails to load |
| `renderMarker` | `(marker: Marker<T>, isSelected: boolean) => ReactNode` | - | Custom marker renderer |
| `minMarkerWidth` | `number` | `16` | Minimum marker width |
| `minMarkerHeight` | `number` | `16` | Minimum marker height |
| `idPrefix` | `string` | `'marker'` | Prefix for auto-generated IDs |
| `className` | `string` | - | Custom class name |
| `style` | `CSSProperties` | - | Custom style |

## Type Definitions

### Marker

```typescript
interface Marker<T = unknown> {
    id: string;                    // Unique identifier
    position: MarkerPosition;      // Position (percentage-based)
    style?: MarkerStyle;           // Style configuration
    content?: ReactNode;           // Content to render
    data?: T;                      // Custom data (generic type)
}
```

### MarkerPosition

```typescript
interface MarkerPosition {
    x: number;  // X coordinate (0-100%)
    y: number;  // Y coordinate (0-100%)
}
```

### MarkerStyle

```typescript
interface MarkerStyle {
    width?: number;                // Width in pixels (original image coordinates)
    height?: number;               // Height in pixels (original image coordinates)
    borderRadius?: number | string;
    backgroundColor?: string;
    border?: string;               // CSS border format: "2px solid #ff0000"
    boxShadow?: string;            // CSS box-shadow format: "0 2px 8px rgba(0,0,0,0.15)"
}
```

**Note**: `border` and `boxShadow` use CSS-style strings and will be parsed to Konva properties:
- `border`: Format is `"<width>px <style> <color>"` (e.g., `"2px solid #ff0000"`)
- `boxShadow`: Format is `"<offsetX>px <offsetY>px <blur>px <color>"` (e.g., `"0 2px 8px rgba(0,0,0,0.15)"`)


### MarkerChangeEvent

```typescript
interface MarkerChangeEvent<T = unknown> {
    type: 'add' | 'update' | 'delete';  // Change type
    marker: Marker<T>;                   // Changed marker
    markers: Marker<T>[];                // All markers after change
}
```

### ImageSize

```typescript
interface ImageSize {
    naturalWidth: number;   // Original image width
    naturalHeight: number;  // Original image height
    width: number;          // Displayed image width
    height: number;         // Displayed image height
    scale: number;          // Scale ratio
}
```

## Instance Methods

Access component methods via `ref`:

```tsx
import { useRef } from 'react';
import { ImageMarker, type ImageMarkerInstance } from '@/components';

interface MyData {
    name: string;
}

function Demo() {
    const markerRef = useRef<ImageMarkerInstance<MyData>>(null);

    const handleAddMarker = () => {
        // All methods are type-safe with the generic type
        const newMarker = markerRef.current?.addMarker({
            position: { x: 50, y: 50 },
            style: { backgroundColor: '#ff0000' },
            data: { name: 'Custom Point' },
        });
        console.log('Added marker:', newMarker);
    };

    const handleGetMarkers = () => {
        const allMarkers = markerRef.current?.getMarkers();
        // allMarkers is typed as Marker<MyData>[]
        allMarkers?.forEach(marker => {
            console.log('Marker name:', marker.data?.name);
        });
    };

    return (
        <>
            <button onClick={handleAddMarker}>Add Marker</button>
            <button onClick={handleGetMarkers}>Get All Markers</button>
            <ImageMarker<MyData> ref={markerRef} image="..." />
        </>
    );
}
```

### Available Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `addMarker` | `(marker: Omit<Marker<T>, 'id'> & { id?: string }) => Marker<T>` | Add a marker programmatically |
| `updateMarker` | `(id: string, updates: Partial<Omit<Marker<T>, 'id'>>) => void` | Update a marker by ID |
| `deleteMarker` | `(id: string) => void` | Delete a marker by ID |
| `getMarkers` | `() => Marker<T>[]` | Get all markers |
| `getMarkerById` | `(id: string) => Marker<T> \| undefined` | Get a marker by ID |
| `clearSelection` | `() => void` | Clear current selection |
| `selectMarkers` | `(ids: string[]) => void` | Select markers by IDs |
| `getSelectedIds` | `() => string[]` | Get selected marker IDs |
| `getImageSize` | `() => ImageSize \| null` | Get image size information |

## Advanced Examples

### Custom Marker Rendering

```tsx
interface MarkerData {
    label: string;
    color: string;
}

<ImageMarker<MarkerData>
    image="..."
    renderMarker={(marker, isSelected) => (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: marker.data?.color || '#1890ff',
            border: isSelected ? '2px solid #fff' : '1px solid #ccc',
            borderRadius: '50%',
            color: '#fff',
            fontWeight: 'bold',
        }}>
            {marker.data?.label || marker.id}
        </div>
    )}
/>
```

### Responsive Container

The component automatically scales the image and markers based on the container size:

```tsx
<div style={{ width: '100%', height: '100vh' }}>
    <ImageMarker
        image="https://example.com/large-image.jpg"
        markers={markers}
        onMarkersChange={handleChange}
    />
</div>
```

### Event Handling with Konva Events

```tsx
<ImageMarker
    image="..."
    markers={markers}
    onMarkerClick={(event, marker) => {
        // Access native event
        console.log('Click position:', event.evt.clientX, event.evt.clientY);

        // Access Konva event
        console.log('Target:', event.target);

        // Access marker data
        console.log('Marker ID:', marker.id);
        console.log('Marker data:', marker.data);
    }}
    onMarkerDoubleClick={(event, marker) => {
        // Prevent default behavior
        event.cancelBubble = true;

        // Open edit dialog, etc.
        openEditDialog(marker);
    }}
/>
```

### Dynamic Marker Updates

```tsx
function Demo() {
    const markerRef = useRef<ImageMarkerInstance>(null);

    const updateMarkerPosition = (id: string, x: number, y: number) => {
        markerRef.current?.updateMarker(id, {
            position: { x, y },
        });
    };

    const updateMarkerStyle = (id: string, color: string) => {
        markerRef.current?.updateMarker(id, {
            style: { backgroundColor: color },
        });
    };

    return <ImageMarker ref={markerRef} image="..." />;
}
```

## Keyboard Shortcuts

- **Esc**: Clear selection and exit edit mode
- **Arrow Keys**: Move selected markers (1px step in original image coordinates)
  - Hold **Shift + Arrow Keys**: Move with larger steps (10px)
  - Hold **Ctrl/Cmd + Arrow Keys**: Move with smaller steps (0.1px for precise positioning)
- **Delete / Backspace**: Delete selected markers
- **Ctrl/Cmd + Click**: Multi-select markers
- **Click on empty area**: Clear selection (when `editable` is false) or add new marker (when `editable` is true)

## Notes

- Marker positions are stored as percentages (0-100) of the image dimensions for responsive scaling
- Marker sizes (width/height) are stored in original image coordinates
- The component automatically handles image aspect ratio and scaling
- Multi-selection resize applies transformations to all selected markers simultaneously
- **Resize step**: Marker dimensions are automatically rounded to the nearest `resizeStep` value (default: 0.1px, max: 5px) during resize operations. This ensures consistent sizing increments.
- **Marker popup**:
  - Popups are only enabled when `enablePopup` is `true` and `editable` is `false`
  - Supports two trigger modes: `hover` (default) or `click`
  - If no `renderPopup` function is provided, the popup displays the marker's `content`
  - Popup content can be customized using the `renderPopup` prop
  - Uses MUI Tooltip component for positioning and styling with automatic arrow placement
- **Alignment guides**:
  - When dragging: Shows guides for all four edges (top, bottom, left, right) of the marker
  - When resizing: Shows guides only for the two edges near the active resize handle
    - Top-left handle: Shows guides for left and top edges
    - Top-right handle: Shows guides for right and top edges
    - Bottom-left handle: Shows guides for left and bottom edges
    - Bottom-right handle: Shows guides for right and bottom edges
  - Alignment guides only appear for single marker selection
  - Guide threshold can be customized via `alignmentThreshold` prop (default: 5px)
