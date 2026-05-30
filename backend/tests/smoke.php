<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/src'));
foreach ($files as $file) {
    if ($file->getExtension() === 'php') {
        $cmd = 'php -l ' . escapeshellarg($file->getPathname());
        exec($cmd, $output, $code);
        if ($code !== 0) {
            echo implode(PHP_EOL, $output) . PHP_EOL;
            exit($code);
        }
    }
}
foreach (['/public/index.php'] as $file) {
    exec('php -l ' . escapeshellarg($root . $file), $output, $code);
    if ($code !== 0) { echo implode(PHP_EOL, $output) . PHP_EOL; exit($code); }
}
echo "Smoke checks passed\n";
