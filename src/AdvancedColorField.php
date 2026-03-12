<?php

namespace KdGraphics\AdvancedColorField;

use KdGraphics\AdvancedColorField\fields\AdvancedColorFieldField;
use Craft;
use craft\events\RegisterComponentTypesEvent;
use craft\events\RegisterTemplateRootsEvent;
use craft\services\Fields;
use craft\web\View;
use yii\base\Event;
use craft\base\Plugin;

class AdvancedColorField extends Plugin
{
    public static ?self $plugin = null;

    public string $schemaVersion = '1.0.0';
    public bool $hasCpSettings = false;
    public bool $hasCpSection = false;

    public function init(): void
    {
        parent::init();
        self::$plugin = $this;

        $this->registerTranslations();

        Event::on(
            View::class,
            View::EVENT_REGISTER_CP_TEMPLATE_ROOTS,
            function(RegisterTemplateRootsEvent $event): void {
                $event->roots['advanced-color-field'] = __DIR__ . '/templates';
            }
        );

        Event::on(
            Fields::class,
            Fields::EVENT_REGISTER_FIELD_TYPES,
            static function(RegisterComponentTypesEvent $event): void {
                $event->types[] = AdvancedColorFieldField::class;
            }
        );
    }

    private function registerTranslations(): void
    {
        if (!isset(Craft::$app->i18n->translations['advanced-color-field'])) {
            Craft::$app->i18n->translations['advanced-color-field'] = [
                'class' => \craft\i18n\PhpMessageSource::class,
                'sourceLanguage' => 'en-US',
                'basePath' => __DIR__ . '/translations',
                'forceTranslation' => true,
                'allowOverrides' => true,
            ];
        }
    }
}
