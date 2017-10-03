package com.example.chase.dontpaniceducational;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

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
        if (stringFirstName.matches("") || stringLastName.matches("") || stringEmailAddress.matches("") || stringPassword.matches("")) {
            Toast.makeText(this, "You cannot continue because one of the fields is empty.", Toast.LENGTH_SHORT).show();
            return;
        }
        Intent intent = new Intent(this, PanicActivity.class);
        startActivity(intent);
    }

    public void clearFieldsSignUp(View view) {
        signUpFirstName.setText("");
        signUpLastName.setText("");
        signUpEmail.setText("");
        signUpPassword.setText("");
    }
}
