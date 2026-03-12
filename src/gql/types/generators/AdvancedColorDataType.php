<?php

namespace KdGraphics\AdvancedColorField\gql\types\generators;

use Craft;
use craft\gql\base\GeneratorInterface;
use craft\gql\base\ObjectType;
use craft\gql\base\SingleGeneratorInterface;
use craft\gql\GqlEntityRegistry;
use GraphQL\Type\Definition\Type;
use KdGraphics\AdvancedColorField\gql\types\AdvancedColorData;

class AdvancedColorDataType implements GeneratorInterface, SingleGeneratorInterface
{
    public static function generateTypes(mixed $context = null): array
    {
        return [static::generateType($context)];
    }

    public static function getName(): string
    {
        return 'AdvancedColorData';
    }

    public static function generateType(mixed $context): ObjectType
    {
        $typeName = self::getName();

        return GqlEntityRegistry::getOrCreate($typeName, fn() => new AdvancedColorData([
            'name' => $typeName,
            'fields' => function() use ($typeName) {
                $fields = [
                    'hex' => Type::string(),
                    'hex8' => Type::string(),
                    'rgb' => Type::string(),
                    'rgba' => Type::string(),
                    'hsl' => Type::string(),
                    'hsla' => Type::string(),
                    'alpha' => Type::float(),
                    'opacity' => Type::int(),
                    'red' => Type::int(),
                    'green' => Type::int(),
                    'blue' => Type::int(),
                ];

                return Craft::$app->getGql()->prepareFieldDefinitions($fields, $typeName);
            },
        ]));
    }
}

