<?php

namespace KdGraphics\AdvancedColorField\fields;

use Craft;
use craft\base\CrossSiteCopyableFieldInterface;
use craft\base\ElementInterface;
use craft\base\Field;
use craft\base\InlineEditableFieldInterface;
use craft\base\MergeableFieldInterface;
use craft\helpers\Html;
use KdGraphics\AdvancedColorField\assetbundles\InputAssetBundle;
use KdGraphics\AdvancedColorField\assetbundles\SettingsAssetBundle;
use KdGraphics\AdvancedColorField\fields\data\AdvancedColorFieldData;
use yii\db\Schema;

class AdvancedColorFieldField extends Field implements InlineEditableFieldInterface, MergeableFieldInterface, CrossSiteCopyableFieldInterface
{
    public string $customSwatches = '';

    public static function displayName(): string
    {
        return Craft::t('app', 'Advanced Color');
    }

    public static function icon(): string
    {
        return 'palette';
    }

    public static function phpType(): string
    {
        return sprintf('\\%s|null', AdvancedColorFieldData::class);
    }

    public static function dbType(): string
    {
        return sprintf('%s(9)', Schema::TYPE_CHAR);
    }

    public function normalizeValue(mixed $value, ?ElementInterface $element): mixed
    {
        if ($value instanceof AdvancedColorFieldData) {
            return $value;
        }

        if (is_array($value)) {
            $color = trim((string)($value['color'] ?? ''));
            $alpha = (float)($value['alpha'] ?? 100) / 100;
            return $this->createData($color, $alpha);
        }

        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        $parsed = $this->parseColorString($value);
        if ($parsed === null) {
            return null;
        }

        return new AdvancedColorFieldData($parsed['hex'], $parsed['alpha']);
    }

    public function serializeValue(mixed $value, ?ElementInterface $element): mixed
    {
        return $value instanceof AdvancedColorFieldData ? $value->getHex8() : null;
    }

    public function getElementValidationRules(): array
    {
        return [[
            function(ElementInterface $element): void {
                $value = $element->getFieldValue($this->handle);
                if ($value === null || $value instanceof AdvancedColorFieldData) {
                    return;
                }

                $element->addError("field:$this->handle", Craft::t('app', '{attribute} is invalid.', [
                    'attribute' => $this->getUiLabel(),
                ]));
            },
        ]];
    }

    protected function inputHtml(mixed $value, ?ElementInterface $element, bool $inline): string
    {
        /** @var AdvancedColorFieldData|null $value */
        Craft::$app->getView()->registerAssetBundle(InputAssetBundle::class);

        $id = $this->getInputId();
        $hex = $value?->getHex() ?? '#000000';
        $opacity = $value?->getOpacity() ?? 100;

        return Craft::$app->getView()->renderTemplate('advanced-color-field/_fields/advanced-color-field/input', [
            'id' => $id,
            'name' => $this->handle,
            'hex' => $hex,
            'opacity' => $opacity,
            'swatches' => $this->getSwatches(),
            'describedBy' => $this->describedBy,
        ]);
    }

    public function getSettingsHtml(): ?string
    {
        Craft::$app->getView()->registerAssetBundle(SettingsAssetBundle::class);

        return Craft::$app->getView()->renderTemplate('advanced-color-field/_fields/advanced-color-field/settings', [
            'field' => $this,
        ]);
    }

    public function getStaticHtml(mixed $value, ElementInterface $element): string
    {
        /** @var AdvancedColorFieldData|null $value */
        if (!$value) {
            return '';
        }

        return Html::tag('div',
            Html::tag('div', '', [
                'class' => 'color-preview',
                'style' => ['background-color' => $value->getRgba()],
            ]) .
            Html::tag('div', $value->getHex8(), ['class' => ['colorhex', 'code']]),
            ['class' => ['color', 'noteditable']]
        );
    }

    public function getPreviewHtml(mixed $value, ElementInterface $element): string
    {
        /** @var AdvancedColorFieldData|null $value */
        if (!$value) {
            return Html::beginTag('div', ['class' => ['color', 'small', 'static']]) .
                Html::tag('div', options: ['class' => 'color-preview']) .
                Html::endTag('div');
        }

        return Html::beginTag('div', ['class' => ['color', 'small', 'static']]) .
            Html::tag('div', options: [
                'class' => 'color-preview',
                'style' => ['background-color' => $value->getRgba()],
            ]) .
            Html::endTag('div');
    }

    private function createData(string $color, float $alpha): ?AdvancedColorFieldData
    {
        $parsed = $this->parseColorString($color);
        if ($parsed === null) {
            return null;
        }

        return new AdvancedColorFieldData($parsed['hex'], max(0, min(1, $alpha)));
    }

    private function parseColorString(string $value): ?array
    {
        $value = trim(strtolower($value));
        if ($value === '') {
            return null;
        }

        if (str_starts_with($value, 'rgb(') || str_starts_with($value, 'rgba(')) {
            if (!preg_match('/rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?))?\)/', $value, $m)) {
                return null;
            }

            $r = max(0, min(255, (int)$m[1]));
            $g = max(0, min(255, (int)$m[2]));
            $b = max(0, min(255, (int)$m[3]));
            $a = isset($m[4]) ? max(0, min(1, (float)$m[4])) : 1.0;

            return [
                'hex' => sprintf('#%02x%02x%02x', $r, $g, $b),
                'alpha' => $a,
            ];
        }

        if (str_starts_with($value, '#')) {
            $hex = substr($value, 1);
            if (strlen($hex) === 3) {
                $hex = sprintf('%s%s%s%s%s%s', $hex[0], $hex[0], $hex[1], $hex[1], $hex[2], $hex[2]);
                return ['hex' => "#$hex", 'alpha' => 1.0];
            }

            if (strlen($hex) === 4) {
                $hex = sprintf('%s%s%s%s%s%s%s%s', $hex[0], $hex[0], $hex[1], $hex[1], $hex[2], $hex[2], $hex[3], $hex[3]);
            }

            if (strlen($hex) === 6 && ctype_xdigit($hex)) {
                return ['hex' => "#$hex", 'alpha' => 1.0];
            }

            if (strlen($hex) === 8 && ctype_xdigit($hex)) {
                return [
                    'hex' => '#' . substr($hex, 0, 6),
                    'alpha' => hexdec(substr($hex, 6, 2)) / 255,
                ];
            }
        }

        return null;
    }

    private function getSwatches(): array
    {
        $tokens = preg_split('/[\r\n,]+/', $this->customSwatches) ?: [];
        $tokens = array_map(fn(string $value) => trim($value), $tokens);
        $tokens = array_values(array_filter($tokens, fn(string $value) => $value !== ''));

        if (empty($tokens)) {
            return [];
        }

        $swatches = [];
        foreach ($tokens as $token) {
            $parsed = $this->parseColorString($token);
            if ($parsed === null) {
                continue;
            }

            $hex8 = $parsed['hex'];
            if (($parsed['alpha'] ?? 1.0) < 1.0) {
                $hex8 .= str_pad(dechex((int)round(max(0, min(1, (float)$parsed['alpha'])) * 255)), 2, '0', STR_PAD_LEFT);
            }

            $swatches[] = strtolower($hex8);
        }

        return !empty($swatches) ? array_values(array_unique($swatches)) : [];
    }
}
