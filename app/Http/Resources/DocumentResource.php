<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fileName' => $this->file_name,
            'filePath' => $this->file_path,
            'fileType' => $this->file_type ?? $this->type,
            'documentType' => $this->document_type ?? null,
            'fileSize' => $this->file_size,
            'status' => $this->status ?? 'pending',
            'version' => $this->version ?? 1,
            'isCurrent' => (bool) ($this->is_current ?? true),
            'notes' => $this->notes ?? null,
            'reviewedBy' => $this->reviewed_by ?? null,
            'reviewedAt' => isset($this->reviewed_at) ? $this->reviewed_at->format('Y-m-d H:i:s') : null,
            'uploadedAt' => (isset($this->uploaded_at) ? $this->uploaded_at : $this->created_at)?->format('Y-m-d H:i:s'),
            'versions' => DocumentResource::collection($this->whenLoaded('versions')),
        ];
    }
}
