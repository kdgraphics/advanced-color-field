<?php

namespace KdGraphics\AdvancedColorField\fields\data;

use craft\base\Model;
use craft\base\Serializable;
use craft\web\twig\AllowedInSandbox;

#[AllowedInSandbox]
class AdvancedColorFieldData extends Model implements Serializable
{
    private string $_hex;
    private float $_alpha;

    public function __construct(string $hex, float $alpha = 1.0, array $config = [])
    {
        $this->_hex = strtolower($hex);
        $this->_alpha = max(0, min(1, $alpha));
        parent::__construct($config);
    }

    public function __toString(): string
    {
        return $this->getHex8();
    }

    public function serialize(): mixed
    {
        return $this->getHex8();
    }

    public function getHex(): string
    {
        return $this->_hex;
    }

    public function getHex8(): string
    {
        $alpha = (int)round($this->_alpha * 255);
        return sprintf('%s%02x', $this->_hex, $alpha);
    }

    public function getAlpha(): float
    {
        return $this->_alpha;
    }

    public function getOpacity(): int
    {
        return (int)round($this->_alpha * 100);
    }

    public function getRed(): int
    {
        return hexdec(substr($this->_hex, 1, 2));
    }

    public function getGreen(): int
    {
        return hexdec(substr($this->_hex, 3, 2));
    }

    public function getBlue(): int
    {
        return hexdec(substr($this->_hex, 5, 2));
    }

    public function getRgb(): string
    {
        return sprintf('rgb(%d %d %d)', $this->getRed(), $this->getGreen(), $this->getBlue());
    }

    public function getRgba(): string
    {
        return sprintf(
            'rgb(%d %d %d / %s)',
            $this->getRed(),
            $this->getGreen(),
            $this->getBlue(),
            rtrim(rtrim(sprintf('%.3F', $this->_alpha), '0'), '.')
        );
    }

    public function getHsl(): string
    {
        [$h, $s, $l] = $this->hsl();
        return sprintf('hsl(%d %d%% %d%%)', $h, $s, $l);
    }

    public function getHsla(): string
    {
        [$h, $s, $l] = $this->hsl();
        return sprintf(
            'hsl(%d %d%% %d%% / %s)',
            $h,
            $s,
            $l,
            rtrim(rtrim(sprintf('%.3F', $this->_alpha), '0'), '.')
        );
    }

    private function hsl(): array
    {
        $r = $this->getRed() / 255;
        $g = $this->getGreen() / 255;
        $b = $this->getBlue() / 255;

        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $d = $max - $min;
        $l = ($max + $min) / 2;

        if ($d == 0) {
            $h = 0;
            $s = 0;
        } else {
            $s = $d / (1 - abs(2 * $l - 1));
            switch ($max) {
                case $r:
                    $h = 60 * fmod((($g - $b) / $d), 6);
                    if ($h < 0) {
                        $h += 360;
                    }
                    break;
                case $g:
                    $h = 60 * ((($b - $r) / $d) + 2);
                    break;
                default:
                    $h = 60 * ((($r - $g) / $d) + 4);
                    break;
            }
        }

        return [(int)round($h), (int)round($s * 100), (int)round($l * 100)];
    }
}
