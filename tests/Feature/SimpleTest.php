<?php

test('homepage works', function () {
    $response = $this->get('/');
    $response->assertStatus(200);
});
