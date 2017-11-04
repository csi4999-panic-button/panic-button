package com.example.chase.dontpaniceducational;

import android.content.SharedPreferences;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;

public class CreateClassActivity extends AppCompatActivity {
    private EditText classSchoolID, classCourseType, classCourseNumber, classSectionNumber,
            classCourseTitle;
    private SharedPreferences mySharedPreferences;
    public static String MY_PREFS = "MY_PREFS";
    int prefMode = CreateClassActivity.MODE_PRIVATE;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_class);
        //classSchoolID = (EditText) findViewById(R.id.editText_schoolID);
        classCourseType = (EditText) findViewById(R.id.editText_courseType);
        classCourseNumber = (EditText) findViewById(R.id.editText_courseNumber);
        classSectionNumber = (EditText) findViewById(R.id.editText_sectionNumber);
        classCourseTitle = (EditText) findViewById(R.id.editText_courseTitle);
        mySharedPreferences = getSharedPreferences(MY_PREFS, prefMode);
    }

    public void createClassClick(View view) {
        //final String schoolID = classSchoolID.getText().toString();
        final String courseType = classCourseType.getText().toString();
        final String courseNumber = classCourseNumber.getText().toString();
        final String sectionNumber = classSectionNumber.getText().toString();
        final String courseTitle = classCourseTitle.getText().toString();
        if (courseTitle.matches("")) {
            Toast.makeText(this, "You cannot continue, Course Title is required.",
                    Toast.LENGTH_SHORT).show();
            return;
        }
        JsonObject json = new JsonObject();
        //json.addProperty("schoolId", schoolID);
        json.addProperty("courseType", courseType);
        json.addProperty("courseNumber", courseNumber);
        json.addProperty("sectionNumber", sectionNumber);
        json.addProperty("courseTitle", courseTitle);
        Ion.with(this)
                .load("http://www.panic-button.stream/api/v1/classrooms")
                .setJsonObjectBody(json)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {
                    @Override
                    public void onCompleted(Exception e, JsonObject result) {
                        if (e != null) {
                            Toast.makeText(CreateClassActivity.this, "Try again",
                                    Toast.LENGTH_SHORT).show();
                            return;
                        }
                        SharedPreferences.Editor editor = mySharedPreferences.edit();
                        editor.putString("teachers", result.get("teachers").toString());
                        editor.putString("teacherAssistants", result.get("teacherAssistants").toString());
                        editor.putString("students", result.get("students").toString());
                        editor.commit();
                        Toast.makeText(CreateClassActivity.this, "success", Toast.LENGTH_SHORT).show();
                        //Intent intent = new Intent(CreateClassActivity.this, ClassActionsActivity.class);
                        //startActivity(intent);
                    }
                });
    }
}
