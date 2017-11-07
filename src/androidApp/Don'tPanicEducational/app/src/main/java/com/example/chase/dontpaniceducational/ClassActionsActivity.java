package com.example.chase.dontpaniceducational;

import android.content.Intent;
import android.content.SharedPreferences;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;

public class ClassActionsActivity extends AppCompatActivity {
    private ListView listView;
    private ArrayAdapter<String> arrayAdapter;
    private SharedPreferences mySharedPreferences;
    public static String MY_PREFS = "MY_PREFS";
    int prefMode = JoinClassActivity.MODE_PRIVATE;
    private String token, classId;
    private JsonElement jsonElement;
    private JsonObject jsonObject;
    private String[] classIds;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_class_actions);
        listView = (ListView) findViewById(R.id.listView_classesJoined);
        mySharedPreferences = getSharedPreferences(MY_PREFS, prefMode);
        token = mySharedPreferences.getString("token", null);
        token = token.substring(1, token.length() - 1);
        token = "Bearer ".concat(token);
        listView.setAdapter(arrayAdapter);
        final SharedPreferences.Editor editor = mySharedPreferences.edit();
        Ion.with(this)
                .load("http://www.panic-button.stream/api/v1/classrooms")
                .setHeader("Authorization", "Bearer c9a0094b7710ce5b12fe9e72a23df934a59007d826dac7622b770e08dc43870a13b03f7666e268e9072f8b67ad65d7f5")
                .asJsonArray()
                .setCallback(new FutureCallback<JsonArray>() {
                    @Override
                    public void onCompleted(Exception e, JsonArray result) {
                        if (e != null) {
                            Toast.makeText(ClassActionsActivity.this, "Try again",
                                    Toast.LENGTH_SHORT).show();
                            return;
                        }
                        classIds = new String[result.size()];
                        for (int i = 0; i < result.size(); i++) {
                            jsonElement = result.get(i).getAsJsonObject();
                            jsonObject = jsonElement.getAsJsonObject();
                            classId = jsonObject.get("_id").toString();
                            classIds[i] = classId;
                        }
                    }
                });
        arrayAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, classIds);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
                editor.putString("classroom", listView.getItemAtPosition(i).toString());
                editor.commit();
                Intent intent = new Intent(ClassActionsActivity.this, PanicRoomActivity.class);
                startActivity(intent);
            }
        });
    }

    public void createClass(View view) {
        Intent intent = new Intent(this, CreateClassActivity.class);
        startActivity(intent);
    }

    public void joinClass(View view) {
        Intent intent = new Intent(this, JoinClassActivity.class);
        startActivity(intent);
    }


}
