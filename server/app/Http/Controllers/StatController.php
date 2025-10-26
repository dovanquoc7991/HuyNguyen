<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class StatController extends Controller
{

    public function showStats(Request $request)
    {
        $user = $request->user();
        return response()->json($user->stats->first());
    }
}
