package com.example.chase.dontpaniceducational;

import android.content.Intent;
import android.content.SharedPreferences;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;

public class SignUpActivity extends AppCompatActivity {
    private EditText signUpFirstName, signUpLastName, signUpEmail, signUpPassword;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sign_up);

        signUpFirstName = (EditText) findViewById(R.id.editText_firstNameSignUp);
        signUpLastName = (EditText) findViewById(R.id.editText_lastNameSignUp);
        signUpEmail = (EditText) findViewById(R.id.editText_emailAddressSignUp);
        signUpPassword = (EditText) findViewById(R.id.editText_passwordSignUp);
    }

    public void userInfo(View view) {
        String stringFirstName = signUpFirstName.getText().toString();
        String stringLastName = signUpLastName.getText().toString();
        String stringEmailAddress = signUpEmail.getText().toString();
        String stringPassword = signUpPassword.getText().toString();
        if (stringFirstName.matches("") || stringLastName.matches("") ||
                stringEmailAddress.matches("") || stringPassword.matches("")) {
            Toast.makeText(this, "You cannot continue because one of the fields is empty.",
                    Toast.LENGTH_SHORT).show();
            return;
        }
        JsonObject json = new JsonObject();
        json.addProperty("email", stringEmailAddress);
        json.addProperty("password", stringPassword);
        json.addProperty("firstName", stringFirstName);
        json.addProperty("lastName", stringLastName);
        Ion.with(this)
                .load("http://www.panic-button.stream/register")
                .setJsonObjectBody(json)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {
                    @Override
                    public void onCompleted(Exception e, JsonObject result) {
                        if (e != null || !result.has("apiToken")) {
                            Toast.makeText(SignUpActivity.this, "Your email or password are not valid. Try again",
                                    Toast.LENGTH_SHORT).show();
                            return;
                        }
                        SharedPreferences settings = getSharedPreferences(result.get("apiToken").toString(), 0);
                        SharedPreferences.Editor editor = settings.edit();
                        editor.commit();
                        Toast.makeText(SignUpActivity.this, result.get("apiToken").toString(), Toast.LENGTH_SHORT).show();
                        Intent intent = new Intent(SignUpActivity.this, PanicActivity.class);
                        startActivity(intent);
                    }
                });
    }

    public void clearFieldsSignUp(View view) {
        signUpFirstName.setText("");
        signUpLastName.setText("");
        signUpEmail.setText("");
        signUpPassword.setText("");
    }
}
