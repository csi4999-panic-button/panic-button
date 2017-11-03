package com.example.chase.dontpaniceducational;

import android.content.Intent;
import android.content.SharedPreferences;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;

public class JoinClassActivity extends AppCompatActivity {
    private EditText classroom;
    private TextView textView;
    public static String MY_PREFS = "MY_PREFS";
    private SharedPreferences mySharedPreferences;
    int prefMode = JoinClassActivity.MODE_PRIVATE;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_join_class);
        classroom = (EditText) findViewById(R.id.editText_classToJoin);
        mySharedPreferences = getSharedPreferences(MY_PREFS, prefMode);
        textView = (TextView) findViewById(R.id.textView_classList);
    }

    public void listClasses(View view) {
        final String apiToken = mySharedPreferences.getString("apiToken", null);
        final String token = "Bearer ".concat(apiToken);
        Ion.with(this)
                .load("http://www.panic-button.stream/api/v1/classrooms")
                .setHeader("Authorization", token)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {
                    @Override
                    public void onCompleted(Exception e, JsonObject result) {
                        if (e != null || !result.has("teachers")) {
                            Toast.makeText(JoinClassActivity.this, "One of the fields is not valid. Try again",
                                    Toast.LENGTH_SHORT).show();
                            return;
                        }
                        textView.setText(result.get("students").toString());
                        Toast.makeText(JoinClassActivity.this, "Success", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    public void joinClass(View view) {
        final String classInviteCode = classroom.getText().toString();
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
                        if (e != null || !result.get("success").toString().equals("true")) {
                            Toast.makeText(JoinClassActivity.this, "Try again",
                                    Toast.LENGTH_SHORT).show();
                            return;
                        }
                        Toast.makeText(JoinClassActivity.this, "Success", Toast.LENGTH_SHORT).show();
                    }
                });
    }
}
