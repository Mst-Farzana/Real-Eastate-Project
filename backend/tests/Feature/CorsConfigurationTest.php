<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsConfigurationTest extends TestCase
{
    public function test_vercel_origin_is_allowed_for_api_preflight_requests(): void
    {
        config(['cors.allowed_origins' => ['https://real-eastate-project-gules.vercel.app']]);

        $response = $this->call('OPTIONS', '/api/auth/register', [], [], [], [
            'HTTP_ORIGIN' => 'https://real-eastate-project-gules.vercel.app',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'content-type,accept',
        ]);

        $response
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'https://real-eastate-project-gules.vercel.app');
    }

    public function test_vercel_preview_origin_is_allowed_for_api_preflight_requests(): void
    {
        $origin = 'https://real-eastate-project-jelz760en-mst-farzanas-projects.vercel.app';

        $response = $this->call('OPTIONS', '/api/properties', [], [], [], [
            'HTTP_ORIGIN' => $origin,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'accept',
        ]);

        $response
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', $origin);
    }
}
