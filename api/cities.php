<?php
/**
 * City API Endpoint
 * Returns all Indian cities from the cities.json data file.
 * 
 * Usage:
 *   GET /api/cities          - Returns all cities
 *   GET /api/cities?q=chen   - Search cities by name (optional)
 *   GET /api/cities?state=Tamil Nadu - Filter by state (optional)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Cache-Control: public, max-age=86400'); // Cache for 24 hours

// Load cities data
$citiesFile = __DIR__ . '/../data/cities.json';

if (!file_exists($citiesFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Cities data file not found']);
    exit;
}

$citiesJson = file_get_contents($citiesFile);
$cities = json_decode($citiesJson, true);

if ($cities === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to parse cities data']);
    exit;
}

// Optional: Filter by search query
if (isset($_GET['q']) && !empty(trim($_GET['q']))) {
    $query = strtolower(trim($_GET['q']));
    $cities = array_values(array_filter($cities, function($city) use ($query) {
        return stripos($city['name'], $query) !== false;
    }));
}

// Optional: Filter by state
if (isset($_GET['state']) && !empty(trim($_GET['state']))) {
    $state = strtolower(trim($_GET['state']));
    $cities = array_values(array_filter($cities, function($city) use ($state) {
        return strtolower($city['state']) === $state;
    }));
}

// Return the response
echo json_encode([
    'success' => true,
    'count'   => count($cities),
    'cities'  => $cities
]);
