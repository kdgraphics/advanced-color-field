<?php

namespace KdGraphics\AdvancedColorField\assetbundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class SettingsAssetBundle extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = dirname(__DIR__) . '/resources/dist';
        $this->depends = [CpAsset::class];
        $this->js = ['settings.js'];
        $this->css = ['settings.css'];

        parent::init();
    }
}
