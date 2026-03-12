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
![Adding the field](screenshots/screenshot-1-adding-the-field.png)

### 2. Adding custom swatches
![Adding custom swatches](screenshots/screenshot-2-adding-custom-swatches.png)

### 3. Field in CP frontend
![Field in CP frontend](screenshots/screenshot-3-field-in-cp-frontend.png)

### 4. Color picker modal
![Color picker modal](screenshots/screenshot-4-color-picker-modal.png)

## Requirements

- PHP `^8.2`
- Craft CMS `^5.0`

## Installation (local plugin)

1. Ensure the plugin exists at `plugins/advanced-color-field`.
2. Add path repository + require in your site `composer.json` if needed.
3. Run composer install/update.
4. Install plugin from Craft CP or CLI:

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
