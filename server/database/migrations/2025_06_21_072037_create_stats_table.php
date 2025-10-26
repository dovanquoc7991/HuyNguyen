<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('latest_reading_score', 2, 1);
            $table->decimal('latest_listening_score', 2, 1);
            $table->integer('total_listening_completed');
            $table->integer('total_reading_completed');
            $table->decimal('best_reading_score', 2, 1);
            $table->decimal('best_listening_score', 2, 1);
            $table->decimal('average_reading_score', 2, 1);
            $table->decimal('average_listening_score', 2, 1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stats');
    }
};
