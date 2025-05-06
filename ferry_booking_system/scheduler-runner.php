<?php
$basePath = __DIR__;
require $basePath . '/vendor/autoload.php';

$app = require_once $basePath . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$pidFile = $basePath . '/storage/app/scheduler.pid';
file_put_contents($pidFile, getmypid());

echo "Laravel Scheduler started at " . date('Y-m-d H:i:s') . PHP_EOL;

while (true) {
    $startTime = microtime(true);
    echo "Running scheduler: " . date('Y-m-d H:i:s') . PHP_EOL;

    $kernel->call('schedule:run');

    $endTime = microtime(true);
    $executionTime = $endTime - $startTime;
    $sleepTime = max(0, 60 - $executionTime);

    echo "Next run in {$sleepTime} seconds" . PHP_EOL;
    sleep($sleepTime);
}