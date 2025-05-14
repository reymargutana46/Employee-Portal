<?php

namespace App\Providers;

use DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('local')) {
            DB::listen(function ($query) {
                info($query->sql);
                info('Bindings: ' . json_encode($query->bindings));
                info('Time: ' . $query->time . 'ms');
            });
        }
    }
}
