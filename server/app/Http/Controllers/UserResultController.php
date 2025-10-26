<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Result;

class UserResultController extends Controller
{
    public function lastResult(Request $request)
    {
        \Log::info('API /user/last-result called', [
            'user_id' => Auth::id(),
            'sectionID' => $request->query('sectionID')
        ]);
        $user = Auth::user();
        $sectionID = $request->query('sectionID');

        if (!$sectionID) {
            return response()->json(['error' => 'Missing sectionID'], 400);
        }

        $result = Result::where('user_id', $user->id)
            ->where('section_id', $sectionID)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$result) {
            return response('', 204);
        }

        return response()->json([
            'correctCount' => $result->correct_count,
            'total' => $result->total,
        ]);
    }

    public function saveResult(Request $request)
{

    \Log::info('API /user/save-result called', [
            'user_id' => Auth::id(),
            'sectionID' => $request->input('sectionID')
        ]);
    $user = Auth::user();
    $sectionID = $request->input('sectionID');
    $correctCount = $request->input('correctCount');
    $total = $request->input('total');

    if (!$sectionID || $correctCount === null || $total === null) {
        return response()->json(['error' => 'Missing data'], 400);
    }

    // Lưu kết quả mới
    $result = Result::create([
        'user_id' => $user->id,
        'section_id' => $sectionID,
        'correct_count' => $correctCount,
        'total' => $total,
    ]);

    return response()->json(['success' => true, 'result_id' => $result->id]);
}
}