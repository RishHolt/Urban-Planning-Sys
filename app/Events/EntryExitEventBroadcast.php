<?php

namespace App\Events;

use App\Models\EntryExitEvent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EntryExitEventBroadcast implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public EntryExitEvent $event,
        public int $currentOccupancy,
        public int $maxOccupancy
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('occupancy-dashboard'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'entry-exit-event';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        // Convert Unix timestamp to ISO 8601 string
        $timestamp = is_int($this->event->timestamp)
            ? date('c', $this->event->timestamp)
            : $this->event->timestamp;

        return [
            'event' => [
                'id' => $this->event->id,
                'type' => $this->event->type,
                'person_id' => $this->event->person_id,
                'timestamp' => $timestamp,
                'device_id' => $this->event->device_id,
            ],
            'occupancy' => [
                'current' => $this->currentOccupancy,
                'max' => $this->maxOccupancy,
            ],
        ];
    }
}
