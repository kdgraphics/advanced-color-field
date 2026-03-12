# Advanced color field

A standalone Craft CMS field type that stores color + alpha and provides a modern color picker UI.

## Features

- Field type: **Color (Alpha)**
- Supports HEX, RGB, RGBA, HSL, HSLA editing
- Stores normalized value with alpha support
- Optional custom swatches in field settings
- Twig-friendly output helpers

## Screenshots

### 1. Adding the field
<img src="screenshots/screenshot-1-adding-the-field.png" alt="Adding the field" width="900" />

### 2. Adding custom swatches
<img src="screenshots/screenshot-2-adding-custom-swatches.png" alt="Adding custom swatches" width="420" />

### 3. Field in CP frontend
<img src="screenshots/screenshot-3-field-in-cp-frontend.png" alt="Field in CP frontend" width="360" />

### 4. Color picker modal
<img src="screenshots/screenshot-4-color-picker-modal.png" alt="Color picker modal" width="240" />

## Requirements

- PHP `^8.2`
- Craft CMS `^5.0`

## Installation

Install via Composer:

```bash
composer require kdgraphics/advanced-color-field:^1.0
```

Then install the plugin in Craft:

```bash
php craft plugin/install advanced-color-field
```

## Field usage in Twig

Assuming your field handle is `brandColor`:

```twig
{% set c = entry.brandColor %}
{% if c %}
  {{ c.hex }}
  {{ c.hex8 }}
  {{ c.rgb }}
  {{ c.rgba }}
  {{ c.hsl }}
  {{ c.hsla }}
  {{ c.alpha }}
  {{ c.opacity }}
{% endif %}
```

## License

Craft
