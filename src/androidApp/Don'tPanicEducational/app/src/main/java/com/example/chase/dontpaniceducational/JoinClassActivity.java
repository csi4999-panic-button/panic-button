package com.example.chase.dontpaniceducational;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;

public class JoinClassActivity extends AppCompatActivity {
    private EditText classroom;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_join_class);
        classroom = (EditText) findViewById(R.id.editText_classToJoin);
    }

    public void joinClass(View view) {
        final String classCode = classroom.getText().toString();
        JsonObject json = new JsonObject();
        json.addProperty("inviteCode", classCode);
        Ion.with(this)
                .load("http://www.panic-button.stream/api/v1/classrooms/join")
                .setJsonObjectBody(json)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {
                    @Override
                    public void onCompleted(Exception e, JsonObject result) {
                        if (e != null || !result.get("success").getAsBoolean()) {
                            Toast.makeText(JoinClassActivity.this, "Try again",
                                    Toast.LENGTH_SHORT).show();
                            return;
                        }
                        Toast.makeText(JoinClassActivity.this, "Success", Toast.LENGTH_SHORT).show();
                    }
                });
    }
}
