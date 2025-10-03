<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Room;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            ['location_name' => 'Building 1'],
            ['location_name' => 'Building 2'],
            ['location_name' => 'Building 3'],
            ['location_name' => 'Building 4'],
            ['location_name' => 'Building 5'],
            ['location_name' => 'Building 6'],
            ['location_name' => 'Building 7'],
            ['location_name' => 'Building 8'],

        ];

        $rooms = [
            ['room_name' => 'MATATAG'],
            ['room_name' => 'Room 102'],
            ['room_name' => 'Room 103'],
            ['room_name' => 'Room 104'],
            ['room_name' => 'Room 105'],
        ];

        foreach ($locations as $index => $locationData) {
            $location = Location::create([
                'name' => $locationData['location_name'],
            ]);

            // Ensure room assignment is within bounds
            if (isset($rooms[$index])) {
                Room::create([
                    'name' => $rooms[$index]['room_name'],
                    'location_id' => $location->id, // Associate the room with the created location
                ]);
            }
        }



    }
}
