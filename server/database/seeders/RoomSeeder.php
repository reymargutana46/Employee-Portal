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
            ['location_name' => 'Building A'],
            ['location_name' => 'Building B'],
            ['location_name' => 'Building C'],
            ['location_name' => 'Building D'],
            ['location_name' => 'Building E'],
        ];

        $rooms = [
            ['room_name' => 'Room 101'],
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
