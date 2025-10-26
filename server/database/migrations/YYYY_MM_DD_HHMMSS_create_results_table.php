<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateResultsTable extends Migration
{
    public function up()
    {
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('part_id');
            $table->integer('correct_count');
            $table->integer('total');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unsignedBigInteger('section_id');
            $table->foreign('section_id')->references('id')->on('sections')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('results');
    }
}