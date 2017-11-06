package com.example.chase.dontpaniceducational;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

public class PanicRoomActivity extends AppCompatActivity {
    private TextView numberOfPanicStudents;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_panic_room);
        numberOfPanicStudents = (TextView) findViewById(R.id.textView_numberOfPanickedStudents);
    }

    public void panicButtonClick(View view) {

    }
}
