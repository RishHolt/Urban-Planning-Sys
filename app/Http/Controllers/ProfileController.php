<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile.
     */
    public function show(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user) {
            $user->load(['profile', 'departmentRelation']);
        }

        return Inertia::render('Profile', [
            'user' => $user,
        ]);
    }

    /**
     * Update the user's profile.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validated();

        if ($user->profile) {
            $user->profile->update($validated);
        } else {
            $user->profile()->create(array_merge($validated, ['user_id' => $user->id]));
        }

        return redirect()->route('profile')->with('success', 'Profile updated successfully.');
    }
}
