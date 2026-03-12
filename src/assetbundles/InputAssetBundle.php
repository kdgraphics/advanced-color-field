<?php

namespace KdGraphics\AdvancedColorField\assetbundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class InputAssetBundle extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = dirname(__DIR__) . '/resources/dist';
        $this->depends = [CpAsset::class];
        $this->js = ['input.js'];
        $this->css = ['input.css'];

        parent::init();
    }
}
